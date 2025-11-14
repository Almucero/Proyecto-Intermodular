# Jira Task Breakdown - GameSage API Project

## Nota Inicial

**Estado del proyecto al inicio**: El proyecto fue clonado de un repositorio existente con:

- ✅ Node.js + Express + TypeScript ya configurado (ESM).
- ✅ PostgreSQL + Prisma ORM integrado y configurado.
- ✅ Variables de entorno y archivos de config (`env.ts`, `db.ts`, `swagger.ts`).
- ✅ User module preliminar (`users.controller.ts`, `users.service.ts`, `users.routes.ts`).
- ✅ Tests iniciales para User module (Jest + supertest configurado).
- ✅ Dependencias core ya instaladas (express, typescript, nodemon, zod, bcrypt, jsonwebtoken, etc.).
- ✅ Estructura de carpetas base establecida (src/modules/, src/middleware/, src/config/, src/utils/, etc.).

**A partir de este punto se desarrollaron**:

- Módulos Developers, Publishers, Games (CRUD completo).
- Sistema de autorización con roles (admin/user).
- Admin sync desde variables de entorno.
- Sanitización de respuestas (sin createdAt, passwordHash).
- Filtrado avanzado por query params.
- Inclusión de relaciones en detalles.
- Scripts de datos (seed, clean).
- Mejoras de Swagger UI.
- Expansión de tests.

---

## Épica 0: Setup y Infraestructura Base (YA COMPLETADO AL CLONAR)

### TASK-000: Proyecto base ya configurado

- **Tipo**: Setup/Inicial
- **Descripción**: Proyecto clonado con estructura base, dependencias e User module preliminar.
- **Status**: ✅ RECIBIDO COMPLETADO
- **Incluía**:
  - Node.js 18+, Express 5, TypeScript con ESM.
  - `tsconfig.json` configurado.
  - `package.json` con scripts y dependencias core.
  - PostgreSQL + Prisma (`schema.prisma`, cliente generado).
  - `src/config/` (env.ts, db.ts, swagger.ts).
  - `src/middleware/` (auth.ts, authorize.ts, validate.ts, error.ts, rateLimiter.ts, requestLogger.ts).
  - `src/modules/users/` (controller, service, routes, schema).
  - `src/tests/` (users.test.ts, auth.test.ts con casos iniciales).
  - `src/utils/logger.ts` con Winston.
  - `jest.config.js`, `nodemon.json`, `.gitignore`.

---

## Épica 1: Autenticación, Autorización y Admin System

(Mejoras y completitud del sistema inicial)

### TASK-001: Mejorar y completar autenticación JWT

- **Tipo**: Task
- **Descripción**: Completar y mejorar endpoints de autenticación (`POST /api/auth/register`, `POST /api/auth/login`).
- **Subtareas**:
  - Verificar y completar endpoints existentes.
  - Asegurar hashing correcto de contraseñas con bcrypt.
  - Incluir `isAdmin` flag en payload JWT.
  - Validar respuestas sin exponer `passwordHash`.
  - Mejorar tests de auth (casos exitosos y errores).
- **Status**: ✅ COMPLETADO

### TASK-002: Mejorar middleware de autenticación y autorización

- **Tipo**: Task
- **Descripción**: Mejoras a `auth.ts` y `authorize.ts` existentes.
- **Subtareas**:
  - Refinar validación de Bearer tokens en `auth.ts`.
  - Implementar fallback a `ADMIN_EMAILS` env var en `authorize.ts`.
  - Mejorar manejo de errores (401, 403 responses).
  - Añadir tests para middleware mejorado.
- **Status**: ✅ COMPLETADO

### TASK-003: Implementar gestión de administradores desde env vars

- **Tipo**: Task
- **Descripción**: Sincronizar administradores desde variables de entorno (ADMIN_EMAILS, ADMIN_PASSWORDS, ADMIN_NAMES).
- **Subtareas**:
  - Crear script `src/scripts/seedAdmin.ts`.
  - Parseo de CSV en env vars.
  - Eliminar admins en BD que no estén en ADMIN_EMAILS.
  - Crear/actualizar admins listados en ADMIN_EMAILS.
  - Integrar seedAdmin en `npm run dev` y `npm run build:full`.
  - Tests del seed script.
- **Status**: ✅ COMPLETADO

---

## Épica 2: Modelos de Datos y CRUD (Developers, Publishers, Games)

### TASK-004: Mejorar y completar CRUD de Users

- **Tipo**: Task
- **Descripción**: Mejoras al User module existente (ya tenía controller, service, routes, schema y tests iniciales).
- **Subtareas**:
  - Revisar y completar endpoints User (GET list, GET :id, GET me, PATCH me, PATCH me/password, PATCH :id, DELETE :id).
  - Sanitizar `passwordHash` en todas las respuestas.
  - Remover `createdAt` de respuestas de usuario.
  - Implementar filtrado por query params (email, name, isAdmin).
  - Mejorar tests de Users (cobertura completa).
  - Validación con Zod de inputs.
- **Status**: ✅ COMPLETADO

### TASK-005: Implementar CRUD de Developers

- **Tipo**: Task
- **Descripción**: Endpoints para gestión de desarrolladores (CRUD).
- **Subtareas**:
  - Crear `src/modules/developers/developers.controller.ts`, `.service.ts`, `.routes.ts`.
  - GET `/api/developers` (lista pública).
  - GET `/api/developers/:id` (detalle con juegos incluidos).
  - POST `/api/developers` (crear, solo admin).
  - PATCH `/api/developers/:id` (actualizar, solo admin).
  - DELETE `/api/developers/:id` (eliminar, solo admin).
  - Tests de developers.
- **Status**: ✅ COMPLETADO

### TASK-006: Implementar CRUD de Publishers

- **Tipo**: Task
- **Descripción**: Endpoints para gestión de publishers (CRUD).
- **Subtareas**:
  - Crear `src/modules/publishers/publishers.controller.ts`, `.service.ts`, `.routes.ts`.
  - GET `/api/publishers` (lista pública).
  - GET `/api/publishers/:id` (detalle con juegos incluidos).
  - POST `/api/publishers` (crear, solo admin).
  - PATCH `/api/publishers/:id` (actualizar, solo admin).
  - DELETE `/api/publishers/:id` (eliminar, solo admin).
  - Tests de publishers.
- **Status**: ✅ COMPLETADO

### TASK-007: Implementar CRUD de Games

- **Tipo**: Task
- **Descripción**: Endpoints para gestión de juegos (CRUD) con relaciones a Developer y Publisher.
- **Subtareas**:
  - Crear `src/modules/games/games.controller.ts`, `.service.ts`, `.routes.ts`.
  - GET `/api/games` (lista pública).
  - GET `/api/games/:id` (detalle con developer y publisher incluidos).
  - POST `/api/games` (crear, solo admin, validación de fecha).
  - PATCH `/api/games/:id` (actualizar, solo admin).
  - DELETE `/api/games/:id` (eliminar, solo admin).
  - Validación y conversión de `releaseDate` (string -> Date).
  - Manejo de errores Prisma (P2002, P2003, P2025).
  - Tests de games.
- **Status**: ✅ COMPLETADO

---

## Épica 3: Validación, Seguridad y Middleware

### TASK-008: Completar validación con Zod

- **Tipo**: Task
- **Descripción**: Asegurar validación Zod en todos los módulos.
- **Subtareas**:
  - Revisar schemas Zod existentes en users, developers, publishers, games.
  - Crear middleware `src/middleware/validate.ts` (si no existe) para aplicar schemas.
  - Validar inputs en creación y actualización.
  - Tests de validación (400 Bad Request).
- **Status**: ✅ COMPLETADO

### TASK-009: Mejorar middleware de seguridad

- **Tipo**: Task
- **Descripción**: Asegurar funcionamiento óptimo de middlewares existentes.
- **Subtareas**:
  - Revisar `src/middleware/error.ts` para error handling centralizado.
  - Revisar `src/middleware/rateLimiter.ts` (rate limiting activo).
  - Revisar `src/middleware/requestLogger.ts` (logging de requests).
  - Tests de seguridad y error handling.
- **Status**: ✅ COMPLETADO

---

## Épica 4: Documentación y Testing

### TASK-010: Mejorar y completar Swagger/OpenAPI

- **Tipo**: Task
- **Descripción**: Mejoras a `src/config/swagger.ts` existente.
- **Subtareas**:
  - Revisar y mejorar documentación de endpoints con docblocks JSDoc.
  - Actualizar schemas (User, Game, Developer, Publisher, Error, etc.).
  - Remover `createdAt` de schemas de respuesta.
  - Remover seguridad global de endpoints (solo en protegidos).
  - Documentar parámetros de filtrado (query params).
  - Asegurar endpoints públicos sin candado en Swagger UI.
- **Status**: ✅ COMPLETADO

### TASK-011: Completar suite de tests

- **Tipo**: Task
- **Descripción**: Expansión y mejora de tests existentes.
- **Subtareas**:
  - Mejorar tests de Auth (`src/tests/auth.test.ts`).
  - Mejorar tests de Users (`src/tests/users.test.ts`).
  - Crear tests para Developers.
  - Crear tests para Publishers.
  - Crear tests para Games.
  - Asegurar cobertura mínima y 33+ tests pasando.
- **Status**: ✅ COMPLETADO

---

## Épica 5: Mejoras de API y Respuestas

### TASK-012: Sanitizar respuestas (sin passwordHash ni createdAt)

- **Tipo**: Task
- **Descripción**: Garantizar que campos sensibles nunca se retornen en respuestas.
- **Subtareas**:
  - Remover `createdAt` de todos los listados (findMany) en users, developers, publishers, games.
  - Remover `createdAt` de detalles (findOne) en todos los módulos.
  - Remover `createdAt` de objetos incluidos en relaciones.
  - Remover `passwordHash` de todas las respuestas de usuario.
  - Tests para verificar ausencia de campos sensibles.
- **Status**: ✅ COMPLETADO

### TASK-013: Implementar inclusions de relaciones en findOne

- **Tipo**: Task
- **Descripción**: Traer datos relacionados cuando se obtiene un detalle (con campos filtrados).
- **Subtareas**:
  - Games findOne: incluir Developer y Publisher (solo id, name).
  - Developer findOne: incluir sus Games (solo campos públicos).
  - Publisher findOne: incluir sus Games (solo campos públicos).
  - User findOne: no incluir datos relacionados (privacidad).
  - Solo retornar campos permitidos (sin `createdAt`, sin `passwordHash`).
- **Status**: ✅ COMPLETADO

### TASK-014: Implementar filtrado avanzado por query params

- **Tipo**: Task
- **Descripción**: Permitir búsqueda/filtrado flexible en endpoints GET de listados.
- **Subtareas**:
  - Developers: filtrar por `name` (contains, case-insensitive).
  - Games: filtrar por `title` (contains, case-insensitive) y `price` (exact match).
  - Publishers: filtrar por `name` (contains, case-insensitive).
  - Users: filtrar por `email`, `name`, `isAdmin`.
  - Combinar múltiples filtros en una misma request.
  - NO permitir filtrado por `id` ni `*Id` (relaciones).
  - Documentar parámetros en Swagger.
- **Status**: ✅ COMPLETADO

---

## Épica 6: Utilidades de Datos y Scripts

### TASK-015: Crear script de limpieza de datos

- **Tipo**: Task
- **Descripción**: Script `npm run clean:data` para borrar datos de prueba.
- **Subtareas**:
  - Crear `src/scripts/cleanData.ts`.
  - Borrar Games, Developers, Publishers.
  - Borrar Users NO admin (mantener admins).
  - Sincronizar admins desde ADMIN_EMAILS.
  - Comando en package.json.
- **Status**: ✅ COMPLETADO

### TASK-016: Crear script de seed de datos realistas

- **Tipo**: Task
- **Descripción**: Script `npm run seed:data` para poblar DB con datos de prueba.
- **Subtareas**:
  - Crear `src/scripts/seedData.ts`.
  - Crear 10 Developers, 10 Publishers, 10 Games, 10 Users (NO admin).
  - Datos realistas con valores válidos.
  - `seed:data` ejecuta primero `clean:data`.
  - Comando en package.json.
- **Status**: ✅ COMPLETADO

---

## Épica 7: Configuración, Build y Deployment

### TASK-017: Configurar scripts npm

- **Tipo**: Task
- **Descripción**: Actualizar scripts en package.json.
- **Subtareas**:
  - `npm run dev`: inicia seedAdmin + nodemon.
  - `npm run build`: compila TypeScript.
  - `npm run build:full`: prisma generate + seedAdmin + build.
  - `npm start`: ejecuta desde dist/.
  - `npm test`: tests con Jest.
  - `npm run seed:admin`, `npm run seed:data`, `npm run clean:data`.
- **Status**: ✅ COMPLETADO

### TASK-018: Actualizar README con documentación completa

- **Tipo**: Task
- **Descripción**: Documentación del proyecto.
- **Subtareas**:
  - Explicar comandos npm principales.
  - Quick start guide (setup .env, install, build, test, dev).
  - Explicar estructura de carpetas.
  - Variables de entorno requeridas.
  - Información sobre Prisma y migraciones.
  - Información sobre Swagger UI en `/api-docs`.
  - Notas sobre seedAdmin, seed:data, clean:data.
- **Status**: ✅ COMPLETADO

### TASK-019: Verificar configuración de nodemon

- **Tipo**: Task
- **Descripción**: Setup de hot-reload en desarrollo.
- **Subtareas**:
  - Crear `nodemon.json` (si no existe).
  - Configurar para recargar en cambios TS.
  - Excluir node_modules, dist, prisma.
- **Status**: ✅ COMPLETADO

---

## Épica 8: QA, Testing Final y Polish

### TASK-020: Verificación final y QA

- **Tipo**: Task
- **Descripción**: Pruebas finales de funcionalidad.
- **Subtareas**:
  - Todos los tests pasan (33+ tests).
  - Swagger UI accesible en `/api-docs`.
  - Filtros funcionan correctamente.
  - Admin sync desde ADMIN_EMAILS funciona en `npm run dev` y `npm run build:full`.
  - Clean y seed scripts funcionan sin errores.
  - Sin campos sensibles en respuestas.
  - JWT válido después de login.
  - Rate limiting activo.
  - Logging funcional.
- **Status**: ✅ COMPLETADO

---

## Resumen del Proyecto

### Estado Inicial (Clonado)

- ✅ Setup base (Node.js, Express, TypeScript, ESM)
- ✅ PostgreSQL + Prisma ORM
- ✅ User module preliminar con controller, service, routes, schema
- ✅ Tests iniciales (Jest + supertest)
- ✅ Dependencias principales instaladas
- ✅ Estructura de carpetas establecida

### Trabajo Realizado (Esta sesión)

- ✅ Desarrollo de módulos Developers, Publishers, Games (CRUD completo)
- ✅ Sistema de autorización admin con fallback a env vars
- ✅ Admin sync desde ADMIN_EMAILS (seedAdmin.ts)
- ✅ Sanitización de respuestas (sin createdAt, passwordHash)
- ✅ Filtrado avanzado por query params en listados
- ✅ Inclusions de relaciones en detalles (findOne)
- ✅ Scripts de datos (cleanData.ts, seedData.ts)
- ✅ Mejoras en Swagger UI (seguridad, schemas, documentación)
- ✅ Expansión de tests (33+ tests pasando)
- ✅ README actualizado

### Resumen de Tareas

- **Total de tareas**: 20 (contando trabajo realizado post-clone)
- **Épicas**: 8
- **Estado actual**: ✅ TODO COMPLETADO

### Próximos pasos opcionales (backlog futura)

- TASK-021: Dockerización de la app (Dockerfile + docker-compose).
- TASK-022: Configuración de CI/CD (GitHub Actions o similar).
- TASK-023: Migración a producción (Render, AWS, etc.).
- TASK-024: Tests de integración y load testing.
- TASK-025: Documentación adicional (API examples, Bruno collection).
- TASK-026: Implementar paginación en listados.
- TASK-027: Implementar ordenamiento configurable.
- TASK-028: Añadir más campos/validaciones a modelos.
- TASK-029: Auditoría y logging avanzado.
- TASK-030: Webhooks o event system.
