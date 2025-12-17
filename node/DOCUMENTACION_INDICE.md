# ÍNDICE MAESTRO DE DOCUMENTACIÓN TÉCNICA (v4)

**Proyecto: Plataforma de Videojuegos (Backend Node.js/Express)**

_Este índice define la estructura para la "Biblia del Proyecto". El objetivo es documentar cada aspecto del Backend con un nivel de detalle que permita a cualquier desarrollador entender, mantener y escalar el sistema. Se ha omitido la estructura interna del Frontend (Angular) para mantener el foco en el servidor y la lógica de negocio._

---

## 1. Visión General

### 1.1 Objetivos y Alcance

- **Propósito**: Fuente única de verdad técnica.
- **Entidades Principales**: Gestión de E-commerce, CMS (Admin) y Chatbot IA.
- **Integración Frontend**: El backend sirve como API REST pura para una SPA en Angular (se detalla la interfaz de conexión en la Sec. 8).

### 1.2 Arquitectura del Sistema

- **Diseño Conceptual**: API RESTful con arquitectura en capas (Router -> Controller -> Service -> Repository/Prisma).
- **Diagrama de Flujo de Datos Global**.
- **Tecnologías Base**:
  - Runtime: **Node.js 20+**.
  - Server Framework: **Express 5.x**.
  - Lenguaje: **TypeScript 5.x**.
  - Persistencia: **PostgreSQL 16** + **Prisma 6.x**.
  - IA Provider: **Google Gemini / OpenAI**.

---

## 2. Entorno de Desarrollo y Configuración

### 2.1 Setup Inicial

- Requisitos del Sistema (Docker, Node, NPM).
- Instalación de Dependencias (`package.json` deep dive).

### 2.2 Gestión de Configuración (`src/config`)

- **Variables de Entorno (`env.ts`)**: Lista exhaustiva de las 20+ variables requeridas, sus tipos y valores por defecto (Zod Validation).
- **Configuración de Base de Datos (`db.ts`)**: Instanciación del PrismaClient y manejo de conexiones.
- **Configuración de Swagger (`swagger.ts`)**: Definición de especificaciones OpenAPI y autogeneración.

### 2.3 Scripts del Proyecto

- **Core**: `dev`, `build`, `start`.
- **Database**:
  - `seed:admin` (`src/scripts/seedAdmin.ts`): Lógica de creación segura de superusuarios.
  - `seed:data` (`src/scripts/seedData.ts`): Algoritmo de generación de datos de prueba masivos.
  - `clean:data` (`src/scripts/cleanData.ts`): Reset de tablas y secuencias SQL.
- **Testing**: `test`, `test:watch`, `test:coverage`.

---

## 3. Arquitectura del Código (`src`)

### 3.1 Estructura del Filesystem

- Explicación de la organizació top-level: `api/`, `config/`, `middleware/`, `modules/`, `scripts/`, `utils/`, `tests/`.

### 3.2 Ciclo de Vida de una Petición (`app.ts`)

- **Bootstrapping**: Inicialización del servidor Express.
- **Middleware Stack (Orden de Ejecución)**:
  1.  `Helmet` (Seguridad).
  2.  `Cors` (Acceso cruzado).
  3.  `RequestLogger` (Traza de entrada).
  4.  `ResponseSerializer` (Traza de salida).
  5.  `RateLimiter` (Protección de tráfico).
  6.  `Router` (Delegación a módulos).
  7.  `ErrorHandler` (Captura de excepciones).

### 3.3 Middleware Core (`src/middleware`)

- **Auth**: `auth.ts` (Validación JWT, extracción de usuario).
- **RBAC**: `authorize.ts` (Guards para Admin/User).
- **Validation**: `validate.ts` (Zod Schema Validation).
- **Error Handling**: `error.ts` (Mapeo de errores a respuestas HTTP).
- **Utilidades**: `rateLimiter.ts` (Configuración por IP), `serialize.ts` (Sanitización de respuestas).

### 3.4 Utilidades Transversales (`src/utils`)

- `logger.ts`: Sistema de logs estructurados con Winston.
- Helpers de formateo y validación genérica.

---

## 4. Capa de Datos y Dominio

### 4.1 Prisma Schema (`schema.prisma`)

- **Configuración del Datasource**: PostgreSQL provider & Connection Pooling.
- **Entidades de Core Negocio** (Análisis de campos, tipos y constraints):
  - `User`: Perfil, seguridad, balances.
  - `Game`: La entidad central (Stock, Precios, Descuentos).
  - `Developer` / `Publisher`: Relaciones corporativas.
  - `Genre` / `Platform`: Taxonomías.
- **Entidades de E-commerce**:
  - `CartItem`: Lógica de persistencia de carro.
  - `Purchase` / `PurchaseItem`: Logs inmutables de transacciones.
  - `Favorite`: Wishlist.
- **Entidades de Multimedia**:
  - `Media`: Abstracción de Cloudinary assets.
- **Entidades de IA**:
  - `ChatSession` / `ChatMessage`: Historial conversacional.

### 4.2 Interfaces y DTOs Globales

- Tipos compartidos en la aplicación.
- Respuestas estandarizadas (`PaginatedResponse`, `AppResponse`).

---

## 5. Módulos del Sistema (`src/modules`)

_Documentación detallada archivo por archivo de cada módulo funcional._

### 5.1 Módulo de Autenticación (`/auth`)

- `auth.routes.ts`: Endpoints `/login`, `/register`, `/refresh`.
- `auth.controller.ts`: Orquestación de peticiones HTTP.
- `auth.service.ts`: Lógica de negocio (Bcrypt, JWT signing).
- `auth.schema.ts`: Definiciones Zod para Inputs.

### 5.2 Módulo de Usuarios (`/users`)

- `users.routes.ts`: Rutas protegidas de perfil y administración.
- `users.controller.ts` & `users.service.ts`: CRUD de usuarios.
- Lógica especial: Gestión de Balance y Puntos.

### 5.3 Módulo de Juegos (`/games`)

- `games.routes.ts`: Endpoints públicos (Catálogo) y privados (ABM Admin).
- `games.service.ts`:
  - Búsqueda avanzada y filtros dinámicos.
  - Cálculo de precio final (Base - Descuento).
  - Gestión de stock multi-plataforma.
- `games.schema.ts`: Validación de creación/edición de juegos.

### 5.4 Sistema de Compras (`/cart` & `/purchases`)

- **Módulo Cart**:
  - Lógica de "Add to Cart": Verificación de stock en tiempo real.
  - Sincronización de carrito (Merge Guest -> User).
- **Módulo Purchases**:
  - **Atomic Transactions**: Explicación del flujo de base de datos para garantizar consistencia (Check Saldo -> Lock Stock -> Create Order -> Update Balance).
  - Generación de recibos.

### 5.5 Módulo de Chat IA (`/chat`)

- `chat.service.ts`: Corazón del chatbot.
  - Integración con SDK de Google Gemini / OpenAI.
  - Ingeniería de Prompts (System Prompt).
  - Uso de "Tools" (Function Calling) para buscar juegos en la BD.
- `chat.routes.ts`: Endpoints para enviar mensaje y recuperar historial.

### 5.6 Módulos de Catálogo Auxiliar

- **Genres** (`/genres`): Listado y filtrado.
- **Platforms** (`/platforms`): Gestión de plataformas.
- **Developers/Publishers**: Gestión de entidades.
- **Media** (`/media`):
  - Integración con `Multer` para carga de archivos.
  - Integración con `Cloudinary` para almacenamiento.

---

## 6. Testing y Calidad (`src/tests`)

### 6.1 Infraestructura de Pruebas

- Setup de Jest (`jest.config.js`).
- Helpers de Test: Base de datos en memoria o aislada.

### 6.2 Test Suites (Detalle por archivo)

- `auth.test.ts`: Login, Registro, Validaciones fallidas.
- `users.test.ts`: Seguridad de perfil, acceso no autorizado.
- `games.test.ts`: Creación de juegos, filtros de búsqueda, paginación.
- `cart.test.ts`: Añadir ítems, exceder stock, limpiar carro.
- `purchases.test.ts`: **Flujo Crítico** (Compra con saldo suficiente vs insuficiente, reducción de stock correcta).
- `chat.test.ts`: Mocking de respuesta IA, flujo conversacional.
- Pruebas de otros módulos (`developers`, `publishers`, `media`, `favorites`).

---

## 7. Referencias de API

- **Swagger/OpenAPI**: Enlace a la documentación interactiva (`/api-docs`).
- **Postman Collection**: Estructura recomendada para probar la API manualmente.

---

## 8. Integración con Frontend (Angular)

_En esta sección se detalla únicamente el contrato de interfaz con el cliente Angular, sin entrar en su estructura interna._

- **Autenticación**: Manejo de Tokens JWT en cabeceras `Authorization: Bearer <token>`.
- **Manejo de Errores**: Códigos de estado HTTP esperados (400, 401, 403, 404, 500) y formato JSON de error.
- **Media Assets**: Consumo de URLs de Cloudinary optimizadas entregadas por la API.
- **Websockets/Polling**: (Si aplica) Mecanismos de actualización en tiempo real para Chat o Notificaciones.

---

## 9. Despliegue y DevOps

### 9.1 Pipeline de Construcción

- Compilación TypeScript (`tsc`).
- Generación de Client Prisma.

### 9.2 Vercel Deployment

- Configuración (`vercel.json`).
- Variables de entorno en producción.
- Logs y monitorización en Dashboard de Vercel.
