## Datos de seed del backend

El directorio `backend-data/` contiene todos los ficheros de datos y media utilizados por los scripts de seed y limpieza del backend.

Estructura recomendada:

```text
backend-data/
├── json/
│   ├── platforms.json       (plataformas)
│   ├── genres.json          (géneros)
│   ├── developers.json      (desarrolladores)
│   ├── publishers.json      (publishers)
│   ├── games.json           (juegos)
│   ├── users.json           (usuarios no admin de ejemplo)
│   └── chatTemplates.json   (plantillas de sesiones/mensajes de chat)
└── backend-media/
    ├── gameImages/      (imágenes de juegos)
    └── userImages/      (avatares de usuarios)
```

Los scripts relevantes son:

- `npm run seed:data`: limpia los datos de negocio de la base de datos (sin tocar Cloudinary), crea todas las entidades a partir de estos JSON y, si existen las carpetas de media bajo `backend-data/backend-media`, sube imágenes a Cloudinary.
- `npm run clean:data`: limpia todos los datos (incluyendo media en Cloudinary) sin depender de los ficheros JSON.

### Media (imágenes)

- **Imágenes de juegos**  
  Se organizan en subcarpetas dentro de `backend-data/backend-media/gameImages/`.  
  Cada juego dispone de una carpeta propia cuyo nombre coincide exactamente con `game.title` en base de datos.

  Ejemplo:

  ```text
  backend-data/backend-media/
  └── gameImages/
      ├── God of War Ragnarök/
      │   ├── cover.webp
      │   ├── screenshot1.webp
      │   └── screenshot2.webp
      └── The Witcher 3/
          ├── cover.webp
          └── gameplay.webp
  ```

- **Avatares de usuarios**  
  Se organizan en subcarpetas dentro de `backend-data/backend-media/userImages/`.  
  Cada usuario dispone de una carpeta cuyo nombre coincide exactamente con `user.name` o con `accountAt`.

  Solo se utiliza el **primer archivo encontrado** en cada carpeta como avatar principal.

#### Reglas de nombres y normalización en Cloudinary

1. **Juegos** → carpeta con el nombre exacto del juego (`game.title`).  
2. **Usuarios** → carpeta con el nombre exacto del usuario (`user.name`) o `accountAt`.  
3. Los nombres de carpetas deben coincidir con los valores persistidos en la base de datos.
4. En Cloudinary, las rutas de carpeta se normalizan aplicando:
   - conversión a minúsculas
   - eliminación de acentos
   - sustitución de espacios por guiones (`-`)

Ejemplo:

```text
backend-data/backend-media/gameImages/God of War Ragnarök/cover.webp
```

Se convierte en Cloudinary en algo equivalente a:

```text
gameImages/god-of-war-ragnarok/cover.webp
```

