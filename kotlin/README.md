# 🎮 GameSage Android App

## 🛠️ Configuración inicial del Entorno (Android Studio)

Para evitar que el código y los comentarios en español, francés o alemán se marquen como faltas de ortografía (líneas verdes), puedes añadir los paquetes de idiomas nativos del IDE:

1. Abre Android Studio y ve a **File > Settings** (o _Android Studio > Settings_ en macOS).
2. Ve a **Editor > Natural Languages**.
3. En la sección **Languages**, haz clic en el botón **`+`**.
4. Busca y añade los idiomas que necesites (Español, Français, Deutsch, Italian).
5. Haz clic en **Apply** y **OK**. Android Studio descargará los diccionarios automáticamente y dejará de marcar los textos.

## 🚀 Cómo ejecutar el proyecto

Para que el proyecto compile y los mapas funcionen correctamente, es obligatorio añadir la clave de la API de Google Maps a tu entorno local.

1. En la raíz de tu proyecto, abre (o crea si no existe) el archivo `local.properties`.
2. Añade la siguiente línea, sustituyendo el valor por tu clave real:
---
   ```properties
   MAPS_API_KEY="TU_CLAVE_DE_API_AQUI"
   ```
---