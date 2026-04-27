---
description: Valida el proyecto antes de hacer commit siguiendo el orden obligatorio del equipo
---

# Validacion previa a commit

Ejecutar en orden estricto:

1. `npm run build:ssr`
2. `npm run vercel-build`
3. `npm run lint`
4. `npm audit --omit=dev`

Reglas:

- Si algun paso falla, detener y corregir antes de commitear.
- No saltar el orden.
- Solo proponer commit cuando los cuatro pasos esten en verde.
