# DOCUMENTACIÓN TÉCNICA - VOLUMEN VI: TESTING, DESPLIEGUE Y OPERACIONES

**Proyecto: Plataforma de Videojuegos (Backend Node.js/Express)**

> **Nota**: Este documento corresponde a las **Secciones Finales (6, 7, 8 y 9)** del Índice Maestro. Cierra la documentación técnica cubriendo la estrategia de calidad, referencias, integración y despliegue.

---

## 6. Testing y Calidad (QA)

La estrategia de pruebas se centra en **Tests de Integración (E2E API)**. En lugar de mockear cada función interna, levantamos una instancia real de la aplicación (con una BD de pruebas o sandbox) y disparamos peticiones HTTP reales usando `supertest`. Esto garantiza que el contrato de la API funcione desde la perspectiva del cliente.

### 6.1 Stack de Pruebas

- **Runner**: `jest` (Configurado con soporte para ESM vía `cross-env NODE_OPTIONS=--experimental-vm-modules`).
- **HTTP Client**: `supertest` (Simula peticiones a la app Express sin abrir puertos de red).
- **Aserciones**: Matchers nativos de Jest (`expect(res.status).toBe(200)`).
- **Limpieza**: `prisma.$disconnect()` y hooks `afterAll` para limpiar datos creados.

### 6.2 Análisis de Casos de Prueba (`src/tests`)

A continuación, se documentan los escenarios críticos cubiertos por las suites de prueba:

#### 6.2.1 Suite de Autenticación (`auth.test.ts`)

Verifica la seguridad del registro y login.

- **Caso Feliz**: Registro exitoso devuelve `user` (sin password) + `token`.
- **Unicidad**: Intentar registrar el mismo email dos veces debe devolver `409 Conflict`.
- **Validación de Datos**:
  - Email inválido -> `400 Bad Request`.
  - Password corto (< 8 chars) -> `400`.
  - Nombre/Apellido corto -> `400`.
- **Seguridad**: Login con password incorrecto o email inexistente devuelve `401 Unauthorized` genérico (anti-enumeración).

#### 6.2.2 Suite de Compras (`purchases.test.ts`)

Prueba el flujo transaccional crítico del dinero.

- **Flujo Completo**:
  1.  Login (obtener Token).
  2.  Añadir ítem al carrito (`POST /api/cart`).
  3.  Checkout (`POST /api/purchases/checkout`).
  4.  Verificar que la respuesta incluye `status: "completed"` y detalle de ítems.
- **Validaciones de Integridad**:
  - Checkout con array vacío -> `400`.
  - Checkout con IDs de carrito inexistentes o de otro usuario -> `404`.
- **Post-Venta**:
  - Usuario puede ver su historial (`GET /api/purchases`).
  - Usuario puede solicitar reembolso (`POST /refund`) -> cambia estado a `refunded`.
  - Reembolsar una compra ya reembolsada -> `400`.
  - Intentar reembolsar una compra ajena -> `404`.

---

## 7. Referencia de API

El proyecto sigue la especificación **OpenAPI 3.0** (anteriormente Swagger). Esta documentación vive junto al código y se genera dinámicamente.

### 7.1 Documentación Interactiva (Swagger UI)

- **URL Local**: `http://localhost:3000/api-docs`
- **Generación**: Usamos `swagger-jsdoc` leyendo los comentarios JSDoc (`/** @swagger ... */`) encima de cada ruta en `*.routes.ts`.
- **Componentes Reutilizables**: Los esquemas de datos (User, Game, Error) se definen una sola vez en la configuración de Swagger y se referencian vía `$ref`.

### 7.2 Convenciones de Respuesta

Todas las respuestas siguen un formato JSON predecible:

- **Éxito (200/201)**: Devuelve el recurso o un objeto con mensaje.
  ```json
  { "id": 1, "title": "Juego", ... }
  ```
- **Error (4xx/5xx)**: Siempre devuelve un objeto con `message`.
  ```json
  { "message": "Descripción del error human-readable" }
  ```
- **Errores de Validación (Zod)**: Pueden incluir un array `errors` con el detalle por campo.

---

## 8. Integración con Frontend (Angular)

### 8.1 CORS (Cross-Origin Resource Sharing)

Para permitir que la SPA de Angular consuma datos del Backend:

- El servidor tiene habilitado el middleware `cors()`.
- Por defecto permite todos los orígenes (`*`).
- **Producción**: Se recomienda restringir esto en `app.ts` a la URL del deploy de Vercel/Netlify del frontend.

### 8.2 Autenticación

- **Mecanismo**: Bearer Token.
- El Frontend debe guardar el `token` recibido en `/login` (LocalStorage/SessionStorage).
- En cada petición subsiguiente, debe inyectar la cabecera:
  `Authorization: Bearer <token_jwt>`
- Si el Token expira (7 días), el Backend retornará `401`. El Frontend debe redirigir al Login.

### 8.3 Manejo de Imágenes

El frontend nunca envía archivos binarios al backend como JSON. Debe usar `FormData` y `multipart/form-data` para los endpoints de subida (`/api/media/upload`). El backend devolverá una URL absoluta de Cloudinary (`https://res.cloudinary.com/...`) que el frontend puede usar directamente en sus etiquetas `<img>`.

---

## 9. Despliegue y DevOps

El proyecto está optimizado para un despliegue "Serverless-First" en **Vercel**, aunque es compatible con servidores tradicionales (VPS/Docker).

### 9.1 Configuración de Vercel (`vercel.json`)

Este archivo orquesta el comportamiento del servidor en la infraestructura edge de Vercel.

```json
{
  "version": 2,
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/index.ts" },
    { "source": "/api-docs", "destination": "/api/index.ts" }
    // ... rewrites para estáticos de Swagger UI ...
  ]
}
```

- **Rewrites**: Redirigen todo el tráfico entrante bajo `/api` hacia el punto de entrada de la función serverless (`/api/index.ts`). Esto permite que Express maneje el enrutamiento interno aunque Vercel sea una plataforma basada en archivos.
- **Swagger Fix**: Hay reglas específicas para cargar los CSS/JS de Swagger UI desde un CDN (cdnjs), ya que en entorno serverless servir estáticos desde `node_modules` es problemático.

### 9.2 Pipeline de Construcción (`package.json`)

- **Build**: `npm run build` compila TypeScript a JavaScript (`dist/`).
- **Post-Install**: `prisma generate` se ejecuta automáticamente tras instalar dependencias. Esto es **CRÍTICO** en Vercel para generar el cliente de Prisma compatible con el OS de despliegue (RHEL/Linux).
- **Start**: `npm start` corre el servidor en modo producción (`node dist/src/index.js`).

### 9.3 Variables de Entorno en Producción

Para un despliegue exitoso, se deben configurar las siguientes variables en el panel de Vercel:

1.  `POSTGRES_PRISMA_URL`: URL con Pooling (ej: Supabase Transaction Pooler).
2.  `POSTGRES_URL_NON_POOLING`: URL directa para migraciones.
3.  `JWT_SECRET`: Llave fuerte de producción.
4.  `CLOUDINARY_*`: Credenciales de producción.
5.  `GOOGLE_GENERATIVE_AI_API_KEY`: API Key de Gemini.

### 9.4 Base de Datos (Migraciones)

Al desplegar, no se recomienda correr `prisma migrate dev`. En su lugar:

1.  Usar `prisma migrate deploy` en el pipeline de CI/CD para aplicar cambios pendientes de SQL.
2.  Si se utiliza **Supabase** o **Neon**, asegurarse de que el Pooler esté activo para manejar las conexiones efímeras de las funciones serverless.
