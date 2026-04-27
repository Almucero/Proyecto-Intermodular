---
name: deploy-staging
description: Estandariza validaciones previas y verificacion posterior para despliegues automaticos de GameSage SSR en Vercel al actualizar main. Usar cuando se solicite preparar deploy o revisar incidencias post-deploy.
---

# Deploy en Vercel (main)

## Prerrequisitos
- Cambios listos para `main`.
- Variables de entorno en Vercel correctamente configuradas.
- Revisar que cambios de seguridad (CSP/headers/rewrites) no bloqueen recursos externos necesarios.

## Paso 1: Validaciones
Ejecutar:
```bash
npm run lint
npm run test:backend
npm run vercel-build
```
Si falla algun paso, detener y corregir.

## Paso 2: Despliegue
- Hacer commit en `main`.
- Vercel ejecuta despliegue automaticamente.

## Paso 3: Verificacion post-deploy
Comprobar como minimo:
- Home (`https://gamingsage.vercel.app/`)
- API health (`https://gamingsage.vercel.app/api/health`)
- Swagger (`https://gamingsage.vercel.app/api-docs/`)
- Compodoc (`https://gamingsage.vercel.app/docs/`)

## Manejo de errores
- Si falla build: revisar logs y corregir antes de reintentar.
- Si falla endpoint de salud: revisar variables y logs del backend.
- Si fallan recursos por seguridad: revisar CSP/headers y listas de dominios permitidos.
- Si fallan assets (MIME/404): revisar rewrites y rutas estaticas.
