---
name: angular-feature-generator
description: Genera estructura base de una feature Angular con componente, servicio, modelo y rutas lazy. Usar cuando se pida crear una nueva feature, scaffold o modulo funcional.
---

# Angular Feature Generator

## Flujo
1. Solicitar nombre de feature.
2. Crear estructura:
   - `src/app/features/{nombre}/`
   - componente standalone
   - servicio tipado
   - modelo
   - rutas lazy
3. Registrar ruta en `app.routes.ts`.
4. Si MCP Atlassian esta configurado, crear ticket Jira y pagina Confluence asociada.

## Resultado esperado
- Estructura consistente con rules de componentes y servicios.
- Integracion con routing sin romper SSR.
