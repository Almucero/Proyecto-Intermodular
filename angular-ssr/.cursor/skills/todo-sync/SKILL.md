---
name: todo-sync
description: Sincroniza TODO y FIXME del codigo con Jira creando issues y anotando la clave en comentarios. Usar cuando se solicite trazabilidad de deuda tecnica.
---

# TODO Sync

## Flujo
1. Escanear `TODO` y `FIXME` en `*.ts`, `*.html`, `*.scss`.
2. Ignorar entradas que ya tengan formato `TODO [CLAVE-123]`.
3. Crear issue Jira:
   - `FIXME` -> Bug
   - `TODO` -> Task
4. Reescribir comentario con clave del ticket.
5. Para issues cerradas `todo-sync`, limpiar o marcar como resueltas.
