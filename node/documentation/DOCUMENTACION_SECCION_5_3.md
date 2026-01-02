# DOCUMENTACIÓN TÉCNICA - VOLUMEN V: CHAT IA & MÓDULOS AUXILIARES

Proyecto: **Plataforma de Videojuegos (Backend Node.js/Express)**

> **Nota**: Este documento corresponde a la **Tercera y Última Parte de la Sección 5** del Índice Maestro. Cubre la integración de Inteligencia Artificial y la gestión de contenido multimedia.

---

## 5.5 Módulo de Chat IA (`/src/modules/chat`)

Este módulo implementa un asistente virtual contextual ("Sage") capaz de recomendar productos del catálogo en tiempo real.

### 5.5.1 Arquitectura de la IA

Se utiliza el **Vercel AI SDK** (`ai` y `@ai-sdk/google`) para normatizar la comunicación con el modelo **Gemini 2.5 Flash**.

- **Modelo Principal**: `gemini-2.5-flash` (Optimizado para latencia y coste).
- **Modelo Fallback**: `gemini-2.5-flash-lite` (Si el principal falla o excede cuota).
- **Estrategia de Memoria**: El contexto de la conversación se reconstruye en cada petición leyendo los últimos 10 mensajes de la sesión en la base de datos (`prisma.chatMessage`).

### 5.5.2 System Prompt ("La Personalidad")

El comportamiento del asistente se define rígidamente en el código (`chat.service.ts`).

- **Rol**: Vendedor experto y gamer.
- **Restricciones**:
  1. Solo puede recomendar juegos encontrados mediante la herramienta `searchGames`.
  2. No debe inventar títulos (Hallucination prevention).
  3. Debe manejar múltiples idiomas (Español, Inglés, Francés, etc.).

### 5.5.3 Integración de Herramientas (Tool Calling)

La IA no accede directamente a la BD. Usa **Functions/Tools** definidas explícitamente.

**Herramienta: `searchGames`**

- **Descripción para la IA**: _"Busca videojuegos en la base de datos por nombre, género o descripción"_ .
- **Input**: `{ query: string }`.
- **Ejecución**:
  1. La IA decide llamar a la herramienta si el usuario pregunta "¿Tenéis juegos de RPG?".
  2. El backend ejecuta una consulta `prisma.game.findMany` buscando coincidencias en:
     - Título (`contains`).
     - Descripción.
     - Nombre de Género (relación anidada).
  3. El backend devuelve un JSON simplificado (ID, Título, Precio, Géneros, Plataformas).
  4. La IA lee ese JSON y redacta la respuesta final al usuario.

---

## 5.6 Módulo Multimedia (`/src/modules/media`)

Gestión centralizada de activos binarios (imágenes) delegando el almacenamiento pesado a **Cloudinary**.

### 5.6.1 Estrategia de Carga (Upload)

La subida de archivos se maneja en dos fases para no bloquear el Event Loop de Node.js:

1. **Recepción (Multer MemoryStorage)**:
   - El middleware `multer` (configurado en las rutas) intercepta la petición `multipart/form-data`.
   - Almacena el archivo temporalmente en la memoria RAM (`req.file.buffer`).
2. **Streaming a la Nube (Cloudinary)**:
   - El servicio `media.service.ts` toma el buffer y lo transmite a Cloudinary mediante `upload_stream`.
   - Esto evita guardar archivos en el disco local del servidor (esencial para despliegues serverless o contenedores efímeros).

### 5.6.2 Organización de Carpetas

El sistema organiza automáticamente los assets en Cloudinary para mantener el orden:

- **Juegos**: `gameImages/{titulo-sanitizado}/` (ej: `gameImages/the-witcher-3`).
- **Usuarios**: `userImages/{nickname-sanitizado}/`.

### 5.6.3 Endpoints Principales

| Endpoint            | Verbo    | Descripción                                                         |
| :------------------ | :------- | :------------------------------------------------------------------ |
| `/api/media/upload` | `POST`   | Sube un archivo. Requiere `type` ('user'\|'game') e `id`.           |
| `/api/media/:id`    | `DELETE` | Elimina el registro en BD y el archivo en Cloudinary.               |
| `/api/media/:id`    | `PUT`    | Reemplaza un archivo existente (borra el anterior y sube el nuevo). |

---

## 5.7 Módulos de Catálogo Auxiliar

Módulos CRUD estándar para mantener las tablas maestras y la integridad referencial.

### 5.7.1 Géneros, Plataformas, Desarrolladores, Editoras

Ubicación: `/src/modules/{genres, platforms, developers, publishers}`.

- **Funcionalidad**: Permiten a los administradores crear, listar, editar y borrar las categorías taxonómicas del sistema.
- **Integridad**:
  - Todos tienen la restricción `@unique` en el nombre para evitar duplicados (ej: no tener "RPG" y "Rpg").
  - Las rutas de modificación (POST, PATCH, DELETE) están estrictamente protegidas con `auth` + `adminOnly`.
