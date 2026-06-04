# GameSage Android (`kotlin`)

README operativo corto del bloque Android.
Detalle en [Confluence — Android (hub)](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/74055681) y en el [README raíz](../README.md).

---

## Qué contiene esta carpeta

- Aplicación Android nativa en Kotlin.
- UI con Jetpack Compose.
- Arquitectura por capas: `DataSource -> Repository -> ViewModel -> UI`.
- Persistencia local con Room + DataStore.
- Integración con la API de `angular-ssr`.

Rutas clave:

- [`app/src/main/java/com/gamesage/kotlin/ui/navigation/NavGraph.kt`](app/src/main/java/com/gamesage/kotlin/ui/navigation/NavGraph.kt)
- [`app/src/main/java/com/gamesage/kotlin/di/RemoteModule.kt`](app/src/main/java/com/gamesage/kotlin/di/RemoteModule.kt)
- [`app/src/main/java/com/gamesage/kotlin/data/repository/`](app/src/main/java/com/gamesage/kotlin/data/repository/)

## Configuración mínima

En [`local.properties`](local.properties):

```properties
MAPS_API_KEY="TU_CLAVE_DE_API_AQUI"
```

Para compilar sin mapa real:

```properties
MAPS_API_KEY="DEMO_KEY"
```

## Ejecución rápida

1. Abrir [`kotlin/`](.) en Android Studio.
2. Sincronizar Gradle.
3. Compilar y ejecutar sobre emulador o dispositivo.

Dependencias y versiones:

- [app/build.gradle.kts](app/build.gradle.kts)
- [gradle/libs.versions.toml](gradle/libs.versions.toml)

## Integración con backend

- Base URL y cliente Retrofit: [RemoteModule.kt](app/src/main/java/com/gamesage/kotlin/di/RemoteModule.kt)
- Contratos API: [GameSageApi.kt](app/src/main/java/com/gamesage/kotlin/data/remote/api/GameSageApi.kt)
- Gestión de token: [TokenManager.kt](app/src/main/java/com/gamesage/kotlin/data/local/TokenManager.kt)

## Enlaces de referencia

- Monorepo: [../README.md](../README.md) · acceso producción (registro / admin): [sección 6 — acceso en producción](../README.md#acceso-en-producción-vercel) · capturas: [../docs/producto/android/](../docs/producto/android/)
- Web/API: [../angular-ssr/README.md](../angular-ssr/README.md) · API: [gamingsage.vercel.app/api](https://gamingsage.vercel.app/api)
- APK: [../android-app.apk](../android-app.apk)
- Confluence: [Android (hub)](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/74055681)
- PDF Confluence: [../docs/confluence/espacio-pi-completo.pdf](../docs/confluence/espacio-pi-completo.pdf) · [../docs/jira/resumen-gestion-jira.pdf](../docs/jira/resumen-gestion-jira.pdf)
