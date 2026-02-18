## GameSage SSR - Plataforma de videojuegos

GameSage es una plataforma web de videojuegos construida como una **aplicación Angular SSR** que incluye un **backend HTTP en el mismo servidor**. El objetivo del proyecto es ofrecer una experiencia completa (renderizado en servidor, API REST, base de datos, media y funciones de IA) desde un único runtime.

De forma resumida:

- El **servidor** ejecuta un proceso Node.js que sirve:
  - El **frontend SSR** (HTML renderizado en servidor y assets estáticos).
  - La **API REST** bajo `/api/*` (misma URL base y mismo puerto).
- El **frontend** consume la API exclusivamente mediante rutas **relativas** (`/api/...`), evitando dependencias de URLs absolutas.
- La **persistencia** se gestiona con PostgreSQL y Prisma.
- El backend incorpora seguridad, validación y utilidades de operación (rate limit, serialización, logging).

### Componentes principales

- **Angular SSR** (`@angular/ssr`): renderizado en servidor y entrega de la aplicación.
- **Express**: API REST (rutas, controladores, middlewares).
- **Prisma**: acceso a BD y migraciones (`prisma/schema.prisma`).
- **Cloudinary**: almacenamiento/gestión de imágenes subidas por usuarios o asociadas a juegos.
- **IA**: endpoints de chat que consumen servicios de Google Generative AI.

### Puntos de entrada y estructura

- `src/server.ts`: servidor HTTP principal (SSR + montaje del backend).
- `src/backend/app.ts`: app de Express con middlewares y registro de rutas `/api/...`.
- `src/backend/modules/`: módulos por dominio (auth, users, games, purchases, media, chat, etc.).
- `src/backend/middleware/`: auth, rate limiting, validación, manejo de errores, logging de requests.
- `src/backend/scripts/`: utilidades de seed y limpieza de datos.
- `src/backend/tests/`: batería de tests de integración del backend (Jest + supertest).
- `prisma/`: esquema y migraciones.
- `backend-media/`: estructura de archivos para media usada por scripts (ver `backend-media/README.md`).

### Rutas y endpoints relevantes

- **Web**: `/`
- **Health**: `/api/health`
- **Diagnóstico**: `/api/diagnostic`
- **Swagger UI**: `/api-docs`
- **Auth**:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
- **Usuario actual**:
  - `GET /api/users/me`

---

## Configuración (variables de entorno)

Las variables de entorno se definen en `.env` (ver plantilla en `.env.example`) y se cargan con `dotenv` desde `src/backend/config/env.ts`. En ese fichero se valida la presencia de variables críticas y se tipan para consumo interno.

Variables habituales:

- **Servidor**: `PORT`, `NODE_ENV`
- **Auth**: `JWT_SECRET`, `BCRYPT_SALT_ROUNDS`
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

Los comandos están definidos en `package.json`.

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

- **`npm run watch`**: build en watch (config development).
- **`npm run format`**: formateo con Prettier.
- **`npm run clean`**: borra `dist`, `logs`, `coverage`.
- **`npm run clean:full`**: borra `dist`, `node_modules`, `logs`, `coverage`.
- **`npm run reinstall`**: reinstalación completa (`clean:full` + `npm install`).

---

## Comandos más útiles (resumen)

Los siguientes comandos cubren la mayoría de flujos habituales:

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
