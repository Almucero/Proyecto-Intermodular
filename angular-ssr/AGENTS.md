# GameSage SSR

## Descripcion

GameSage es una plataforma de videojuegos con frontend Angular SSR y backend Express en el mismo runtime Node.js. Incluye autenticacion, carrito, compras con Stripe, favoritos, chat con IA, Swagger y Compodoc en el mismo despliegue.

## Stack

- Frontend: Angular 20 SSR, Tailwind, Bootstrap, `@ngx-translate`.
- Backend: Express, Prisma, Zod, JWT, Helmet, Winston.
- Base de datos: PostgreSQL.
- Integraciones: Stripe, Cloudinary, Google/GitHub OAuth, Google AI.
- Testing: Jest/Supertest (backend), Karma/Jasmine (frontend).
- Despliegue: Vercel.

## Estructura

```text
src/
  app/                  # Frontend Angular (pages, shared, core)
  backend/              # API Express (modules, middleware, config)
  server.ts             # SSR + backend + estaticos
prisma/
scripts/
.cursor/
```

## Rama y flujo Git

- El proyecto usa una unica rama: `main`.
- El despliegue lo ejecuta Vercel automaticamente al hacer commit/push en `main`.
- Mensajes de commit en espanol, primera letra mayuscula.
- Si hay varios temas relacionados, separar con comas.
- Si hay cambios radicalmente distintos, separar bloques con ` + `.
- El titulo del commit debe basarse solo en el diff real que se va a commitear (staged), nunca en el contexto conversacional.
- No mencionar sprints, decisiones de chat o trabajo no incluido en los archivos staged.

## URLs de referencia en produccion

- Base: `https://gamingsage.vercel.app/`
- Health: `https://gamingsage.vercel.app/api/health`
- Swagger: `https://gamingsage.vercel.app/api-docs/`
- Compodoc: `https://gamingsage.vercel.app/docs/`

## Reglas operativas no negociables

- Tras cambios relevantes, actualizar `README.md` siguiendo su estructura actual.
- Cualquier cambio de logica relevante existente (endpoints, scripts, flujos) exige documentacion en README sin que el usuario tenga que pedirlo.
- El proyecto debe mantenerse con 0 vulnerabilidades conocidas.
- Cualquier cambio debe considerar despliegue en Vercel, incluyendo CSP/headers/rewrites para no romper recursos externos.
- El codigo nuevo/modificado debe quedar documentado en estilo tecnico e imparcial para mantener la calidad de Compodoc.
- Si un cambio introduce texto visible en la web, actualizar en el mismo cambio los JSON de `src/assets/i18n/` sin esperar peticion adicional.
- No usar `npm install` a secas en este proyecto. Para instalar/actualizar dependencias usar siempre `npm run setup:secure`.

## Convenciones backend

- Si se crea una nueva tabla/modelo, crear y conectar: `schema`, `service`, `controller`, `routes`, test y actualizacion de Swagger.
- Mantener estructura modular existente por dominio.

## Convenciones frontend

- Toda nueva gestion de datos debe respetar el flujo de `core` (model, repositories, services, factory).
- Si una logica es reutilizable, extraer a `shared`/directiva/pipe/componente en vez de dejarla aislada.
- Mantener compatibilidad SSR/hidratacion.

## Convenciones de tests

- Seguir formato logico y consistente con los tests existentes.
- En tests backend que creen o modifiquen datos, dejar la base de datos exactamente como estaba al finalizar cada test.

## Validacion obligatoria antes de commit

Si el usuario pide commit, ejecutar antes y en este orden:

1. `npm run build:ssr`
2. `npm run lint`
3. `npm audit --omit=dev`

No ejecutar `npm run vercel-build` en local: ese flujo es exclusivo del entorno de Vercel y puede regenerar artefactos no deseados (por ejemplo `docs/`).
No hacer commit si alguno falla, salvo instruccion explicita del usuario.

## Entorno

Copiar `.env.example` a `.env` y completar variables requeridas por backend, Prisma y despliegue.

## Cursor y MCP

- GitHub MCP usa `GITHUB_TOKEN`.
- PostgreSQL MCP usa `POSTGRES_PRISMA_URL`.
- Jira MCP usa `uvx mcp-atlassian` con `JIRA_URL`, `JIRA_USERNAME` y `JIRA_API_TOKEN`.
- Tras completar variables MCP en `.env`, ejecutar `npm run setup:cursor-access` y reiniciar Cursor.

### Jira desde Cursor (estandar de formato)

- Antes de crear/editar tickets Jira en lote, revisar 1 `User Story` y 1 `Subtarea` ya correctas del proyecto y usarlas como plantilla visual.
- `User Story` debe quedar con: frase `Como ... **quiero** ... **para** ...`, secciones `**Criterios de aceptación**`, `**DoR**`, `**DoD**` y listas con `-`.
- `Subtarea` debe quedar con: descripcion breve en la primera linea (sin titulo), bloque `Subtareas:` y checklist con items `- [ ]`.
- Tras escrituras masivas en Jira, validar tickets de muestra para confirmar que el render en Jira mantiene negritas y listas.
- En `User Story` y `Task`, asignar siempre el equipo `Desarrolladores`.
- Salvo indicacion explicita del usuario, dejar como completados los tickets que representen trabajo ya hecho.
- Aplicar `Start date` y `Due date` como atributos de Jira (no en descripcion) solo cuando sean relevantes; mantener uso parcial, orientativamente en ~40% de US/TASK creadas o actualizadas en lote.
- Prohibido cerrar/completar sprints desde Cursor.
- Los sprints deben mantenerse visibles en backlog; solo se marcan como completadas las US/TASK.
- Antes de escribir en Jira, revisar ejemplos existentes del proyecto (`User Story`, `Task`, `Subtarea`) y replicar su patron exacto.
- Checklist obligatoria antes de confirmar cambios Jira:
  - tipo de issue correcto (`User Story`/`Task`/`Subtarea`)
  - descripcion con plantilla correcta segun tipo
  - `Team = Desarrolladores` en US/TASK
  - `Story Points` enteros en US/TASK
  - estado final esperado (por defecto completado salvo indicacion contraria)
  - fechas como atributos (`Start date`/`Due date`) solo cuando aplique

## Instalacion de dependencias

- Comando obligatorio: `npm run setup:secure` en reemplazo absoluto de `npm install`.
- No usar `npm install` directo salvo instruccion explicita del usuario.
