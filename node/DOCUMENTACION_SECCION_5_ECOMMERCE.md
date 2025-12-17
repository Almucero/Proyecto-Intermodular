# DOCUMENTACIÓN TÉCNICA - VOLUMEN IV: E-COMMERCE CORE

**Proyecto: Plataforma de Videojuegos (Backend Node.js/Express)**

> **Nota**: Este documento corresponde a la **Segunda Parte de la Sección 5** del Índice Maestro. Cubre el núcleo del negocio: Catálogo, Carrito y Sistema de Pedidos.

---

### 5.3 Módulo de Juegos (`/src/modules/games`)

Este módulo es el más complejo en términos de lectura de datos, diseñado para permitir una exploración flexible del catálogo.

#### 5.3.1 Rutas y Endpoints (`games.routes.ts`)

| Método    | Endpoint | Query Params                                   | Descripción                         |
| :-------- | :------- | :--------------------------------------------- | :---------------------------------- |
| **GET**   | `/`      | `?title`, `?minPrice`, `?genre`, `?include`... | Búsqueda facetada de juegos.        |
| **GET**   | `/:id`   | -                                              | Ficha técnica del juego.            |
| **POST**  | `/`      | -                                              | (Admin) Crear juego con relaciones. |
| **PATCH** | `/:id`   | -                                              | (Admin) Editar juego.               |

#### 5.3.2 Lógica de Búsqueda Avanzada (`filters`)

El servicio `listGames` implementa un patrón de "Query Builder Dinámico".
No se escribe una consulta SQL fija; en su lugar, se construye el objeto `where` de Prisma programáticamente.

**Snippet de Construcción de Filtros (`games.service.ts`):**

```typescript
const where: any = {};

// 1. Filtros de Texto (Insensitive)
if (filters?.title) {
  where.title = { contains: filters.title, mode: "insensitive" };
}

// 2. Filtros de Rango (Precios)
if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
  where.price = {};
  if (filters?.minPrice !== undefined) where.price.gte = filters.minPrice;
  if (filters?.maxPrice !== undefined) where.price.lte = filters.maxPrice;
}

// 3. Filtros Relacionales (N:M)
// Busca juegos donde "alguno" (some) de los géneros coincida con el nombre
if (filters?.genre) {
  where.genres = {
    some: { name: { contains: filters.genre, mode: "insensitive" } },
  };
}
```

#### 5.3.3 Inclusión Dinámica de Relaciones (`include`)

Para evitar el "Over-fetching" (traer demasiados datos) o "Under-fetching" (traer pocos), el cliente decide qué relaciones cargar mediante el parámetro `?include=genres,media`.

- El backend parsea este string a un `Set` y condicionalmente añade claves al objeto `select` de Prisma.

---

### 5.4 Sistema de Compras (`/src/modules/cart` & `/src/modules/purchases`)

Gestiona el flujo transaccional "De la intención a la orden".

#### 5.4.1 Gestión del Carrito (`cart.service.ts`)

El carrito no es una sesión volátil, sino una tabla persistente (`CartItem`).

- **Estrategia `Upsert`**: Al agregar un ítem, no verificamos manualmente si existe. Usamos `prisma.upsert`.
  - _Si existe_: `update: { quantity: { increment: quantity } }`.
  - _Si no existe_: `create: { ... }`.
  - _Clave_: La restricción única compuesta `@@unique([userId, gameId, platformId])` en el esquema hace esto posible.

#### 5.4.2 Flujo de Checkout (`purchases.service.ts`)

El proceso de compra en la versión actual sigue un flujo secuencial:

**1. Validación de Intención**
Recibe una lista de IDs de items del carrito (`cartItemIds`). Verifica que pertenezcan al usuario y existan realmente.

```typescript
const cartItems = await prisma.cartItem.findMany({
  where: { id: { in: cartItemIds }, userId },
  include: { game: true },
});
```

**2. Cálculo de Confianza (Server-Side)**
El precio **NO** viene del frontend. Se recalcula sumando `item.game.price * quantity`. Esto evita manipulación de precios por parte del cliente.

**3. Persistencia de la Orden (Nested Write)**
Se crea la Cabecera (`Purchase`) y los Detalles (`PurchaseItem`) en una sola operación de escritura anidada de Prisma.

```typescript
const purchase = await prisma.purchase.create({
  data: {
    userId,
    totalPrice,
    status: "completed",
    items: {
      create: cartItems.map((item) => ({
        gameId: item.gameId,
        price: item.game.price, // Precio congelado al momento de compra
        quantity: item.quantity,
      })),
    },
  },
});
```

**4. Limpieza**
Una vez creada la orden, se eliminan los ítems procesados del carrito.

```typescript
await prisma.cartItem.deleteMany({
  where: { id: { in: cartItemIds }, userId },
});
```

> **Nota Técnica**: Actualmente la implementación realiza la limpieza en un `await` separado tras la creación. En futuras versiones de alta concurrencia, esto debería envolverse en una `prisma.$transaction([])` interactiva para garantizar atomicidad total (ACID).

#### 5.4.3 Historial y Reembolsos

- **Historial**: `getUserPurchases` recupera todas las órdenes ordenadas por fecha descendente.
- **Reembolso**: `refundPurchase` permite cambiar el estado a "refunded". Es una operación lógica; no borra el registro, preservando la trazabilidad contable.
