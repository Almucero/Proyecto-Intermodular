---
name: angular-code-review
description: Revisa cambios Angular desde git diff, clasifica hallazgos y crea tickets Jira para problemas criticos o mejoras. Usar cuando se pida una revision tecnica.
---

# Angular Code Review

## Flujo
1. Analizar `git diff`.
2. Detectar:
   - componentes sin OnPush,
   - subscribes sin cleanup,
   - patrones obsoletos de inputs/outputs,
   - servicios sin manejo de errores,
   - logica compleja en templates.
3. Clasificar hallazgos:
   - Critico
   - Mejora
   - Nit
4. Crear Jira para Critico y Mejora.
5. Devolver resumen con tickets creados.
