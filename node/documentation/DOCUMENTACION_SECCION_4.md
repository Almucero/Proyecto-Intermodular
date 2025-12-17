# DOCUMENTACIÓN TÉCNICA - VOLUMEN II: CAPA DE DATOS

Proyecto: **Plataforma de Videojuegos (Backend Node.js/Express)**

> **Nota**: Este documento corresponde a la **Sección 4** del Índice Maestro. Se centra exclusivamente en el modelado de datos, las definiciones de esquema (Prisma) y las relaciones estructurales del sistema.

---

## 4. Datos y Entidades

El sistema utiliza **PostgreSQL** como motor de base de datos relacional, gestionado a través de **Prisma ORM**. La integridad de los datos se garantiza a nivel de esquema, utilizando claves foráneas restrictivas y transacciones ACID para operaciones críticas.

### 4.1 Modelos de Base de Datos (Prisma)

A continuación, se detalla cada una de las 13 entidades definidas en `schema.prisma`.

#### 1. Entidad: `User`

Representa a los usuarios finales de la plataforma, tanto clientes como administradores.

- **Rol**: Gestión de identidades, saldos y puntos.
- **Restricciones**: El email debe ser único. `accountId` y `accountAt` se usan para integraciones futuras o legadas.

| Campo          | Tipo       | Atributos                       | Descripción                                     |
| :------------- | :--------- | :------------------------------ | :---------------------------------------------- |
| `id`           | `Int`      | `@id @default(autoincrement())` | Identificador primario secuencial.              |
| `accountId`    | `String?`  | `@unique @default(cuid())`      | Identificador público seguro (CUID).            |
| `email`        | `String`   | `@unique`                       | Correo electrónico de acceso.                   |
| `name`         | `String`   |                                 | Nombre de pila.                                 |
| `surname`      | `String?`  |                                 | Apellidos (opcional).                           |
| `nickname`     | `String?`  |                                 | Alias para la comunidad.                        |
| `passwordHash` | `String`   |                                 | Hash de contraseña (Bcrypt). Nunca texto plano. |
| `balance`      | `Decimal?` | `@db.Decimal(12,2)`             | Saldo de monedero virtual.                      |
| `points`       | `Int`      | `@default(0)`                   | Puntos de fidelidad acumulados.                 |
| `isAdmin`      | `Boolean`  | `@default(false)`               | Flag simple para Rol de Administrador.          |
| `createdAt`    | `DateTime` | `@default(now())`               | Fecha de registro.                              |
| `updatedAt`    | `DateTime` | `@updatedAt`                    | Última modificación del perfil.                 |
| _Dirección_    |            |                                 | Campos postales (`addressLine1`, `city`, etc.). |

#### 2. Entidad: `Game`

La entidad central del catálogo. Almacena la información inmutable del videojuego y su estado de stock por plataforma.

| Campo         | Tipo       | Atributos                       | Descripción                               |
| :------------ | :--------- | :------------------------------ | :---------------------------------------- |
| `id`          | `Int`      | `@id @default(autoincrement())` | Identificador único del juego.            |
| `title`       | `String`   |                                 | Título comercial.                         |
| `description` | `String?`  |                                 | Sinopsis completa (Markdown soportado).   |
| `price`       | `Decimal?` | `@db.Decimal(12,2)`             | Precio base estándar.                     |
| `isOnSale`    | `Boolean`  | `@default(false)`               | Interruptor de oferta activa.             |
| `salePrice`   | `Decimal?` | `@db.Decimal(12,2)`             | Precio reducido si `isOnSale` es true.    |
| `rating`      | `Float?`   |                                 | Calificación promedio (0-5).              |
| `stockPc`     | `Int`      | `@default(0)`                   | Inventario físico/digital para PC.        |
| `stockPs5`    | `Int`      | `@default(0)`                   | Inventario para PlayStation 5.            |
| `stockXboxX`  | `Int`      | `@default(0)`                   | Inventario para Xbox Series X.            |
| `developerId` | `Int?`     |                                 | FK hacia `Developer` (SetNull on delete). |
| `publisherId` | `Int?`     |                                 | FK hacia `Publisher` (SetNull on delete). |

#### 3. Entidad: `Media`

Gestor de activos digitales (imágenes y videos) alojados externamente (Cloudinary).

| Campo      | Tipo      | Atributos | Descripción                                 |
| :--------- | :-------- | :-------- | :------------------------------------------ |
| `id`       | `Int`     | `@id`     | ID interno.                                 |
| `url`      | `String`  |           | URL pública absoluta (CDN).                 |
| `publicId` | `String?` | `@unique` | Identificador en Cloudinary (para borrado). |
| `format`   | `String?` |           | Extensión (jpg, png, mp4).                  |
| `gameId`   | `Int?`    |           | FK opcional hacia `Game`.                   |
| `userId`   | `Int?`    |           | FK opcional hacia `User` (avatar).          |

#### 4. Entidad: `Purchase`

Cabecera de una transacción de compra finalizada.

| Campo         | Tipo       | Atributos               | Descripción                       |
| :------------ | :--------- | :---------------------- | :-------------------------------- |
| `id`          | `Int`      | `@id`                   | Número de pedido.                 |
| `userId`      | `Int`      |                         | Usuario comprador.                |
| `totalPrice`  | `Decimal`  | `@db.Decimal(12, 2)`    | Monto total pagado (snapshot).    |
| `status`      | `String`   | `@default("completed")` | Estado (`completed`, `refunded`). |
| `purchasedAt` | `DateTime` | `@default(now())`       | Timestamp de la transacción.      |

#### 5. Entidad: `PurchaseItem`

Detalle de línea de una compra. "Congela" el precio del juego en el momento de la compra.

| Campo        | Tipo      | Atributos     | Descripción                         |
| :----------- | :-------- | :------------ | :---------------------------------- |
| `purchaseId` | `Int`     |               | FK a la cabecera `Purchase`.        |
| `gameId`     | `Int`     |               | FK al juego comprado.               |
| `platformId` | `Int`     |               | FK a la plataforma elegida.         |
| `price`      | `Decimal` |               | Precio unitario pagado (histórico). |
| `quantity`   | `Int`     | `@default(1)` | Cantidad de copias.                 |

#### 6. Entidad: `CartItem`

Persistencia del carrito de compras. Permite que el carrito sobreviva a sesiones o recargas.

| Campo        | Tipo  | Atributos                      | Descripción                                 |
| :----------- | :---- | :----------------------------- | :------------------------------------------ |
| `userId`     | `Int` |                                | Propietario del carrito.                    |
| `gameId`     | `Int` |                                | Juego seleccionado.                         |
| `platformId` | `Int` |                                | Plataforma seleccionada.                    |
| `quantity`   | `Int` | `@default(1)`                  | Unidades deseadas.                          |
| **Unique**   |       | `[userId, gameId, platformId]` | Evita duplicados; si existe, suma cantidad. |

#### 7. Tablas de Catálogo (`Developer`, `Publisher`, `Genre`, `Platform`)

Tablas maestras para normalizar datos repetitivos.

- **Estructura Común**: `id`, `name` (@unique), timestamps.
- **Propósito**: Facilitan filtrado y mantenimiento de integridad referencial. Si se borra un Developer, el campo `developerId` en Game se pone a NULL (`onDelete: SetNull`) para no borrar los juegos históricos.

#### 8. Sistema de Chat (`ChatSession`, `ChatMessage`)

Almacenamiento de conversaciones con la IA.

- `ChatSession`: Agrupa mensajes. Tiene un título generado automáticamente (`message.slice(0,50)`). Se borra en cascada si se borra el usuario.
- `ChatMessage`: Contenido textual (`role`: 'user'|'assistant') y metadatos JSON (`games`) con los juegos recomendados por la IA en ese turno.

---

### 4.2 Relaciones del Modelo de Datos

A continuación se describe en prosa técnica cómo interactúan estas tablas para soportar los flujos de negocio.

#### 4.2.1 El Ecosistema del Producto (`Game`)

La tabla `Game` es el nodo central del grafo.

- **Relación N:M con `Genre` y `Platform`**: Implementada implícitamente por Prisma (`@relation("GameGenres")`). Un juego puede ser de "Acción" y "RPG" a la vez, y estar disponible en "PC" y "PS5". Prisma crea tablas intermedias ocultas (`_GameGenres`, `_GamePlatforms`) para manejar esto.
- **Relación 1:N con `Media`**: Un juego tiene Múltiples medios (imágenes/videos), pero cada medio pertenece a un solo juego (o a un usuario, o a nada). Borrar un juego borra sus medios (`onDelete: Cascade`).

#### 4.2.2 El Flujo de Compra (`User` -> `Cart` -> `Purchase`)

1. **Etapa de Selección (Carrito)**:
   - Un `User` tiene múltiples `CartItem`.
   - Cada `CartItem` apunta a un par específico `Game` + `Platform`.
   - **Restricción**: La combinación `[userId, gameId, platformId]` es única. No puedes tener dos líneas separadas para "FIFA 24 en PS5" en el mismo carrito; se debe incrementar la `quantity`.
2. **Etapa de Conversión (Compra)**:
   - Al confirmar, los datos se trasladan de `CartItem` a `Purchase` (Cabecera) y `PurchaseItem` (Detalle).
   - Un `User` tiene múltiples `Purchase`.
   - Una `Purchase` tiene múltiples `PurchaseItem`.
   - **Integridad Histórica**: `PurchaseItem` guarda una copia del `price` en ese instante. Si el precio del juego cambia mañana, el historial no se ve afectado.
   - La relación `PurchaseItem` -> `Game` usa `onDelete: Restrict`. **No se puede borrar un juego si alguien lo ha comprado**. Esto garantiza la integridad contable.

#### 4.2.3 Preferencias de Usuario (`Favorite`)

- Un usuario puede marcar como favorito un juego específico en una plataforma específica.
- Relación similar a `CartItem` pero sin cantidad.
- Borrar un usuario, juego o plataforma elimina el favorito automáticamente (`onDelete: Cascade`).

---

### 4.3 Diagrama Entidad-Relación (Descripción para Generación)

Para visualizar este esquema, considere la siguiente topología para un diagrama ER:

1. **Núcleo Central**: Coloque `Game` en el centro.
2. **Satélites Superiores**: `Developer` y `Publisher` conectan a `Game` (1:N opcional).
3. **Satélites Laterales**: `Genre` y `Platform` conectan a `Game` (N:M).
4. **Usuario**: `User` se sitúa separado, conectado indirectamente a `Game` a través de tres puentes transaccionales:
   - `CartItem` (Deseo de compra actual).
   - `Purchase` -> `PurchaseItem` (Historial de compras pasadas).
   - `Favorite` (Lista de deseos).
   - `Media` (Relacionado tanto con `User` para avatares como con `Game` para screenshots).
5. **Módulo IA**: `ChatSession` cuelga de `User`, y `ChatMessage` cuelga de `ChatSession`. No tienen conexión directa a nivel de FK con `Game` (la relación es lógica vía JSON).

Esta estructura garantiza que las operaciones de catálogo (Juegos) estén desacopladas de las operaciones de transacción (Usuarios), uniéndose solo explícitamente mediante entidades de enlace (`CartItem`, `PurchaseItem`).
