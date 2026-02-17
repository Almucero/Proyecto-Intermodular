# 📁 Estructura de Imágenes (Juegos y Usuarios)

Este directorio contiene todos los archivos de imagen que se usarán en el seed para Cloudinary.

---

## 🎮 Imágenes de Juegos

Cada juego debe tener **su propia carpeta**, usando el **nombre EXACTO** del juego (el mismo que `game.title`).

```text
gameImages/
├── God of War Ragnarök/
│   ├── cover.jpg
│   ├── screenshot1.png
│   └── screenshot2.png
└── The Witcher 3/
    ├── cover.jpg
    └── gameplay.jpg
```

---

## 👤 Avatares de Usuarios

Cada usuario debe tener una carpeta con el **nombre EXACTO** del usuario (`user.name`).

> Solo se usará **el primer archivo encontrado** dentro de cada carpeta (idealmente, uno por usuario).

```text
userImages/
├── John Doe/
│   └── avatar.jpg
└── Jane Smith/
    └── avatar.png
```

---

## 📦 Carpeta de Media para Seed

Toda la media debe organizarse así:

```te
media/
├── gameImages/
│   ├── [Nombre del Juego]/
│   │   ├── cover.webp
│   │   ├── screenshot1.webp
│   │   └── ...
│   └── ...
└── userImages/
    ├── [Nombre del Usuario]/
    │   └── avatar.webp
    └── ...
```

---

## 📌 Reglas Importantes

1. **Juegos** → carpeta con el nombre EXACTO del juego.
2. **Usuarios** → carpeta con el nombre EXACTO del usuario.
3. Los nombres deben coincidir con los valores en base de datos.
4. En Cloudinary los nombres se convertirán a formato sanitizado:

   - minúsculas
   - sin acentos
   - espacios → guiones

---

## 🖼️ Formato soportado

- `webp`

---

## 🧪 Ejemplo de subida

Si tienes el juego:

### God of War Ragnarök

Coloca:

```text
media/gameImages/God of War Ragnarök/cover.webp
```

Se convertirá en Cloudinary a:

```text
gameImages/god-of-war-ragnarok/cover.webp
```

---
