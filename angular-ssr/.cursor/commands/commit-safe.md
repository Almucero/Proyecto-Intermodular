---
description: Valida el proyecto antes de hacer commit siguiendo el orden obligatorio del equipo
---

# Validacion previa a commit

Ejecutar en orden estricto:

1. `npm run build:ssr`
2. `npm run lint`
3. `npm audit --omit=dev`

Reglas:

- Si algun paso falla, detener y corregir antes de commitear.
- No saltar el orden.
- No ejecutar `npm run vercel-build` en local; ese comando es solo para Vercel.
- Solo proponer commit cuando los tres pasos esten en verde.
- Definir el titulo del commit unicamente desde los archivos staged y su diff real.
- No incluir en el titulo referencias a contexto conversacional, sprints u operaciones no reflejadas en el diff staged.
