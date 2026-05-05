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
- Usar `User Story` como formato por defecto; reservar `Task` para trabajo breve o muy aislado.
- En `User Story` y `Task`, fijar siempre el equipo `Desarrolladores`.
- Salvo instruccion explicita en contra, cerrar como completado el trabajo efectivamente realizado.
- Fechas (`Start date` y `Due date`): usarlas como atributos del ticket solo cuando tengan sentido; mantener un uso parcial (aprox. 40% de US/TASK en lotes), no forzar en todos.
- Tener en cuenta que los sprints son de 2 semanas.
- Las user stories y tasks deben tener siempre `Story Points`.
- Los `Story Points` equivalen a horas estimadas y deben introducirse siempre como enteros.
- Prohibido cerrar/completar sprints desde Cursor bajo cualquier circunstancia.
- Para mantener historico, dejar los sprints visibles en backlog sin cerrarlos.
- Solo deben marcarse como completadas las user stories y tasks internas.
- Mantener los sprints visibles en backlog para conservar trazabilidad historica.
- Toda user story debe incluir subtareas siempre.
- Formato estricto de user story:
  - `Como ... quiero ... para ...`
  - `Criterios de aceptación`
  - `DoR`
  - `DoD`
- Formato visual obligatorio de user story en Jira:
  - Frase inicial unica: `Como ... **quiero** ... **para** ...`.
  - Encabezados en negrita: `**Criterios de aceptación**`, `**DoR**`, `**DoD**`.
  - Listas con viñetas `- ...` en criterios, DoR y DoD.
- Formato visual obligatorio de subtarea en Jira (sobre todo hijas de US):
  - Descripcion breve en la primera linea, sin encabezado `Descripción`.
  - Bloque `Subtareas:`.
  - Checklist en multiples lineas con `- [ ] ...`.
- Antes de cambios masivos en Jira, tomar 1 user story y 1 subtarea ya correctas como plantilla visual y replicarla.
- Despues de cambios masivos en Jira, comprobar 1-2 issues para confirmar render final correcto.
- Protocolo obligatorio antes de crear o editar tickets:
  1. Revisar 1 `User Story`, 1 `Task` y 1 `Subtarea` ya correctas del proyecto.
  2. Confirmar campos obligatorios: `Team = Desarrolladores`, `Story Points` enteros (US/TASK), `status`, `sprint`.
  3. Aplicar formato exacto de descripcion segun tipo de issue.
  4. Releer tickets creados/actualizados y validar render en Jira.
- Plantilla fija para `User Story`:
  - `Como ... **quiero** ... **para** ...`
  - `**Criterios de aceptación**` + lista `- ...`
  - `**DoR**` + lista `- ...`
  - `**DoD**` + lista `- ...`
- Plantilla fija para `Subtarea`:
  - Primera linea con descripcion breve directa.
  - `Subtareas:`
  - checklist en varias lineas con `- [ ] ...`.
- Plantilla recomendada para `Task`:
  - Objetivo breve en la primera linea.
  - Desarrollo breve en texto o lista simple.
  - Checklist `- [ ] ...` solo si aporta seguimiento real.
- Si se rellena un sprint desde commits por periodo, mantener secuencia temporal razonable e intercalar US/TASK de forma natural.
- Considerar autoria real de commits para asignar tickets entre las 2 personas del equipo cuando Jira lo permita.
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
- Si se crean user stories o tasks, mantener estructura real del proyecto. En US, subtareas obligatorias.
