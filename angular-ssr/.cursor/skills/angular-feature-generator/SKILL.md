---
name: angular-feature-generator
description: Genera estructura base de una nueva parte funcional Angular adaptada a la arquitectura real del proyecto, como paginas, componentes compartidos o gestion de entidades en core. Usar cuando se pida crear estructura nueva reutilizable sin romper la organizacion existente.
---

# Angular Structure Generator

## Flujo

1. Identificar que tipo de estructura nueva encaja con el proyecto:
   - pagina en `src/app/pages/`,
   - componente reutilizable en `src/app/shared/components/`,
   - directiva o pipe reutilizable,
   - nueva gestion de entidad en `core` (`model`, `repositories`, `services`, `factory`).
2. Crear solo la estructura coherente con el patron ya existente del proyecto.
3. Si hay nuevas rutas, registrarlas en `app.routes.ts` respetando el enrutado actual.
4. Si hay texto visible nuevo, actualizar `src/assets/i18n/`.
5. Si MCP Atlassian esta configurado y el flujo lo requiere, crear ticket Jira y documentacion asociada.

## Resultado esperado

- Estructura consistente con la organizacion real de GameSage SSR.
- Integracion con routing, SSR, i18n y arquitectura `core` sin romper flujos existentes.
