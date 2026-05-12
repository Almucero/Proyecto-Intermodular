# 💻 Cursor IDE Configuration (`.cursor`)

Este directorio contiene toda la configuración avanzada, reglas de IA, integraciones y flujos de automatización para **Cursor**, el IDE potenciado por Inteligencia Artificial utilizado en el proyecto Game Sage.

## 📂 ¿Qué contiene este directorio?

El directorio está estructurado en varios subdirectorios y archivos de configuración esenciales para moldear el comportamiento del agente de IA y automatizar tareas repetitivas:

### 1. `mcp.json` (Model Context Protocol)
Configura los servidores MCP que permiten a la IA interactuar con servicios externos de manera autónoma.
- **Qué hace:** Proporciona a la IA acceso al entorno real (ej. ejecutar consultas SQL contra PostgreSQL, gestionar tickets en Jira, o leer repositorios de GitHub).
- **Ejemplo de uso:** Si le pides a la IA *"Muéstrame el ticket de Jira asignado a este error"*, la IA usa la conexión MCP de Jira para obtener los datos directamente sin que tengas que abrir el navegador.

### 2. `rules/` (Cursor Rules - `.mdc`)
Archivos Markdown con contexto estructurado (`.mdc`) que actúan como "leyes" o "guardarraíles" para la generación de código.
- **Qué contiene:** `angular-standards.mdc`, `architecture.mdc`, `backend-api.mdc`, `testing.mdc`, etc.
- **Qué hace:** Obliga a la IA a seguir el stack y la arquitectura del proyecto (Angular 20 Standalone, Express + Prisma, SSR, convenciones de nombres, etc.). Evita que la IA invente arquitecturas o use código legacy.

### 3. `commands/` (Slash Commands)
Atajos conversacionales predefinidos para realizar operaciones comunes sin necesidad de escribir prompts largos.
- **Qué contiene:** Scripts como `commit-safe.md` o `fix-bug.md`.
- **Cómo usarlo:** En el chat de Cursor puedes escribir `/commit-safe` y la IA automáticamente correrá el linter, los tests, formateará el código y creará un mensaje de commit estructurado en español siguiendo los estándares del proyecto.

### 4. `hooks.json` & `hooks/` (Event Hooks)
Scripts (principalmente PowerShell en este proyecto) que se ejecutan automáticamente en respuesta a acciones dentro del IDE.
- **Qué contiene:** `lint-and-format.ps1`, `block-dangerous.ps1`, `audit-mcp.ps1`.
- **Qué hace:** Por ejemplo, el evento `afterFileEdit` puede disparar `lint-and-format.ps1` de forma silenciosa para asegurar que el código generado por la IA cumple con Prettier/ESLint inmediatamente después de insertarlo en el editor.

### 5. `skills/` (Workflow Skills)
Habilidades complejas o flujos de trabajo multi-paso enseñados a la IA.
- **Qué contiene:** `angular-feature-generator`, `atlassian-workflows`, `deploy-staging`.
- **Qué hace:** Permite a la IA realizar tareas complejas (ej. "Crea el componente de Perfil"). La IA sabrá que debe crear el componente, su spec, actualizar las rutas y añadir los estilos usando el flujo `angular-feature-generator`.

---

## 🛠️ Casos de Uso Concretos de Ejemplo

### Caso 1: Refactorización segura con reglas de arquitectura (`rules/`)
**Tú:** *"Crea un nuevo endpoint para listar desarrolladores."*
**Cómo actúa `.cursor`:** La IA lee silenciosamente `backend-api.mdc` y `architecture.mdc`. Automáticamente sabe que debe usar **Express**, que las validaciones se hacen con **Zod**, y que debe usar el patrón de arquitectura de controladores y servicios (sin mezclarlos), además de utilizar Prisma para base de datos.

### Caso 2: Gestión de Sprints (`mcp.json` + `skills/`)
**Tú:** *"Actualiza en Jira que ya he terminado la API de notificaciones."*
**Cómo actúa `.cursor`:** La IA detecta la intención, usa la habilidad `atlassian-workflows` para saber cómo interactuar, se conecta vía el servidor definido en `mcp.json` a Jira, busca tu tarea, la mueve a 'Done' y deja un comentario. Todo desde el chat.

### Caso 3: Cierre de jornada (`commands/` + `hooks/`)
**Tú:** Escribes `/commit-safe "feat: sistema de notificaciones completado"` en el chat.
**Cómo actúa `.cursor`:**
1. Ejecuta el comando definido en `commands/commit-safe.md`.
2. Lanza los `hooks/` precommit (compila SSR y pasa el linter).
3. Escribe el commit finalizando el flujo automáticamente.

---

## ⚙️ ¿Cómo usar o modificar esta carpeta?

- **Para añadir una nueva regla arquitectónica:** Crea un archivo `mi-regla.mdc` en la carpeta `rules/`. Cursor la leerá automáticamente en la siguiente conversación.
- **Para añadir accesos (ej. base de datos en pre-producción):** Modifica `mcp.json` para añadir las credenciales (¡idealmente leyendo de variables de entorno `.env`!).
- **Para crear un nuevo atajo en el chat:** Añade un archivo `.md` en `commands/` con el prompt estructurado.
