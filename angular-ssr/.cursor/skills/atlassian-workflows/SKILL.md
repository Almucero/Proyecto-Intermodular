---
name: atlassian-workflows
description: Workflows compactos para Jira y Confluence desde Cursor mediante MCP Atlassian. Usar cuando se solicite gestionar tickets, documentar cambios, sincronizar TODOs o generar reportes de sprint.
---

# Atlassian workflows

## Requisito previo

- MCP Jira configurado con `uvx mcp-atlassian`.
- Espacio Confluence principal: `Proyecto Intermodular`.

## Flujos soportados

### 1. Gestion de tickets Jira

- Consultar, crear, editar, comentar y transicionar issues.
- Usar JQL para busquedas.
- Respetar nomenclatura real del proyecto:
  - Epics: `EPIC - ...`
  - User stories: `US-01: ...`, `US-02: ...`, etc
  - Tasks: `TASK-01: ...`, `TASK-02: ...`, etc
- Tener en cuenta que los sprints son de 2 semanas.
- Las user stories y tasks deben tener siempre `Story Points`.
- Los `Story Points` equivalen a horas estimadas y deben introducirse siempre como enteros.
- No completar nunca un sprint; solo deben completarse las user stories y tasks internas.
- Mantener los sprints visibles en backlog para conservar trazabilidad historica.
- Si se documenta backlog o sprints en Confluence, usar como referencia las paginas:
  - `Metodología Jira`
  - `Resumen Jira`

### 2. Documentacion en Confluence

- Buscar pagina existente.
- Actualizar si existe o crear si no existe.
- Incluir referencia a ticket Jira cuando aplique.
- La documentacion Angular principal debe concentrarse en la pagina `Documentación Angular-SSR`.
- Mantener formato, espaciados y estructura homogéneos con las paginas existentes.

### 3. Sincronizacion TODO-Jira

- Detectar `TODO` y `FIXME` sin clave.
- Crear issue correspondiente y anotar clave en el comentario.
- Evitar duplicados si ya existe clave de ticket.

### 4. Reporte de sprint

- Consultar sprint activo por JQL.
- Agrupar por estado y prioridad.
- Publicar resumen en Confluence.

## Principios

- Mantener trazabilidad Jira <-> codigo <-> documentacion.
- No ejecutar operaciones de escritura en Jira/Confluence sin confirmacion del usuario cuando exista impacto amplio.
- Si se crean epics, incluir descripcion estructurada, objetivo SMART y etiquetas siguiendo el formato existente del espacio.
- Si se crean user stories o tasks, mantener estructura con criterios de aceptación, DoR, DoD y subtareas cuando aplique.
