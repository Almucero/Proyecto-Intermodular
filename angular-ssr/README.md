## GameSage SSR - Plataforma de videojuegos

### Introducción

GameSage es una plataforma web centrada en videojuegos que integra en un solo proyecto el frontend, el backend y la base de datos. La aplicación está construida como una **aplicación Angular con renderizado en servidor (SSR)** y un **backend HTTP** que se ejecuta en el mismo proceso Node.js, de modo que no hace falta desplegar por separado una SPA y una API: un único servidor atiende tanto las páginas web como las peticiones a la API REST.

El proyecto está pensado para ofrecer una experiencia completa de principio a fin: catálogo de juegos, usuarios y autenticación, carrito y compras, favoritos, subida de imágenes (media), y un chat asistido por IA. Todo ello con persistencia en PostgreSQL, documentación de la API (Swagger), tests de integración del backend y posibilidad de despliegue en entornos como Vercel. Esta documentación describe la arquitectura, el flujo de ejecución, la estructura del código y los pasos para arrancar el proyecto desde cero o trabajar con él en desarrollo.

### Resumen técnico

- El **servidor** ejecuta un proceso Node.js que sirve:
  - El **frontend SSR** (HTML renderizado en servidor y assets estáticos).
  - La **API REST** bajo `/api/*` (misma URL base y mismo puerto).
- El **frontend** consume la API exclusivamente mediante rutas **relativas** (`/api/...`), evitando dependencias de URLs absolutas.
- La **persistencia** se gestiona con PostgreSQL y Prisma.
- El backend incorpora seguridad, validación y utilidades de operación (rate limit, serialización, logging).

### Índice

- [Visión general y arquitectura](#visión-general-y-arquitectura)
- [Stack tecnológico](#stack-tecnológico)
- [Puntos de entrada](#puntos-de-entrada)
- [Ciclo de vida de una petición](#ciclo-de-vida-de-una-petición)
- [Estructura del backend](#estructura-del-backend)
- [Modelo de datos (Prisma)](#modelo-de-datos-prisma)
- [Frontend: configuración y flujo](#frontend-configuración-y-flujo)
- [Build SSR y variable SSR_DISABLE_BACKEND](#build-ssr-y-variable-ssr_disable_backend)
- [Rutas y endpoints relevantes](#rutas-y-endpoints-relevantes)
- [Arrancar el proyecto desde cero](#arrancar-el-proyecto-desde-cero)
- [Configuración (variables de entorno)](#configuración-variables-de-entorno)
- [Environments de Angular](#environments-de-angular-srcenvironments)
- [Comandos disponibles](#comandos-disponibles)
- [Comandos más útiles (resumen)](#comandos-más-útiles-resumen)

---

## Visión general y arquitectura

La aplicación sigue un modelo monolítico en el que un único proceso Node.js atiende tanto las peticiones de la aplicación web (incluyendo el renderizado en servidor de las páginas Angular) como las peticiones a la API REST. No hay separación de dominios por puerto: todo se expone en el mismo host y puerto configurado (por defecto 3000). Esta decisión simplifica el despliegue y evita problemas de CORS y de configuración de URLs entre frontend y backend.

El flujo típico de una petición es el siguiente: la petición llega al servidor Express; si la ruta comienza por `/api`, la maneja el backend montado en Express (controladores, servicios, base de datos); en caso contrario, se sirven primero los archivos estáticos del build de Angular y, si no hay coincidencia, se delega en el motor de Angular SSR para generar la respuesta HTML. Así, la SPA y la API coexisten en el mismo origen.

---

## Stack tecnológico

### Angular y SSR

El frontend está construido con **Angular** (v20) y **@angular/ssr**. El CLI de Angular está configurado con `outputMode: "server"` y un entry point de servidor (`src/server.ts`), de modo que el build genera tanto el bundle del navegador como el del servidor. En el servidor se utiliza `AngularNodeAppEngine` de `@angular/ssr/node` para renderizar las rutas de la aplicación en Node y devolver HTML, mejorando el SEO y la percepción de carga inicial.

### Express

El backend HTTP está implementado con **Express** (v5). La aplicación Express se crea en `src/backend/app.ts`, se monta bajo la aplicación principal en `src/server.ts` (cuando el backend no está deshabilitado) y concentra todo el enrutado bajo `/api/*`, middlewares globales (CORS, JSON, helmet, rate limiting en producción, logging, serialización de respuestas) y el manejador de errores al final de la cadena.

### Prisma

El acceso a datos se realiza mediante **Prisma**. El esquema está en `prisma/schema.prisma` y define los modelos (User, Game, Developer, Publisher, Genre, Platform, Media, Favorite, CartItem, Purchase, PurchaseItem, ChatSession, ChatMessage) y sus relaciones. La URL de conexión se obtiene de la variable de entorno `POSTGRES_PRISMA_URL`. Las migraciones se gestionan con `prisma migrate`; el cliente se genera con `prisma generate` y se usa en los servicios del backend.

### Cloudinary

Las imágenes y el media asociado a juegos o usuarios se almacenan y gestionan con **Cloudinary**. Las variables `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET` configuran el cliente. El módulo de media (`src/backend/modules/media`) utiliza Cloudinary para subir y eliminar recursos; los scripts de seed pueden poblar media desde una carpeta local o desde URLs.

### IA (Google Generative AI)

El chat con IA utiliza **Google Generative AI** (y dependencias como `@google/generative-ai` o `@ai-sdk/google`). La API key se configura con `GOOGLE_GENERATIVE_AI_API_KEY`. El módulo de chat (`src/backend/modules/chat`) expone endpoints para sesiones y mensajes, y delega en el servicio de IA para generar respuestas.

### Otras dependencias

- **Zod**: validación de cuerpos de petición en los endpoints (schemas por módulo, middleware `validate`).
- **jsonwebtoken** y **bcryptjs**: autenticación (JWT con issuer/audience, cabecera `Authorization: Bearer ...`, hash de contraseñas).
- **Helmet**: cabeceras de seguridad (CSP desactivado para Swagger; crossOriginResourcePolicy).
- **hpp**: protección frente a HTTP Parameter Pollution.
- **express-rate-limit**: límite de peticiones por IP (general 100/15 min; auth 5 intentos/hora).
- **Swagger (swagger-jsdoc, swagger-ui-express)**: documentación de la API en `/api-docs`.
- **Winston**: logging estructurado en el backend.
- **dotenv**: carga de variables desde `.env` al arrancar el backend.

El proyecto aplica buenas prácticas OWASP: headers de seguridad (X-Frame-Options, X-Content-Type-Options, Referrer-Policy) en el servidor; CORS restringido en producción mediante `CORS_ORIGIN`; en desarrollo se permiten automáticamente `http://localhost:PORT` y `http://localhost:4200`; redirección a HTTPS en producción; errores sin detalles sensibles en producción; control de acceso (IDOR) en usuarios; sanitización de enlaces en contenido (markdown); script `npm run audit` para revisar dependencias.

---

## Puntos de entrada

### `src/server.ts`

Es el punto de entrada del servidor cuando se ejecuta el build SSR (por ejemplo `node dist/game-sage/server/server.mjs`). Realiza lo siguiente:

1. Registra middlewares que añaden cabeceras de seguridad (X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, Referrer-Policy) a todas las respuestas.
2. Crea una aplicación Express y una instancia de `AngularNodeAppEngine`.
3. Si la variable de entorno `SSR_DISABLE_BACKEND` no está definida, importa dinámicamente `./backend/app` y monta la aplicación Express del backend con `app.use(backendApp)`. Así, en tiempo de build (cuando Angular analiza las rutas para SSR), se puede definir `SSR_DISABLE_BACKEND=1` para no cargar Prisma, Cloudinary ni el resto del backend y evitar errores de entorno o de conexión a BD durante la fase de extracción de rutas.
4. Monta `express.static` sobre la carpeta del build del navegador (`dist/.../browser`) para servir assets con caché larga y sin redirección de índice.
5. Registra un middleware que, para cualquier ruta no atendida antes, llama a `angularApp.handle(req)` y escribe la respuesta devuelta por Angular en el objeto `res` de Node. Si Angular no devuelve respuesta, se llama a `next()`.
6. Exporta `reqHandler` creado con `createNodeRequestHandler(app)` para integración con Angular CLI o entornos como Vercel.
7. Si el módulo se ejecuta como principal (`isMainModule(import.meta.url)`), inicia el servidor HTTP en el puerto definido en `env.PORT`.

El orden de montaje es importante: primero el backend (que atiende `/api/*`), luego estáticos, y por último el handler de Angular para el resto de rutas.

### `src/backend/app.ts`

Construye la aplicación Express del backend. No inicia un servidor propio; se exporta por defecto y se monta en `server.ts`. Contiene:

- Configuración de `trust proxy` para correcto uso de IP detrás de proxies.
- En producción, redirección HTTP → HTTPS (según `x-forwarded-proto` o `req.secure`).
- Helmet con CSP desactivado y `crossOriginResourcePolicy: 'cross-origin'`.
- CORS: en desarrollo se permiten automáticamente `http://localhost:PORT` y `http://localhost:4200`; en producción solo los orígenes definidos en `CORS_ORIGIN` (separados por coma). Si no se define `CORS_ORIGIN` en producción, se acepta cualquier origen.
- **hpp** para evitar HTTP Parameter Pollution.
- `express.json` con límite 10MB, middleware de logging de peticiones, middleware de serialización de respuestas (conversión de tipos Prisma como `Decimal` y `Date` a valores JSON serializables).
- En producción, rate limiter general (100 peticiones por 15 minutos por IP).
- Rutas de salud `/api/health` y `/api/diagnostic`.
- Montaje de Swagger UI en `/api-docs` con especificación dinámica según entorno y host.
- Rutas de auth con rate limiter específico (en entornos no test): `/api/auth` con `authLimiter` (5 intentos por hora por IP, sin contar exitosos) y `authRoutes`.
- Montaje del resto de rutas de dominio: `/api/users`, `/api/games`, `/api/developers`, `/api/publishers`, `/api/genres`, `/api/platforms`, `/api/media`, `/api/favorites`, `/api/cart`, `/api/purchases`, `/api/chat`.
- Middleware de manejo de errores al final (en producción devuelve mensajes genéricos sin detalles internos).

Además, se reemplaza `console.warn` para silenciar mensajes deprecados o de limpieza que no aportan en runtime.

### `src/backend/index.ts`

Punto de entrada alternativo cuando se ejecuta solo el backend (por ejemplo con `nodemon` sobre `src/backend`). Crea un servidor llamando a `app.listen(env.PORT)` y registra manejadores de `SIGTERM` y `SIGINT` para cerrar el servidor de forma ordenada. En el flujo SSR normal este fichero no se usa; el servidor se levanta desde `server.ts`.

### `src/main.ts` (navegador)

Punto de entrada del bundle del navegador. Ejecuta `bootstrapApplication(AppComponent, appConfig)` con la configuración definida en `src/app/app.config.ts`. Se usa cuando la aplicación se ejecuta en el cliente (tras la hidratación o en modo solo cliente con `ng serve`).

### `src/main.server.ts`

Punto de entrada del bundle del servidor para Angular. Exporta una función `bootstrap` que recibe un `BootstrapContext` y arranca la aplicación con `bootstrapApplication(AppComponent, config, context)`, usando la configuración de servidor (`app.config.server`). El CLI de Angular utiliza este archivo para renderizar las rutas en el servidor.

---

## Ciclo de vida de una petición

1. **Llegada al proceso Node**: La petición entra en la aplicación Express definida en `server.ts`.

2. **Backend (rutas `/api/*`)**: Si la ruta coincide con algún handler del backend montado primero (por ejemplo `/api/health`, `/api/auth/login`, `/api/games`, etc.), la cadena de middlewares de Express se ejecuta: CORS, body parser, request logger, response serializer, rate limiter (si aplica), y luego el router correspondiente. En rutas protegidas, el middleware `auth` verifica el JWT y adjunta `req.user`; el middleware `adminOnly` comprueba que el usuario esté en la lista de administradores. Los controladores llaman a los servicios, que usan Prisma para leer o escribir en PostgreSQL. La respuesta se serializa (Decimal, Date, etc. convertidos) y se envía. Si se lanza un error, el `errorHandler` centralizado devuelve un JSON de error y registra el fallo.

3. **Archivos estáticos**: Si la URL no fue manejada por el backend, Express intenta servir un archivo desde la carpeta `browser` del build. Las peticiones a JS, CSS, imágenes, etc. se resuelven aquí.

4. **SSR (resto de rutas)**: Si no hubo respuesta del backend ni archivo estático, el middleware de Angular llama a `angularApp.handle(req)`. Angular ejecuta el router de la aplicación, renderiza el componente correspondiente en servidor y devuelve una respuesta (HTML, redirección, etc.). Esa respuesta se escribe en el objeto `res` de Node mediante `writeResponseToNodeResponse`. Si Angular no devuelve respuesta, se llama a `next()` (en la configuración actual no hay más middlewares, por lo que en la práctica la cadena termina ahí).

5. **Cliente**: El navegador recibe el HTML inicial, carga los scripts del bundle y Angular hidrata la aplicación (con `provideClientHydration(withEventReplay())`), reutilizando el DOM renderizado en servidor y asociando eventos.

---

## Estructura del backend

### `src/backend/config/`

- **env.ts**: Carga `dotenv` desde `.env` y exporta un objeto `env` con las variables necesarias (PORT, NODE_ENV, JWT_SECRET, JWT_EXPIRES_IN, JWT_ISSUER, JWT_AUDIENCE, CORS_ORIGIN opcional, POSTGRES_PRISMA_URL, BCRYPT_SALT_ROUNDS, Cloudinary, GOOGLE_GENERATIVE_AI_API_KEY, ADMIN_EMAILS, ADMIN_PASSWORDS, ADMIN_NAMES). Valida la presencia de las obligatorias y lanza si falta alguna; las opcionales (JWT_*, CORS_ORIGIN) tienen valores por defecto o quedan undefined.
- **db.ts**: Instancia única de `PrismaClient` para reutilizar la conexión.
- **swagger.ts**: Definición de la especificación OpenAPI (servidores, componentes, seguridad) usada por Swagger UI. Los JSDoc en las rutas (por ejemplo en `auth.routes.ts`, `games.routes.ts`) documentan los endpoints y se integran con swagger-jsdoc.

### `src/backend/middleware/`

- **auth.ts**: Middleware que lee la cabecera `Authorization: Bearer <token>`, verifica el JWT con `JWT_SECRET` y opciones `issuer` y `audience` (desde env), y si es válido asigna `req.user` con `{ sub, email, isAdmin }`. Si falta o es inválido, responde 401.
- **authorize.ts**: `adminOnly` comprueba que `req.user` exista y que o bien `req.user.isAdmin` sea true o bien el email esté en la lista `ADMIN_EMAILS`. Si no, responde 403.
- **validate.ts**: Factory que recibe un esquema Zod y devuelve un middleware que hace `schema.safeParse(req.body)`; si falla, responde 400 con los errores aplanados; si tiene éxito, reemplaza `req.body` por el resultado tipado y llama a `next()`.
- **rateLimiter.ts**: `generalLimiter` (100 peticiones / 15 min por IP) y `authLimiter` (5 intentos / hora por IP para rutas de auth, sin contar las exitosas). Se aplican en `app.ts` según el entorno.
- **requestLogger.ts**: Registra cada petición al finalizar la respuesta (método, path, código de estado, duración) usando el logger de la aplicación (nivel error/warn/http según el código).
- **serialize.ts**: Middleware que reemplaza `res.json` para que, antes de enviar, pase el payload por `serializePrisma`. Así se convierten tipos no serializables de Prisma (Decimal, BigInt, Date) a tipos JSON válidos.
- **error.ts**: Manejador de errores de Express (cuatro argumentos). Registra el error; en producción responde con mensajes genéricos (por ejemplo "Error interno del servidor", "Datos inválidos") sin exponer detalles ni stack. En desarrollo incluye el mensaje del error.

### `src/backend/utils/`

- **serialize.ts**: Función recursiva `serializePrisma(value)` que convierte `Decimal` (objetos con `toNumber`), `Date` (a ISO string), arrays y objetos anidados a valores seguros para `JSON.stringify`.
- **logger.ts**: Configuración de Winston (nivel, formato, salida a consola o archivo según entorno).

### `src/backend/modules/`

Cada dominio (auth, users, games, developers, publishers, genres, platforms, media, favorites, cart, purchases, chat) sigue una estructura similar:

- **\*.routes.ts**: Router de Express que define las rutas (GET, POST, PATCH, DELETE, etc.), aplica middlewares (`auth`, `adminOnly`, `validate(schema)`) y delega en controladores. Incluye anotaciones JSDoc para Swagger.
- **\*.controller.ts**: Controladores que reciben `req` y `res`, extraen parámetros y cuerpo, llaman a los servicios y envían la respuesta (JSON o código de estado). No contienen lógica de negocio pesada.
- **\*.service.ts**: Lógica de negocio y acceso a datos con Prisma. Crean, leen, actualizan y borran entidades y relaciones.
- **\*.schema.ts**: Esquemas Zod para validar el body de las peticiones (registro, login, creación/actualización de juegos, etc.).

Ejemplo de cadena en un endpoint protegido: petición → `auth` (opcional) → `validate(schema)` → `adminOnly` (opcional) → controlador → servicio → Prisma → respuesta JSON (serializada por el middleware global).

### `src/backend/scripts/`

- **seedAdmin.ts**: Crea o actualiza usuarios administradores a partir de las variables `ADMIN_EMAILS`, `ADMIN_PASSWORDS` (opcional) y `ADMIN_NAMES` (opcional). Usado en el pipeline `build:full` para asegurar que existan admins tras el despliegue.
- **cleanData.ts**: Limpia datos de negocio (juegos, compras, favoritos, carrito, media, etc.) y opcionalmente elimina recursos en Cloudinary. Útil para dejar la base en estado conocido antes de un seed completo.
- **seedData.ts**: Tras una limpieza, rellena la base con datos de ejemplo (géneros, plataformas, desarrolladores, editores, juegos, media, etc.) usando ficheros o carpetas de referencia (por ejemplo `backend-data/` o variables como `MEDIA_BASE_PATH`).

### `src/backend/tests/`

Tests de integración con **Jest** y **supertest**. Se ejecutan con `npm run test:backend` (NODE_ENV=test). Cada archivo (auth.test.ts, users.test.ts, games.test.ts, etc.) levanta la aplicación Express y realiza peticiones HTTP a los endpoints, comprobando códigos de estado y cuerpos de respuesta. La configuración de Jest está en `jest.backend.config.js`; la base de datos de test debe estar configurada en `.env` (misma variable `POSTGRES_PRISMA_URL` o una URL específica de test).

---

## Modelo de datos (Prisma)

El esquema en `prisma/schema.prisma` define:

- **Developer**, **Publisher**: entidades con nombre único; relacionadas con juegos.
- **Platform**, **Genre**: catálogos con nombre único; muchos juegos pueden tener muchas plataformas y muchos géneros (relaciones N:M).
- **Game**: título, descripción, precios (price, salePrice), flags (isOnSale, isRefundable), stock por plataforma (stockPc, stockPs5, etc.), videoUrl, rating, releaseDate, relaciones con Publisher, Developer, Genre[], Platform[], Media[], Favorite[], CartItem[], PurchaseItem[].
- **Media**: url, publicId, metadatos (format, bytes, width, height, folder, altText); puede asociarse a un Game o a un User (avatar, etc.).
- **User**: email, nickname, name, surname, passwordHash, balance, points, isAdmin, dirección (addressLine1, city, region, etc.), accountId/accountAt para integración externa; relaciones con Media, Favorite, CartItem, Purchase, ChatSession.
- **Favorite**: usuario, juego, plataforma (único por combinación).
- **CartItem**: usuario, juego, plataforma, cantidad.
- **Purchase** / **PurchaseItem**: compra con total y estado; ítems con juego, plataforma, precio y cantidad.
- **ChatSession** / **ChatMessage**: sesiones de chat por usuario; mensajes con rol (user/assistant), contenido y opcionalmente datos estructurados (por ejemplo juegos recomendados) en JSON.

Las migraciones en `prisma/migrations/` reflejan la evolución del esquema (campos añadidos, índices, etc.). En entornos que usan pooler (por ejemplo Neon), `directUrl` con `POSTGRES_URL_NON_POOLING` se usa para migraciones.

---

## Frontend: configuración y flujo

### `src/app/app.config.ts`

Configuración de la aplicación Angular: Zone.js, router (`routes`), HttpClient con `withFetch()` y el interceptor `serverConnectionInterceptor`, animaciones, Translate (ngx-translate) con loader HTTP desde `/assets/i18n/`, fallback y idioma por defecto (es), y una gran cantidad de providers para repositorios y servicios.

Los tokens inyectables definen nombres de recurso (games, developers, genres, etc.), URLs base de API (todas con prefijo `environment.apiUrl` que en producción y desarrollo suele ser `''`, resultando en rutas relativas `/api/...`) y factories de repositorios y mapeos. Los servicios de dominio (GameService, UserService, CartItemService, PurchaseService, FavoriteService, ChatService, etc.) y el AuthenticationService se registran aquí. También se habilita la hidratación del cliente con `provideClientHydration(withEventReplay())`.

### `src/app/app.routes.ts`

Define las rutas de la SPA: home (`/`), login, register, dashboard (protegida con authGuard y customerGuard), product/:id, aichat, favourites, cart, settings, help, contact, privacy, conditions, cookies, search, y admin (protegida con authGuard y adminGuard) con rutas hijas para gestión de géneros, desarrolladores, plataformas, editores y juegos. Las rutas de admin cargan componentes con `loadComponent` (lazy loading).

### Guards e interceptors

- **authGuard**: Impide acceder a rutas que requieren sesión si no hay usuario autenticado (por ejemplo leyendo token o estado de auth).
- **adminGuard**: Restringe el acceso al área de administración a usuarios con rol admin (según backend o estado en cliente).
- **customerGuard**: Distingue entre usuarios cliente y otros roles para rutas como dashboard.
- **serverConnectionInterceptor**: Interceptor HTTP que reintenta peticiones fallidas con status 0 o >= 500, con un delay (por ejemplo 2 segundos), para tolerar arranques lentos del servidor o fallos temporales.

### Repositorios y servicios

El frontend abstrae las llamadas HTTP en repositorios (por recurso) que construyen las URLs a partir de los tokens (apiUrl + nombre de recurso). Los servicios de dominio utilizan estos repositorios y exponen métodos de alto nivel (listar juegos, añadir al carrito, crear compra, etc.). Los mapeos transforman los DTOs del backend al modelo que usa la aplicación. Esta capa permite cambiar la implementación (HTTP, mock) sin tocar los componentes.

### Environments

En `src/environments/` están `environment.ts` (desarrollo) y `environment.prod.ts` (producción). Contienen `production: boolean` y `apiUrl: string`. Con `apiUrl: ''`, las peticiones se hacen a rutas relativas, por lo que funcionan contra el mismo origen (SSR o proxy en desarrollo). El build de producción reemplaza el fichero de environment mediante `fileReplacements` en `angular.json`.

---

## Build SSR y variable SSR_DISABLE_BACKEND

Durante `ng build` con configuración SSR, Angular puede ejecutar el servidor de entrada (`src/server.ts`) para descubrir rutas y generar recursos. En ese contexto, el backend importa Prisma, Cloudinary, dotenv, etc., y puede fallar si no hay `.env`, base de datos o variables configuradas. Para evitar eso, el script `build:ssr` define `SSR_DISABLE_BACKEND=1` (por ejemplo con `cross-env`). Así, en `server.ts` la condición `if (!process.env['SSR_DISABLE_BACKEND'])` es falsa y no se monta el backend durante el build. El artefacto generado (`server.mjs`) sí monta el backend cuando se ejecuta en runtime, porque entonces la variable no está definida.

---

## Rutas y endpoints relevantes

- **Web**: `/` (y el resto de rutas de la SPA).
- **Health**: `GET /api/health` (respuesta `{ ok: true }`).
- **Diagnóstico**: `GET /api/diagnostic`.
- **Swagger UI**: `GET /api-docs`.
- **Auth**: `POST /api/auth/register`, `POST /api/auth/login`.
- **Usuario actual**: `GET /api/users/me` (requiere JWT).
- **Juegos**: `GET /api/games`, `GET /api/games/:id`, `POST /api/games`, `PATCH /api/games/:id`, `DELETE /api/games/:id` (creación/edición/borrado con auth y admin).
- **Desarrolladores, editores, géneros, plataformas**: CRUD bajo `/api/developers`, `/api/publishers`, `/api/genres`, `/api/platforms`.
- **Media**: subida y gestión bajo `/api/media`.
- **Favoritos, carrito, compras**: `/api/favorites`, `/api/cart`, `/api/purchases`.
- **Chat**: `/api/chat` (sesiones y mensajes con IA).

La documentación detallada de parámetros, cuerpos y respuestas está en Swagger (`/api-docs`) y en los JSDoc de cada ruta.

---

## Arrancar el proyecto desde cero

Esta sección describe los pasos necesarios para poner en marcha el proyecto en una máquina sin tener preinstalado Node.js, base de datos ni ninguna herramienta del stack.

### 1. Instalar Node.js

Node.js incluye el runtime de JavaScript y **npm** (gestor de paquetes). Sin Node no se puede ejecutar el servidor ni el CLI de Angular.

- Descargar el instalador LTS desde [nodejs.org](https://nodejs.org/) (o la versión actual si se prefiere).
- Ejecutar el instalador y seguir las opciones por defecto; asegurarse de que la opción para añadir Node al PATH esté activada.
- Abrir una nueva terminal y comprobar:
  - `node -v` (debe mostrar la versión, por ejemplo v20.x o v22.x).
  - `npm -v` (debe mostrar la versión de npm).

Versiones recomendadas: Node 20.x o 22.x; el proyecto está probado con estas versiones.

### 2. Instalar Git (opcional)

Si el código se obtiene desde un repositorio Git, hace falta tener Git instalado.

- Descargar desde [git-scm.com](https://git-scm.com/) e instalar.
- Comprobar con `git --version`.

Si el proyecto se recibe como ZIP o carpeta, este paso puede omitirse.

### 3. Obtener el código del proyecto

- Con Git: clonar el repositorio en una carpeta local, por ejemplo `git clone <url> angular-ssr` y luego `cd angular-ssr`.
- Sin Git: descomprimir o copiar la carpeta del proyecto y abrir una terminal en la raíz del proyecto (donde está `package.json`).

### 4. Base de datos PostgreSQL

El backend usa PostgreSQL a través de Prisma. Hay que disponer de una instancia accesible y de las URLs de conexión en el `.env`.

**Opción A – PostgreSQL local (o cualquier proveedor)**

- Instalar PostgreSQL desde [postgresql.org](https://www.postgresql.org/download/) o con un gestor de paquetes (Chocolatey, Homebrew, etc.), o usar cualquier otro proveedor de PostgreSQL.
- Crear una base de datos y un usuario con permisos (por ejemplo `gamesage` / `gamesage`).
- La URL de conexión típica es: `postgresql://usuario:password@localhost:5432/nombre_bd`. Esa URL y, si aplica, la URL directa sin pooler se configuran en el paso de variables de entorno.

**Opción B – Neon desde Vercel**

- Si el proyecto se despliega o se gestiona desde **Vercel**, la base de datos PostgreSQL tipo Neon se puede crear y administrar desde el propio panel de Vercel (Vercel permite crear y enlazar este tipo de base de datos).
- Lo único necesario es disponer de las URLs que Vercel proporciona: `POSTGRES_PRISMA_URL` y `POSTGRES_URL_NON_POOLING` (o la que corresponda para migraciones). Esas URLs se copian al `.env` y se gestionan desde Vercel; no hace falta crear la base manualmente en neon.tech.

En cualquier caso, las URLs de conexión se definen en el archivo `.env` en el paso siguiente.

### 5. Variables de entorno

En la raíz del proyecto debe existir un archivo `.env`. No está versionado por seguridad.

- Copiar la plantilla: `cp .env.example .env` (en Windows: `copy .env.example .env`).
- Editar `.env` y rellenar cada variable:
  - **POSTGRES_PRISMA_URL**: URL de conexión a PostgreSQL (ej. `postgresql://user:pass@host:5432/dbname`).
  - **POSTGRES_URL_NON_POOLING**: Si se usa Neon u otro pooler, la URL directa sin pooler; si la BD es local, puede ser la misma que `POSTGRES_PRISMA_URL`.
  - **PORT**: Puerto del servidor (ej. 3000).
  - **NODE_ENV**: `development` para desarrollo; en Vercel u otro hosting de producción usar `production`.
  - **JWT_SECRET**: Cadena secreta larga y aleatoria para firmar los JWT.
  - **JWT_EXPIRES_IN**, **JWT_ISSUER**, **JWT_AUDIENCE**: Opcionales; por defecto `7d`, `game-sage` y `game-sage-users`. Útiles para endurecer la emisión/verificación de tokens.
  - **CORS_ORIGIN**: Solo en producción. Orígenes permitidos para la API, separados por coma (ej. `https://tu-app.vercel.app`). En desarrollo se permiten automáticamente `http://localhost:PORT` y `http://localhost:4200`.
  - **BCRYPT_SALT_ROUNDS**: Número de rondas de bcrypt (ej. 10).
  - **CLOUDINARY_*** (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET): credenciales para subida de imágenes.
  - **GOOGLE_GENERATIVE_AI_API_KEY**: API key de Google Generative AI para el chat.
  - **ADMIN_EMAILS**: Lista de correos de administradores separados por comas (ej. `admin@example.com`).
  - Opcionales: **ADMIN_PASSWORDS**, **ADMIN_NAMES** (mismo orden que los emails) para el script de seed de admins.

Guardar el archivo. Sin estas variables, el backend no arrancará (env.ts lanza si falta alguna obligatoria).

### 6. Instalar dependencias

En la raíz del proyecto ejecutar:

```bash
npm install
npm audit fix
```

Se instalan las dependencias de `package.json` y las devDependencies (Angular CLI, Prisma, Jest, etc.). Puede tardar varios minutos. `npm audit fix` corrige vulnerabilidades conocidas en las dependencias (por ejemplo avisos de severidad moderada).

**Si en Windows PowerShell aparece** *"running scripts is disabled on this system"* al ejecutar `npm`:

- Usa el ejecutable en formato cmd: `npm.cmd install` y `npm.cmd audit fix` (y en general `npm.cmd` en lugar de `npm` para el resto de comandos), o
- Abre PowerShell como administrador y ejecuta: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope LocalMachine` para permitir scripts locales como `npm.ps1`.

### 7. Prisma: generar cliente y migrar

Generar el cliente de Prisma (necesario para que el backend compile y ejecute):

```bash
npx prisma generate
```

Aplicar el esquema a la base de datos (crear tablas y migraciones pendientes):

```bash
npx prisma migrate deploy
```

Si es la primera vez y se usa `migrate dev` en lugar de `deploy` (por ejemplo en desarrollo local), se pueden crear migraciones desde el estado actual del schema con:

```bash
npx prisma migrate dev
```

Comprobar que la base tiene tablas con `npx prisma studio` (opcional).

### 8. Crear administradores (recomendado)

Para poder acceder al área de administración:

```bash
npm run seed:admin
```

Esto crea o actualiza los usuarios cuyos emails están en `ADMIN_EMAILS` (y opcionalmente contraseñas y nombres desde `.env`).

### 9. Datos de prueba (opcional)

Para cargar juegos, géneros, plataformas, etc. de ejemplo:

```bash
npm run seed:data
```

Ejecuta primero una limpieza y luego el seed completo. Requiere que las variables de Cloudinary y, si aplica, la ruta de media local estén configuradas (ver documentación de los scripts en `src/backend/scripts/`).

### 10. Build y ejecución del servidor SSR

Compilar la aplicación (frontend + servidor):

```bash
npm run build:ssr
```

Al finalizar, arrancar el servidor:

```bash
npm run serve:ssr
```

El servidor quedará escuchando en `http://localhost:<PORT>` (por defecto 3000). Ahí se sirve la web y la API (`/api/*`). Abrir el navegador en esa URL para usar la aplicación.

### Resumen mínimo (con Node y BD ya listas)

```bash
cp .env.example .env
# Editar .env con BD, Cloudinary, JWT, etc.
npm install
npm audit fix
npx prisma generate
npx prisma migrate deploy
npm run seed:admin
npm run build:ssr
npm run serve:ssr
```

---

## Configuración (variables de entorno)

Las variables de entorno se definen en `.env` (ver plantilla en `.env.example`) y se cargan con `dotenv` desde `src/backend/config/env.ts`. En ese fichero se valida la presencia de variables críticas y se tipan para consumo interno.

Variables habituales:

- **Servidor**: `PORT`, `NODE_ENV`
- **Auth**: `JWT_SECRET`, `BCRYPT_SALT_ROUNDS`; opcionales `JWT_EXPIRES_IN`, `JWT_ISSUER`, `JWT_AUDIENCE`
- **CORS**: `CORS_ORIGIN` (solo en producción; orígenes permitidos separados por coma). En desarrollo se permiten `http://localhost:PORT` y `http://localhost:4200` sin configurarlo.
- **Base de datos**: `POSTGRES_PRISMA_URL`
- **Media**: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- **IA**: `GOOGLE_GENERATIVE_AI_API_KEY`
- **Administradores**: `ADMIN_EMAILS` (y opcionalmente `ADMIN_PASSWORDS`, `ADMIN_NAMES`)

---

## Environments de Angular (`src/environments`)

Angular utiliza los ficheros de environment para seleccionar configuración en build (por ejemplo, reemplazos en producción). En este proyecto los environments son deliberadamente mínimos:

- `production: boolean`
- `apiUrl: ''`

Con `apiUrl` vacío, todas las URLs de API construidas en `src/app/app.config.ts` quedan como rutas relativas (`/api/...`). Esto permite que el frontend funcione correctamente en SSR y despliegues sin necesitar reconfigurar URLs absolutas.

---

## Comandos disponibles

Los comandos están definidos en `package.json`. Para un arranque desde cero completo, ver la sección **Arrancar el proyecto desde cero**.

### Desarrollo

- **`npm start`**  
  Ejecuta `ng serve` (desarrollo de frontend en modo SPA).

- **`npm run dev:backend`**  
  Levanta el backend con `nodemon` + `tsx`, observando `src/backend`.

- **`npm run dev`**  
  Alias de `npm run dev:backend`.

- **`npm run serve:ssr`**  
  Ejecuta el servidor SSR compilado desde `dist/game-sage/server/server.mjs`.

- **`npm run start:ssr`**  
  Alias de `npm run serve:ssr`.

### Build

- **`npm run build`**  
  Build estándar de Angular (browser).

- **`npm run build:ssr`**  
  Build SSR (browser + server). Durante el build se utiliza `SSR_DISABLE_BACKEND=1` para evitar que el backend se evalúe en la fase de extracción de rutas.

- **`npm run build:full`**  
  Pipeline completo:
  - `prisma generate`
  - `seed:admin`
  - `build:ssr`

Tras instalar dependencias (`npm install`) conviene ejecutar **`npm audit fix`** para resolver vulnerabilidades reportadas por npm.

### Tests

- **`npm test`**  
  Ejecuta la suite de backend (`npm run test:backend`). Se mantiene como comando principal para CI/validación rápida.

- **`npm run test:backend`**  
  Ejecuta Jest sobre `src/backend/tests`. Se configura `NODE_ENV=test` y se silencia el ruido de warnings de Node para una salida limpia.

- **`npm run test:frontend`**  
  Ejecuta `ng test` (Karma/Jasmine). Útil si se añaden `*.spec.ts` del frontend.

### Seeds y scripts de datos

- **`npm run seed:admin`**  
  Ejecuta `src/backend/scripts/seedAdmin.ts`.

- **`npm run clean:data`**  
  Ejecuta `src/backend/scripts/cleanData.ts` y limpia por completo los datos de negocio y la media asociada en Cloudinary.

- **`npm run seed:data`**  
  Ejecuta primero la limpieza completa (`npm run clean:data`) y, a continuación, `src/backend/scripts/seedData.ts`, que rellena la base de datos y la media a partir de `backend-data/`.

### Prisma (CLI)

- `npx prisma studio`
- `npx prisma migrate dev`
- `npx prisma generate`
- `npx prisma db push`

### Utilidades

- **`npm run audit`**: ejecuta `npm audit --audit-level=high` para revisar vulnerabilidades en dependencias (OWASP A06).
- **`npm audit fix`**: corrige vulnerabilidades en dependencias (recomendado tras `npm install`).
- **`npm run watch`**: build en watch (config development).
- **`npm run format`**: formateo con Prettier.
- **`npm run clean`**: borra `dist`, `logs`, `coverage`.
- **`npm run clean:full`**: borra `dist`, `node_modules`, `logs`, `coverage`.
- **`npm run reinstall`**: reinstalación completa (`clean:full` + `npm install`); después ejecutar `npm audit fix`.

---

## Comandos más útiles (resumen)

Los siguientes comandos cubren la mayoría de flujos habituales:

- **Instalación y corrección de vulnerabilidades** (tras clonar o cambiar de rama):

```bash
npm install
npm audit fix
```

- **Build SSR + ejecución local**:

```bash
npm run build:ssr
npm run serve:ssr
```

- **Desarrollo de API (sin reconstruir SSR)**:

```bash
npm run dev:backend
```

- **Pipeline completo (Prisma + admins + SSR)**:

```bash
npm run build:full
```

- **Tests del backend (salida limpia)**:

```bash
npm test
```
