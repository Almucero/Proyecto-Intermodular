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
2. `npm run vercel-build`
3. `npm run lint`
4. `npm audit --omit=dev`

No hacer commit si alguno falla, salvo instruccion explicita del usuario.

## Entorno
Copiar `.env.example` a `.env` y completar variables requeridas por backend, Prisma y despliegue.

## Instalacion de dependencias
- Comando obligatorio: `npm run setup:secure`
- No usar `npm install` directo salvo instruccion explicita del usuario.
