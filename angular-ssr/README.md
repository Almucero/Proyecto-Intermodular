# GameSage Web/API (`angular-ssr`)

Documento operativo corto del bloque web y backend.
El detalle funcional/técnico se centraliza en [Confluence — Web y API (hub)](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/73957377) y en el `README` raíz del monorepo.

---

## Qué contiene esta carpeta

- Frontend Angular SSR.
- Backend Express con API REST bajo `/api`.
- Persistencia con Prisma + PostgreSQL.
- Scripts auxiliares de datos, despliegue y documentación.

Rutas clave:

- [`src/server.ts`](src/server.ts) (entrada SSR)
- [`src/backend/app.ts`](src/backend/app.ts) (entrada API)
- [`prisma/schema.prisma`](prisma/schema.prisma) (modelo de datos)
- [`src/backend/scripts/`](src/backend/scripts/) (scripts de datos y utilidades)

---

## Prerrequisitos

- Node.js **20.x o 22.x** LTS y npm.
- PostgreSQL accesible (local o Neon enlazado desde Vercel).
- Archivo `.env` en la raíz (plantilla [`.env.example`](.env.example)).
- Instalar o actualizar dependencias **solo** con `npm run setup:secure` (no usar `npm install` a secas).
- Credenciales en `.env` para:
  - Cloudinary (media)
  - Stripe (checkout)
  - Google Generative AI (chat IA)
  - Admins iniciales (`ADMIN_EMAILS`, `ADMIN_PASSWORDS`, `ADMIN_NAMES`, en el mismo orden)
  - SMTP (solo si se usa recuperación real por correo)
  - OAuth Google/GitHub (opcional: solo si usas login social)
- Opcional para scripts BI: Python 3.9+.

---

## Arranque rápido (local)

Desde [`angular-ssr/`](./):

### 1) Preparar `.env`

1. Copia la plantilla: `cp .env.example .env` (Windows: `copy .env.example .env`).
2. Rellena las variables obligatorias (ver sección [Variables de entorno](#variables-de-entorno-env)); la lista completa está en [`.env.example`](.env.example).
3. En Neon/Vercel, configura también `POSTGRES_URL_NON_POOLING` para migraciones.

### 2) Dependencias y Prisma

```bash
npm run setup:secure
npx prisma generate
npx prisma migrate deploy
```

En Windows, si PowerShell bloquea scripts de npm (`running scripts is disabled`), usa `npm.cmd` en lugar de `npm` (por ejemplo `npm.cmd run setup:secure`).

### 3) Seeds

> **Opcional — limpieza previa (ejecutar primero solo si la necesitas)**  
> Borra datos de BBDD y Cloudinary. No es parte del arranque habitual. Si la usas, hazlo **antes** de `seed:admin` o `seed:data`.
>
> ```bash
> npm run clean:data
> ```

**Obligatorio** (acceso al área de administración):

```bash
npm run seed:admin
```

**Opcional** (catálogo y media de ejemplo; `seed:data` ya limpia internamente antes de rellenar):

```bash
npm run seed:data
```

### 4) Build SSR y ejecución

```bash
npm run build:ssr
npm run serve:ssr:prod
```

Cuando el servidor esté en marcha, usa las [URLs locales](#urls-locales) (sección Desarrollo).

---

## Despliegue

- Rama de despliegue: `main` (Vercel despliega automáticamente al actualizarla).
- Variables en Vercel: las mismas que en `.env` (Settings → Environment Variables).
- Pipeline completo local: `npm run build:full` (Prisma + seed admin + build SSR).
- En Vercel el build ejecuta `npm run vercel-build` (Swagger, Compodoc y artefactos SSR).
- **No ejecutar** `npm run vercel-build` en local: está pensado para el pipeline de Vercel y puede regenerar `docs/` u otros artefactos no deseados.

---

## Desarrollo

Uso habitual: **frontend y API en el mismo proceso** (SSR). Los modos separados existen pero no son el flujo de trabajo del equipo.

### URLs locales

Válidas con `npm run dev:ssr`, `npm run serve:ssr:prod` o el [paso 4 de arranque rápido](#4-build-ssr-y-ejecución):

- App: [http://localhost:3000](http://localhost:3000)
- Health: [http://localhost:3000/api/health](http://localhost:3000/api/health)
- Swagger: [http://localhost:3000/api-docs/](http://localhost:3000/api-docs/)

> Puerto distinto de 3000 solo si cambias `PORT` en `.env`.

### Desarrollo integrado (recomendado)

SSR con recarga automática al cambiar código:

```bash
npm run dev:ssr
```

Pruebas de pago Stripe en contexto seguro (HTTPS local):

```bash
npm run dev:ssr:https
```

- Navegar en [https://localhost:3443](https://localhost:3443) (proxy HTTPS; el SSR sigue en el puerto 3000).

Ejecución local del build de producción (sin watch): mismos comandos que en [arranque rápido](#4-build-ssr-y-ejecución) (`build:ssr` + `serve:ssr:prod`); mismas [URLs locales](#urls-locales).

Los scripts de arranque liberan los puertos 3000, 3443 o 4200 solo si estaban ocupados.

### Modos alternativos (posibles, poco usados)

- Solo API, sin reconstruir SSR: `npm run dev:backend` → [http://localhost:3000/api/health](http://localhost:3000/api/health)
- Solo frontend SPA (`ng serve`, sin API en el mismo proceso): `npm start` → [http://localhost:4200](http://localhost:4200)

---

## Tests y verificación

- Backend: `npm test` (alias de `npm run test:backend`)
- Lint / seguridad estática: `npm run lint`
- Auditoría de dependencias de producción: `npm audit --omit=dev`
- Validación habitual antes de commit (en este orden): `npm run build:ssr`, `npm run lint`, `npm audit --omit=dev`
- Generación de documentación de código (Compodoc):
  - `npm run docs:build`
  - `npm run docs:serve`

Nota: la referencia principal de la API backend es [Swagger en local](http://localhost:3000/api-docs/), no Compodoc.

---

## Variables de entorno (`.env`)

El backend carga y valida variables en [`src/backend/config/env.ts`](src/backend/config/env.ts) y usa como referencia la plantilla [`.env.example`](.env.example).

### 1) Variables obligatorias (validadas por el backend)

| Variable                       | Tipo esperado | Uso                                              |
| ------------------------------ | ------------- | ------------------------------------------------ |
| `PORT`                         | número > 0    | Puerto del servidor SSR + API (habitual: `3000`) |
| `NODE_ENV`                     | string        | Entorno (`development`, `production`, etc.)      |
| `JWT_SECRET`                   | string        | Firmar y verificar JWT                           |
| `POSTGRES_PRISMA_URL`          | string        | URL de conexión usada por Prisma                 |
| `BCRYPT_SALT_ROUNDS`           | número > 0    | Coste bcrypt para passwords                      |
| `CLOUDINARY_CLOUD_NAME`        | string        | Cloudinary cloud                                 |
| `CLOUDINARY_API_KEY`           | string        | Cloudinary API key                               |
| `CLOUDINARY_API_SECRET`        | string        | Cloudinary API secret                            |
| `GOOGLE_GENERATIVE_AI_API_KEY` | string        | API key chat IA                                  |
| `STRIPE_SECRET_KEY`            | string        | Credencial servidor Stripe                       |
| `STRIPE_PUBLISHABLE_KEY`       | string        | Credencial cliente Stripe                        |
| `ADMIN_EMAILS`                 | string        | Lista CSV de emails admin                        |
| `ADMIN_PASSWORDS`              | string        | Lista CSV de passwords admin (en el mismo orden) |
| `ADMIN_NAMES`                  | string        | Lista CSV de nombres admin (en el mismo orden)   |

### 2) Variables usadas por Prisma / migraciones

| Variable                   | Uso                                                                                         |
| -------------------------- | ------------------------------------------------------------------------------------------- |
| `POSTGRES_URL_NON_POOLING` | URL directa “sin pooler” (útil para migraciones/operaciones que requieren conexión directa) |

### 3) Variables opcionales (con comportamiento acotado)

| Variable               | Uso                                                              |
| ---------------------- | ---------------------------------------------------------------- |
| `JWT_EXPIRES_IN`       | expiración JWT (default: `7d`)                                   |
| `JWT_ISSUER`           | issuer JWT (default: `game-sage`)                                |
| `JWT_AUDIENCE`         | audiencia JWT (default: `game-sage-users`)                       |
| `CORS_ORIGIN`          | orígenes permitidos en producción                                |
| `EUR_TO_USD_RATE`      | conversión EUR->USD para Stripe (default: `1.08`)                |
| `GOOGLE_CLIENT_ID`     | OAuth Google (login/registro social)                             |
| `GITHUB_CLIENT_ID`     | OAuth GitHub (login/registro social)                             |
| `GITHUB_CLIENT_SECRET` | intercambio OAuth GitHub (backend)                               |
| `SMTP_HOST`            | SMTP para envío (recuperación password)                          |
| `SMTP_PORT`            | puerto SMTP                                                      |
| `SMTP_USER`            | usuario SMTP                                                     |
| `SMTP_PASS`            | password SMTP                                                    |
| `SMTP_FROM`            | remitente SMTP                                                   |
| `SMTP_FROM_NAME`       | nombre visual del remitente (si no se define, default en código) |
| `PUBLIC_APP_URL`       | URL pública de la app (correos e imágenes absolutas)             |
| `FRONTEND_URL`         | alternativa a `PUBLIC_APP_URL`                                   |
| `APP_URL`              | alternativa a `PUBLIC_APP_URL`                                   |
| `GITHUB_TOKEN`         | token para MCP GitHub (opcional)                                 |
| `JIRA_URL`             | URL Jira Cloud para MCP (opcional)                               |
| `JIRA_USERNAME`        | email Atlassian para MCP (opcional)                              |
| `JIRA_API_TOKEN`       | API token Atlassian para MCP (opcional)                          |

### 4) Integración opcional con Cursor (MCP)

El repo define servidores MCP en [`.cursor/mcp.json`](.cursor/mcp.json) (GitHub, PostgreSQL, Jira vía `uvx mcp-atlassian`). No es una extensión oficial de Atlassian; hay que activarlos en Cursor.

1. Completa en `.env`: `GITHUB_TOKEN`, `POSTGRES_PRISMA_URL`, `JIRA_URL`, `JIRA_USERNAME`, `JIRA_API_TOKEN` (token en [Atlassian → API tokens](https://id.atlassian.com/manage-profile/security/api-tokens)).
2. Ejecuta `npm run setup:cursor-access` (Windows: sincroniza variables MCP al entorno de usuario e instala `uv` si no está).
3. **Cierra y vuelve a abrir Cursor.**
4. En **Settings → MCP**, habilita `github`, `jira` y `postgres` si aparecen en Disabled.
5. Si hay errores de otro servidor MCP (JSON roto, p. ej. extensión GitKraken), corrígelos primero; pueden impedir cargar el resto.
6. Tras cambios: **Developer: Reload Window**. Si Jira queda en `Not connected`, desactívalo y reactívalo en MCP y reinicia Cursor.

Proyecto Jira de referencia: **PI** (Proyecto Intermodular). Convenciones mínimas: `Story Points` enteros en user stories/tasks; no cerrar sprints desde Cursor (solo completar issues). Detalle en [`.cursor/skills/atlassian-workflows/SKILL.md`](.cursor/skills/atlassian-workflows/SKILL.md).

---

## Documentación y evidencias

Producción:

- App: [https://gamingsage.vercel.app/](https://gamingsage.vercel.app/)
- Health: [https://gamingsage.vercel.app/api/health](https://gamingsage.vercel.app/api/health)
- Swagger: [API Docs](https://gamingsage.vercel.app/api-docs/)
- Compodoc: [Compodoc Web](https://gamingsage.vercel.app/docs/)

Referencias:

- Monorepo: [../README.md](../README.md) · acceso Vercel (usuario / admin): [sección 6 — acceso en producción](../README.md#acceso-en-producción-vercel) · capturas y diagramas: [../docs/](../docs/)
- Confluence: [Web y API (hub)](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/73957377)
- PDF Confluence (monorepo): [../docs/confluence/espacio-pi-completo.pdf](../docs/confluence/espacio-pi-completo.pdf) · [../docs/jira/resumen-gestion-jira.pdf](../docs/jira/resumen-gestion-jira.pdf)

---

## Scripts BI relacionados (Power BI)

Requisitos: Python 3.9+ y `POSTGRES_PRISMA_URL` en `.env` (exportación). Estructura de datos de seed: [`backend-data/README.md`](backend-data/README.md).

- Exportar PostgreSQL a Excel: `py -3 src/backend/scripts/postgreToExcel.py`
- Procesar JSON de ejemplo a Excel: `python src/backend/scripts/jsonToExcel.py`

Ficheros: [`postgreToExcel.py`](src/backend/scripts/postgreToExcel.py), [`jsonToExcel.py`](src/backend/scripts/jsonToExcel.py).
