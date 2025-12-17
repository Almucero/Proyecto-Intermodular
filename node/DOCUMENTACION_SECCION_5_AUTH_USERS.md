# DOCUMENTACIÓN TÉCNICA - VOLUMEN III: MÓDULOS DEL SISTEMA (Parte 1)

**Proyecto: Plataforma de Videojuegos (Backend Node.js/Express)**

> **Nota**: Este documento corresponde a la primera parte de la **Sección 5** del Índice Maestro, cubriendo los submódulos fundamentales: **Autenticación** y **Gestión de Usuarios**.

---

## 5. Módulos del Sistema (Parte 1)

El backend sigue una arquitectura modular donde cada dominio funcional reside en su propia carpeta bajo `src/modules`. Cada módulo es autocontenido y expone:

1.  **Rutas (`.routes.ts`)**: Definición de endpoints y unión con middleware.
2.  **Controladores (`.controller.ts`)**: Manejo de Request/Response HTTP.
3.  **Servicios (`.service.ts`)**: Lógica pura de negocio y acceso a datos.
4.  **Esquemas (`.schema.ts`)**: Validaciones de entrada con Zod.

---

### 5.1 Módulo de Autenticación (`/src/modules/auth`)

Responsable de la identificación de usuarios y emisión de credenciales de acceso (Tokens JWT).

#### 5.1.1 Rutas y Endpoints (`auth.routes.ts`)

Configuradas en `Router()` y prefijadas globalmente con `/api/auth`.

| Método   | Endpoint    | Middleware                 | Descripción                                        |
| :------- | :---------- | :------------------------- | :------------------------------------------------- |
| **POST** | `/register` | `validate(registerSchema)` | Crea una nueva cuenta de usuario y devuelve token. |
| **POST** | `/login`    | `validate(loginSchema)`    | Valida credenciales y devuelve sesión.             |

> **Nota de Seguridad**: Ambas rutas están protegidas por el `authLimiter` en producción (máx. 5 intentos/15min) para evitar ataques de fuerza bruta.

#### 5.1.2 Esquemas de Validación (`auth.schema.ts`)

Antes de llegar al controlador, los datos se sanean con Zod.

- **Register Input**:
  ```typescript
  export const registerSchema = z.object({
    email: z.string().email(),
    name: z.string().min(2),
    surname: z.string().min(2),
    password: z.string().min(8), // Longitud mínima crítica
    // Campos opcionales de perfil: nickname, address...
  });
  ```
- **Login Input**: Requiere estrictamente `email` y `password`.

#### 5.1.3 Lógica del Servicio (`auth.service.ts`)

##### `A. register(...)`

Flujo de creación de cuenta:

1.  **Verificación de Unicidad**: Consulta `findUserByEmail(email)`. Si existe, lanza error _("Email ya registrado")_.
2.  **Hashing**: Genera un hash seguro de la contraseña usando Bcrypt y las `BCRYPT_SALT_ROUNDS` (env).
    ```typescript
    const hash = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);
    ```
3.  **Persistencia**: Llama a `createUser` (del módulo Users) con el hash y datos de perfil.
4.  **Generación de Token**: Firma un JWT válido por 7 días conteniendo el `sub` (ID), `email` e `isAdmin`.
5.  **Retorno**: Devuelve objeto compuesto `{ user, token }`.

##### `B. login(email, password)`

Flujo de inicio de sesión:

1.  **Búsqueda**: Recupera el usuario por email (incluyendo el `passwordHash` oculto por defecto).
    - _Si no existe_: Lanza error genérico "Credenciales inválidas" (para evitar enumeración de usuarios).
2.  **Comparación**:
    ```typescript
    const ok = await bcrypt.compare(password, user.passwordHash);
    ```
    - _Si falla_: Lanza "Credenciales inválidas".
3.  **Emisión**: Genera un nuevo JWT fresco con los datos actuales del usuario.

#### 5.1.4 Controlador (`auth.controller.ts`)

Orquesta la respuesta HTTP. Maneja las excepciones de negocio mapeándolas a códigos de estado.

- Éxito en Registro -> `201 Created`.
- Éxito en Login -> `200 OK`.
- Error "Email ya registrado" -> `409 Conflict`.
- Error "Credenciales inválidas" -> `401 Unauthorized`.

---

### 5.2 Módulo de Usuarios (`/src/modules/users`)

Responsable de la gestión del perfil, seguridad de cuenta y administración de la base de usuarios.

#### 5.2.1 Rutas y Endpoints (`users.routes.ts`)

Prefijadas con `/api/users`. Este módulo hace uso intensivo de middlewares de autorización.

| Método     | Endpoint       | Middleware                               | Descripción                                             |
| :--------- | :------------- | :--------------------------------------- | :------------------------------------------------------ |
| **GET**    | `/`            | `auth`, `adminOnly`                      | Listado avanzado con filtros (Admin).                   |
| **GET**    | `/me`          | `auth`                                   | Obtiene el perfil del usuario actual (basado en Token). |
| **PATCH**  | `/me`          | `auth`, `validate(updateProfileSchema)`  | Actualiza datos del perfil propio.                      |
| **PATCH**  | `/me/password` | `auth`, `validate(changePasswordSchema)` | Cambio de contraseña seguro.                            |
| **GET**    | `/:id`         | `auth`, `adminOnly`                      | Obtiene detalle de cualquier usuario.                   |
| **PATCH**  | `/:id`         | `auth`, `adminOnly`, `validate`          | Modifica cualquier usuario (Admin).                     |
| **DELETE** | `/:id`         | `auth`, `adminOnly`                      | Baja lógica o física de usuario.                        |

#### 5.2.2 Lógica del Servicio (`users.service.ts`)

##### `A. createUser(...)`

Función interna (usada por Auth).

- **Logica de Negocio**:
  - Genera `nickname` automáticamente si no se provee (usando nombre o parte del email).
  - Inicializa `balance` en 0 y `points` en 0.
  - Sanitiza inputs con `.trim()`.

##### `B. listUsers(filters)`

Motor de búsqueda para el panel de administración. Construye una query dinámica de Prisma (`where`).

- **Filtros Soportados**:
  - Búsqueda insensible a mayúsculas (`mode: 'insensitive'`) por `email`, `name`, `nickname`.
  - Filtro exacto por `isAdmin`.
  - Filtros de rango (`gte`/`lte`) para `points` y `balance`.

##### `C. changePassword(userId, current, new)`

Permite al usuario cambiar su clave, pero requiere validación previa.

1.  Busca usuario por ID.
2.  **Verificación de Seguridad**: `bcrypt.compare(current, user.passwordHash)`. **Obligatorio** para evitar cambios no autorizados si se dejara una sesión abierta.
3.  Si es válido, hashea la `newPassword` y actualiza la BD.

##### `D. findUserById(id)`

Recupera el perfil completo.

- **Relaciones**: Incluye el objeto `media` (Avatar) con todos sus metadatos (URL, publicId, etc.).

#### 5.2.3 Controlador (`users.controller.ts`)

- **Patrón de Seguridad (Sanitización)**:
  Todos los métodos que devuelven un objeto usuario ( `getUserCtrl`, `meCtrl`, `updateProfileCtrl`) aplican una limpieza explícita para **eliminar el hash de la contraseña** antes de enviar el JSON.

  ```typescript
  const { passwordHash, ...safe } = user as any;
  res.json(safe);
  ```

  _Esto previene fugas críticas de seguridad._

- **Manejo de Errores Prisma**:
  - Captura código `P2025` (Record not found) -> `404 Not Found`.
  - Captura código `P2002` (Unique constraint failed) -> `409 Conflict` (ej: cambiar email a uno ya usado).

---
