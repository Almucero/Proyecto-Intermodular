---
name: jira-manager
description: Gestiona tickets de Jira desde Cursor mediante MCP Atlassian Rovo. Usar para crear, buscar, editar y transicionar issues con trazabilidad del trabajo.
---

# Jira Manager

## Operaciones
- Crear issues.
- Buscar issues por JQL.
- Editar campos.
- Consultar transiciones y mover de estado.
- Comentar tickets al cerrar tareas.

## Requisito
- MCP Atlassian Rovo instalado y autenticado.
- `cloudId` disponible.

## Flujo recomendado
1. Consultar issue.
2. Mover a `In Progress`.
3. Ejecutar cambios.
4. Comentar resultado.
5. Mover a `Done`.
