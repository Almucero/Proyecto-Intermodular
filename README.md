# GameSage — Documentación guía del proyecto intermodular (2º DAM)

**CPIFP Alan Turing** · 2º DAM · Curso 2025/2026 · [Producción](https://gamingsage.vercel.app/) · [Repositorio](https://github.com/Almucero/Proyecto-Intermodular)

Repositorio guía del equipo según el [planning de exposiciones 2º DAM mañana](https://github.com/CPIFPAlanTuring/exposiciones_proyecto_intermodular_25_26_2DAM_M) (orden **6**, fila GameSage).

Repositorio del proyecto **GameSage**: código, despliegue, capturas, trazabilidad por módulos y documentación (Confluence, PDFs y `docs/`). **Presentación de la defensa:** versión recomendada en [Google Slides](https://docs.google.com/presentation/d/1W-anIqJPTWcOuoBRFDVEEV_gHqGkvpiVaXctoRChZRE/edit?usp=sharing); copia de respaldo [`docs/GameSage.pptx`](docs/GameSage.pptx) (detalle en [sección 11](#presentación-de-la-defensa)).

---

## Índice

1. [Personas del equipo](#1-personas-del-equipo)
2. [Explicación del proyecto](#2-explicación-del-proyecto)
3. [Capturas e imágenes del producto](#3-capturas-e-imágenes-del-producto)
4. [Qué aporta el proyecto en cada módulo](#4-qué-aporta-el-proyecto-en-cada-módulo)
5. [Estructura del proyecto](#5-estructura-del-proyecto)
6. [Artefactos en producción](#6-artefactos-en-producción) ([acceso Vercel](#acceso-en-producción-vercel))
7. [Documentación unificada del proyecto (PDF)](#7-documentación-unificada-del-proyecto-pdf)
8. [Resumen de la gestión en Jira (PDF)](#8-resumen-de-la-gestión-en-jira-pdf)
9. [Documentación de código (Compodoc)](#9-documentación-de-código-compodoc)
10. [Documentación técnica en Confluence](#10-documentación-técnica-en-confluence)
11. [Referencia rápida para exposición](#11-referencia-rápida-para-exposición)

---

## 1. Personas del equipo

| Nombre | Contacto (educaAnd / personal) | Rol / mayor foco |
| --- | --- | --- |
| Rosario González | `mgonort380y@g.educaand.es` · `ayigonzalezortiz@gmail.com` | Android, Compodoc/documentación técnica, scripts de datos, Power BI y Figma |
| Álvaro Jiménez | `ajimmun901@g.educaand.es` · `alvarokilor@gmail.com` | Web, backend, documentación final y despliegues (Vercel y etapas previas) |

Hemos participado en todas las áreas del proyecto; en la tabla, «Mayor foco» indica dónde ha pesado más cada uno. Planificación y tareas: [sección 8](#8-resumen-de-la-gestión-en-jira-pdf) y [PDF Jira](docs/jira/resumen-gestion-jira.pdf).

### Reparto del trabajo en el repositorio

Todo el código y la documentación del monorepo están en este repositorio con dos cuentas, de noviembre de 2025 a mayo de 2026. El reparto es equilibrado: ninguna persona concentra la mayoría del historial.

| Cuenta GitHub | Commits | % commits | Líneas añadidas (`++`) | % `++` |
| ------------- | ------: | --------: | ---------------------: | -----: |
| [Almucero](https://github.com/Almucero) | 120 | 59 % | 392 535 | 58 % |
| [RosarioGonzalez06](https://github.com/RosarioGonzalez06) | 83 | 41 % | 289 492 | 42 % |
| **Total** | **203** | **100 %** | **682 027** | **100 %** |

En el gráfico de [Contributors](https://github.com/Almucero/Proyecto-Intermodular/graphs/contributors?all=1) se ve la misma tendencia: picos en las mismas semanas y actividad repartida a lo largo del curso, no solo al final.

<p align="center">
  <img src="docs/equipo/github-contributors.png" alt="Contributors — Proyecto-Intermodular" width="720" />
</p>

Detalle interactivo (commits por semana, `++`/`--`): [GitHub Insights](https://github.com/Almucero/Proyecto-Intermodular/graphs/contributors?all=1).

---

## 2. Explicación del proyecto

GameSage es una plataforma de videojuegos con:

- Web SSR (Angular) y API REST (Express) unificadas en un solo runtime.
- App móvil Android (Kotlin) conectada a la misma API.
- Persistencia en PostgreSQL con Prisma.
- Diseño en Figma y cuadro de mando en Power BI.

### Idea y propuesta de valor

GameSage es una tienda online de videojuegos digitales que vende claves oficiales para bibliotecas/plataformas externas (Steam, Epic, PSN, Xbox, Nintendo, etc.), sin funcionar como launcher o biblioteca propia.

La propuesta combina una experiencia de compra clara y moderna (web y móvil), diseño responsive, navegación enfocada a conversión y flujo completo de catálogo, favoritos, carrito, compra y postventa.

Frente a tiendas oficiales y frente a revendedores tipo Instant Gaming, el enfoque diferencial se apoya en dos pilares:

- Precios competitivos en claves digitales.
- Un chat de IA con conocimiento del catálogo para búsqueda conversacional y recomendaciones personalizadas.

El objetivo de esta IA es reducir la fricción cuando el usuario no tiene claro qué juego comprar, mejorar el descubrimiento de títulos relevantes y evitar que opciones adecuadas queden ocultas por búsquedas tradicionales.

### Funcionalidades principales

| Área | Descripción |
| --- | --- |
| Catálogo | Exploración, búsqueda y detalle de juegos |
| Cuenta | Registro/login local y social, perfil de usuario |
| Favoritos | Gestión de favoritos por juego y plataforma |
| Carrito y compras | Checkout, compras y reembolsos |
| Chat IA | Recomendación y conversación sobre juegos |
| Administración | Gestión de catálogos desde panel admin |
| Móvil | Cliente Android conectado a la API |
| Analítica | Pipeline Python -> Excel -> [powerbi.pbix](powerbi.pbix) |

### Arquitectura de alto nivel

<p align="center">
  <img src="docs/diagramas/arquitectura-general.png" alt="Arquitectura general — GameSage" width="900" />
</p>

Vista global del monorepo: clientes web y Android, monolito SSR+API en Vercel, persistencia, integraciones externas y pipeline analítico. Detalle técnico: [Arquitectura interna (Confluence)](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/73924625).

**Lectura del diagrama:**

- **API REST:** el bloque `/api/*` resume los dominios principales; en código existen además rutas de catálogo (`developers`, `publishers`, `genres`, `platforms`) y `media`. La administración del catálogo se implementa en el cliente web consumiendo esas APIs.
- **Base de datos:** las tablas dibujadas son representativas; el modelo relacional completo está en [`angular-ssr/prisma/schema.prisma`](angular-ssr/prisma/schema.prisma) y en el ERD de la [sección 3](#3-capturas-e-imágenes-del-producto).
- **Analítica:** la rama muestra el recorrido hacia Power BI; el detalle de scripts y alternativas de exportación está en [Scripts Python (Confluence)](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/74186753).

Evolución del bloque web: fase inicial con Node + Angular por separado, consolidada después en una arquitectura unificada con Angular SSR.

---

## 3. Capturas e imágenes del producto

Estructura en [`docs/`](docs/) (índice: [`docs/README.md`](docs/README.md)). Misma galería ampliada en Confluence → [Visión general](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/73760769), [Guía de uso](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/73826305), flujos [web](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/73859073) y [Android](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/73891841).

> **Demo en vivo:** [gamingsage.vercel.app](https://gamingsage.vercel.app/) (web) · [APK Android](https://github.com/Almucero/Proyecto-Intermodular/raw/main/android-app.apk) · vídeos en Confluence (Android, Figma, Python, Jira).
>
> **Flujo de pantallas (web / Android / Figma):** `login` → `home` → `catálogo` → `ficha` → `carrito` → `chat` (+ `admin` solo en web).

<details>
<summary><strong>Web (producción)</strong> — <a href="https://gamingsage.vercel.app/">Vercel</a> (7 pantallas)</summary>

| Pantalla | Imagen |
| --- | :---: |
| Login | ![Login web](docs/producto/web/web-login.png) |
| Home | ![Home web](docs/producto/web/web-home.png) |
| Catálogo | ![Catálogo web](docs/producto/web/web-catalogo.png) |
| Ficha | ![Ficha web](docs/producto/web/web-ficha.png) |
| Carrito | ![Carrito web](docs/producto/web/web-carrito.png) |
| Chat IA (Sage) | ![Chat web](docs/producto/web/web-chat.png) |
| Admin | ![Admin web](docs/producto/web/web-admin.png) |

Detalle: [Web y API](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/73957377) · [Flujo web](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/73859073).

</details>

<details>
<summary><strong>Android (producción)</strong> — <a href="https://github.com/Almucero/Proyecto-Intermodular/raw/main/android-app.apk">APK</a> (6 pantallas)</summary>

| Pantalla | Imagen |
| --- | :---: |
| Login | ![Login Android](docs/producto/android/android-login.png) |
| Home | ![Home Android](docs/producto/android/android-home.png) |
| Catálogo | ![Catálogo Android](docs/producto/android/android-catalogo.png) |
| Ficha | ![Ficha Android](docs/producto/android/android-ficha.png) |
| Carrito | ![Carrito Android](docs/producto/android/android-carrito.png) |
| Chat IA (Sage) | ![Chat Android](docs/producto/android/android-chat.png) |

Detalle: [Android](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/74055681) · [Flujo Android](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/73891841) · [Build/APK](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/73465860).

</details>

<details>
<summary><strong>Figma (prototipo)</strong> — web y móvil (6 pantallas)</summary>

| Web | Móvil |
| :---: | :---: |
| ![Figma login web](docs/producto/figma-web/figma-web-login.png) | ![Figma login móvil](docs/producto/figma-movil/figma-movil-login.png) |
| ![Figma home web](docs/producto/figma-web/figma-web-home.png) | ![Figma home móvil](docs/producto/figma-movil/figma-movil-home.png) |
| ![Figma catálogo web](docs/producto/figma-web/figma-web-catalogo.png) | ![Figma catálogo móvil](docs/producto/figma-movil/figma-movil-catalogo.png) |
| ![Figma ficha web](docs/producto/figma-web/figma-web-ficha.png) | ![Figma ficha móvil](docs/producto/figma-movil/figma-movil-ficha.png) |
| ![Figma carrito web](docs/producto/figma-web/figma-web-carrito.png) | ![Figma carrito móvil](docs/producto/figma-movil/figma-movil-carrito.png) |
| ![Figma chat web](docs/producto/figma-web/figma-web-chat.png) | ![Figma chat móvil](docs/producto/figma-movil/figma-movil-chat.png) |

Enlaces edición: [Canvas web](https://www.figma.com/design/8WRYpwCvkO9wDyGhu57rel/App-venta-de-videojuegos?node-id=726-5391&t=Nx2WKoj2pQCn22hc-0) · [Prototipo web](https://www.figma.com/proto/8WRYpwCvkO9wDyGhu57rel/App-venta-de-videojuegos?node-id=0-1&t=04WaZdl2dDfJg0df-1) · [Canvas móvil](https://www.figma.com/design/8WRYpwCvkO9wDyGhu57rel/App-venta-de-videojuegos?node-id=567-2837&t=Jmpej6MLv56k67Kt-0) · [Prototipo móvil](https://www.figma.com/proto/8WRYpwCvkO9wDyGhu57rel/App-venta-de-videojuegos?node-id=567-2837&p=f&t=a0jbOffYZnVYoZLL-0&scaling=scale-down&content-scaling=fixed&page-id=16%3A2973&starting-point-node-id=567%3A2837). Confluence: [Figma Web](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/73465876) · [Figma Móvil](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/73859089).

</details>

<details>
<summary><strong>Analítica (Power BI)</strong></summary>

<p align="center">
  <img src="docs/analitica/powerbi-dashboard.png" alt="Dashboard Power BI" width="800" />
</p>

Informe: [powerbi.pbix](powerbi.pbix). Detalle: [Power BI en Confluence](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/74153985) · [Scripts Python](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/74186753).

</details>

<details>
<summary><strong>Diagramas y herramientas</strong> — ERD, Swagger, Compodoc</summary>

Arquitectura: ver [sección 2](#2-explicación-del-proyecto). Resto en [`docs/diagramas/`](docs/diagramas/).

![ERD base de datos](docs/diagramas/erd-base-datos.svg)

Modelo completo: [`angular-ssr/prisma/schema.prisma`](angular-ssr/prisma/schema.prisma) · [Modelo de datos (Confluence)](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/74022913).

![Swagger — GameSage API](docs/diagramas/swagger-api.png)

Contrato interactivo: [gamingsage.vercel.app/api-docs/](https://gamingsage.vercel.app/api-docs/) · [Contratos API (Confluence)](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/73793553).

![Compodoc — documentación Angular](docs/diagramas/compodoc-inicio.png)

Explorador: [gamingsage.vercel.app/docs/](https://gamingsage.vercel.app/docs/) · generación local: `npm run docs:build` en [`angular-ssr/`](angular-ssr/) · [sección 9](#9-documentación-de-código-compodoc).

| Qué | En repo | Dónde ver más |
| --- | --- | --- |
| Arquitectura general | [`arquitectura-general.png`](docs/diagramas/arquitectura-general.png) | sección 2 · [Arquitectura interna](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/73924625) |
| Swagger / Compodoc | capturas en `docs/diagramas/` | sección 9 y enlaces anteriores |

</details>

<details>
<summary><strong>Gestión del proyecto (Jira)</strong> — tablero, epics y Story Points</summary>

| Tablero Scrum | Epics | Reparto de Story Points |
| :---: | :---: | :---: |
| ![Tablero Jira](docs/jira/jira-tablero.png) | ![Epics Jira](docs/jira/jira-epics.png) | ![Reparto SP](docs/jira/jira-reparto-sp.png) |

Detalle: [Hub Jira](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/73924641) · [Resumen](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/74317875) · [PDF de la sección 8](#8-resumen-de-la-gestión-en-jira-pdf).

</details>

---

## 4. Qué aporta el proyecto en cada módulo

### Acceso a datos — Juan Antonio García Gómez

#### Objetivos cubiertos

- Diseño de acceso y persistencia de datos en aplicaciones multiplataforma.
- Uso de conexión a bases de datos relacionales y mapeo objeto-relacional (ORM).
- Implementación de un patrón repositorio genérico avanzado para desacoplar acceso a datos, mejorar reutilización y mantener consistencia entre módulos.
- Modelado relacional completo con Prisma sobre PostgreSQL para usuarios, catálogo, compras, carrito y favoritos.
- Separación clara por capas (controller/service/repository) para facilitar mantenimiento y testing.
- Gestión de migraciones y seeds para reproducir entorno de datos en local y despliegue.

#### Evidencias

- [`angular-ssr/prisma/schema.prisma`](angular-ssr/prisma/schema.prisma)
- [`angular-ssr/src/backend/modules/`](angular-ssr/src/backend/modules/)
- [`angular-ssr/src/app/core/`](angular-ssr/src/app/core/)
- [`angular-ssr/prisma/migrations/`](angular-ssr/prisma/migrations/)
- [`angular-ssr/package.json`](angular-ssr/package.json) (scripts de migración/seed)
- Guía externa seguida para patrón repositorio: [Documento de referencia](https://docs.google.com/document/d/1HegdBdIMwVlgj1i6kfEJudn0sagFmP5Fd1uQmtapHb0/edit?pli=1&tab=t.0#heading=h.1utmv9wg191y)
- Implementación de referencia externa: [juanarrow/repositorios](https://github.com/juanarrow/repositorios)

#### Limitaciones

- Uso de `any` en algunas capas backend que reduce el tipado estricto.

---

### Programación multimedia y dispositivos móviles — David Hormigo Ramírez

#### Objetivos cubiertos

- Desarrollo de aplicaciones móviles y gestión de interacción de usuario en dispositivo.
- Integración de capacidades multimedia y validación de comportamiento en entorno móvil.
- Implementación de app Android nativa con Kotlin y Jetpack Compose.
- Navegación modular con `NavGraph` y organización por pantallas/estados.
- Consumo de API y sincronización con backend mediante Retrofit + repositorios.
- Persistencia local y soporte offline con Room y DataStore.

#### Evidencias

- [`kotlin/app/src/main/java/com/gamesage/kotlin/ui/`](kotlin/app/src/main/java/com/gamesage/kotlin/ui/)
- [`kotlin/app/src/main/java/com/gamesage/kotlin/ui/navigation/NavGraph.kt`](kotlin/app/src/main/java/com/gamesage/kotlin/ui/navigation/NavGraph.kt)
- [`kotlin/app/src/main/java/com/gamesage/kotlin/di/RemoteModule.kt`](kotlin/app/src/main/java/com/gamesage/kotlin/di/RemoteModule.kt)
- [`kotlin/app/src/main/java/com/gamesage/kotlin/data/local/`](kotlin/app/src/main/java/com/gamesage/kotlin/data/local/)
- [`kotlin/app/build.gradle.kts`](kotlin/app/build.gradle.kts)
- [`android-app.apk`](android-app.apk)
- Confluence: [Android](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/74055681) · [Flujo principal](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/73891841) · [Build y operación](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/73465860) · [Integración con API](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/73957393)

#### Limitaciones

- Falta una batería amplia de tests de UI/integración.

---

### Programación de servicios y procesos — David Hormigo Ramírez

#### Objetivos cubiertos

- Desarrollo de aplicaciones con comunicación en red y arquitectura cliente-servidor.
- Aplicación de concurrencia/procesos y criterios básicos de seguridad en servicios.
- Integración cliente-servidor real entre Android y API REST del backend.
- Gestión de tareas en segundo plano y automatización básica con WorkManager.
- Manejo de sesiones/tokens para acceso autenticado a recursos protegidos.
- Estructura preparada para escalar procesos y mejorar tolerancia a fallos de red.

#### Evidencias

- [`kotlin/app/src/main/java/com/gamesage/kotlin/data/remote/api/GameSageApi.kt`](kotlin/app/src/main/java/com/gamesage/kotlin/data/remote/api/GameSageApi.kt)
- [`kotlin/app/src/main/java/com/gamesage/kotlin/data/repository/`](kotlin/app/src/main/java/com/gamesage/kotlin/data/repository/)
- [`kotlin/app/src/main/java/com/gamesage/kotlin/data/worker/DailyGameWorker.kt`](kotlin/app/src/main/java/com/gamesage/kotlin/data/worker/DailyGameWorker.kt)
- [`kotlin/app/src/main/java/com/gamesage/kotlin/data/local/TokenManager.kt`](kotlin/app/src/main/java/com/gamesage/kotlin/data/local/TokenManager.kt)
- [`angular-ssr/src/backend/app.ts`](angular-ssr/src/backend/app.ts)

#### Limitaciones

- Worker diario en modo one-shot de prueba.

---

### Desarrollo de interfaces — Carmen Campos Fernández

#### Objetivos cubiertos

- Diseño de interfaces usables y accesibles para web y móvil.
- Prototipado visual y presentación de información mediante recursos gráficos.
- Diseño de flujos completos en Figma para versión web y móvil antes de implementar.
- Aplicación de criterios UX/UI: jerarquía visual, consistencia, feedback y legibilidad.
- Construcción de interfaz responsive en web para distintos tamaños de pantalla.
- Integración de cuadro de mando con Power BI para lectura visual de datos de negocio.

#### Evidencias

- Figma Web: [Prototipo web](https://www.figma.com/proto/8WRYpwCvkO9wDyGhu57rel/App-venta-de-videojuegos?node-id=0-1&t=04WaZdl2dDfJg0df-1)
- Figma Móvil: [Prototipo móvil](https://www.figma.com/proto/8WRYpwCvkO9wDyGhu57rel/App-venta-de-videojuegos?node-id=567-2837&p=f&t=a0jbOffYZnVYoZLL-0&scaling=scale-down&content-scaling=fixed&page-id=16%3A2973&starting-point-node-id=567%3A2837)
- [`powerbi.pbix`](powerbi.pbix)
- [`angular-ssr/src/app/pages/`](angular-ssr/src/app/pages/)
- [`kotlin/app/src/main/java/com/gamesage/kotlin/ui/pages/`](kotlin/app/src/main/java/com/gamesage/kotlin/ui/pages/)

#### Evidencias visuales

- Galería en sección 3 y [`docs/`](docs/) · Confluence: [Guía de uso](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/73826305) · [Figma Web](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/73465876) · [Figma Móvil](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/73859089)

---

### Servidores y APIs — Juan Antonio García Gómez

#### Objetivos cubiertos

- Desarrollo y publicación de servicios de aplicación en red.
- Aplicación de autenticación, seguridad y documentación técnica del servicio.
- Configuración de despliegue y operación en entorno cloud.
- Backend en Express integrado en Angular SSR para servir web y API en el mismo runtime.
- Autenticación con JWT, soporte OAuth y flujos de recuperación de contraseña.
- Seguridad aplicada con cabeceras, validaciones, control de abuso y buenas prácticas API.
- Documentación operativa de endpoints con Swagger y generación técnica con Compodoc.

#### Evidencias

- [`angular-ssr/src/server.ts`](angular-ssr/src/server.ts)
- [`angular-ssr/src/backend/app.ts`](angular-ssr/src/backend/app.ts)
- [`angular-ssr/src/security-headers.ts`](angular-ssr/src/security-headers.ts)
- [`angular-ssr/src/backend/config/env.ts`](angular-ssr/src/backend/config/env.ts)
- [Swagger en producción](https://gamingsage.vercel.app/api-docs/) · [Compodoc](https://gamingsage.vercel.app/docs/)
- Confluence: [Web y API](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/73957377) · [Arquitectura interna](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/73924625) · [Contratos API y Swagger](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/73793553) · [Seguridad](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/73990145) · [Operación y despliegue](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/73433090)

#### Limitaciones

- Dependencia alta de configuración por variables de entorno.

---

### Empresa e iniciativa emprendedora II — Rosa Carmen Alcázar Rosal

#### Objetivos cubiertos

- Análisis de oportunidad del proyecto y planteamiento de viabilidad.
- Definición de base de gestión (constitución, organización y marco económico-financiero).
- Definición del modelo de negocio, segmentación de cliente y propuesta de valor.
- Estudio de competencia, posicionamiento y estrategia comercial del proyecto.
- Plan económico con previsión de costes, tesorería, financiación y escalado.

#### Evidencias

- Documento empresarial: [IPE.pdf](IPE.pdf)
- Secciones clave del documento: idea de negocio, DAFO/CAME, segmentación, estrategia comercial, tesorería y viabilidad.

#### Limitaciones

- El plan refleja una proyección académica; su validación final depende de ejecución real y métricas de mercado.

---

### Sistemas de gestión empresarial — Miguel Ángel Ronda Carracao

#### Objetivos cubiertos

- Adaptación de herramientas de gestión para preparar, integrar y explotar información.
- Automatización de tareas de extracción y transformación de datos para análisis.
- Scripts en Python para exportar datos desde PostgreSQL y generar ficheros de trabajo.
- Transformación de datos a Excel para alimentar analítica y reporting.
- Flujo de apoyo a negocio para seguimiento de ventas y comportamiento de catálogo.

#### Evidencias

- [`angular-ssr/src/backend/scripts/postgreToExcel.py`](angular-ssr/src/backend/scripts/postgreToExcel.py)
- [`angular-ssr/src/backend/scripts/jsonToExcel.py`](angular-ssr/src/backend/scripts/jsonToExcel.py)
- [`angular-ssr/backend-data/`](angular-ssr/backend-data/)
- [`powerbi.pbix`](powerbi.pbix)
- Confluence: [Scripts Python (SGE)](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/74186753) · [Power BI](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/74153985)

#### Limitaciones

- La actualización del dataset analítico depende de ejecutar los scripts y refrescar el origen en Power BI Desktop.

---

## 5. Estructura del proyecto

Monorepo en [Proyecto-Intermodular](https://github.com/Almucero/Proyecto-Intermodular):

| Bloque | Ubicación |
| --- | --- |
| Web/API | [angular-ssr/](angular-ssr/) |
| Android | [kotlin/](kotlin/) |
| BI / analítica | [`powerbi.pbix`](powerbi.pbix) |
| Documento IPE II | [IPE.pdf](IPE.pdf) |
| Export PostgreSQL → Excel | [`angular-ssr/src/backend/scripts/postgreToExcel.py`](angular-ssr/src/backend/scripts/postgreToExcel.py) |
| Transformación JSON → Excel | [`angular-ssr/src/backend/scripts/jsonToExcel.py`](angular-ssr/src/backend/scripts/jsonToExcel.py) |
| Datos de apoyo (scripts) | [`angular-ssr/backend-data/`](angular-ssr/backend-data/) |
| Capturas, diagramas y PDF | [`docs/`](docs/) · [contributors](docs/equipo/github-contributors.png) |
| Presentación defensa | [Google Slides](https://docs.google.com/presentation/d/1W-anIqJPTWcOuoBRFDVEEV_gHqGkvpiVaXctoRChZRE/edit?usp=sharing) (recomendada) · [`docs/GameSage.pptx`](docs/GameSage.pptx) (respaldo) |

---

## 6. Artefactos en producción

| Artefacto | URL | Notas |
| --- | --- | --- |
| Web en producción | [gamingsage.vercel.app](https://gamingsage.vercel.app/) | Aplicación web en Vercel |
| API REST | [gamingsage.vercel.app/api](https://gamingsage.vercel.app/api) | Backend para web y Android |
| Swagger | [gamingsage.vercel.app/api-docs](https://gamingsage.vercel.app/api-docs/) | Contrato y prueba de la API |
| Compodoc | [gamingsage.vercel.app/docs](https://gamingsage.vercel.app/docs/) | Documentación del frontend Angular |
| APK | [android-app.apk](https://github.com/Almucero/Proyecto-Intermodular/raw/main/android-app.apk) | Binario Android para pruebas directas |

### Acceso en producción (Vercel)

**Usuario (web o Android, misma API):** en [gamingsage.vercel.app](https://gamingsage.vercel.app/) puede registrarse con correo y contraseña, **Google** o **GitHub**.

**Administración (solo web, despliegue Vercel):**

| Campo | Valor |
| --- | --- |
| URL | [gamingsage.vercel.app](https://gamingsage.vercel.app/) → iniciar sesión |
| Correo admin | `minialmucero@gmail.com` |
| Contraseña | `12062006a` |

Tras iniciar sesión, el panel de administración del catálogo queda disponible. Catálogo, cuenta, carrito y chat IA son accesibles con las credenciales anteriores; pagos Stripe, correo SMTP y otras integraciones dependen de la configuración del despliegue.

### Ejecución local (resumen)

Los artefactos anteriores permiten probar el producto sin clonar el código. Para desarrollo en local:

- Web/API: [angular-ssr/README.md](angular-ssr/README.md)
- Android: [kotlin/README.md](kotlin/README.md)

El arranque local requiere `.env` con las variables indicadas en [angular-ssr/README.md](angular-ssr/README.md) (pasarelas de pago, OAuth, correo, IA, etc.). Sin esas claves, el núcleo de la app funciona; algunas integraciones externas quedan desactivadas.

---

## 7. Documentación unificada del proyecto (PDF)

Documentación técnica y de producto de GameSage, mantenida en Confluence (espacio **PI**) y disponible en este repositorio como PDF para lectura offline.

| Documento | Enlace | Contenido |
| --------- | ------ | --------- |
| **PDF unificado (Confluence)** | [docs/confluence/espacio-pi-completo.pdf](docs/confluence/espacio-pi-completo.pdf) | Visión, arquitectura, web/API, Android, diseño (Figma), guías de uso, gestión Jira, Power BI y anexos (46 páginas, orden del índice del espacio) |
| **Wiki en línea** | [Proyecto Intermodular (PI)](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/overview) | Misma documentación, navegable en el navegador |
| **Plan de empresa (IPE II)** | [IPE.pdf](IPE.pdf) | Memoria del módulo Empresa e iniciativa emprendedora II |

Índice por bloques en la wiki: [sección 10](#10-documentación-técnica-en-confluence).

---

## 8. Resumen de la gestión en Jira (PDF)

Resumen de cómo hemos planificado y ejecutado el proyecto en Jira (proyecto **PI**): epics, historias de usuario, tareas, sprints y reparto de trabajo.

| Documento | Enlace | Contenido |
| --------- | ------ | --------- |
| **Resumen Jira (PDF)** | [docs/jira/resumen-gestion-jira.pdf](docs/jira/resumen-gestion-jira.pdf) | Resumen ejecutivo con capturas incrustadas (tablero, epics, Story Points) |
| **Capturas (galería)** | [Gestión Jira — sección 3](#3-capturas-e-imágenes-del-producto) | Tablero Scrum, vista de epics y reparto de SP |
| **Wiki** | [Gestión del proyecto — Jira](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/73924641) · [Resumen](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/74317875) | Epics, historias, sprints y métricas ampliadas |

---

## 9. Documentación de código (Compodoc)

| | |
| --- | --- |
| **Publicación** | [Compodoc Web](https://gamingsage.vercel.app/docs/) |
| **Código documentado** | [angular-ssr/src/app](angular-ssr/src/app) |
| **Generación local** | En [angular-ssr/](angular-ssr/): `npm run docs:build` · `npm run docs:serve` |
| **API backend** | [Swagger /api-docs/](https://gamingsage.vercel.app/api-docs/) (no Compodoc) |

---

## 10. Documentación técnica en Confluence

Enlaces al espacio Confluence **PI** por bloques. El [PDF unificado](#7-documentación-unificada-del-proyecto-pdf) recoge el mismo contenido en un solo documento.

Espacio: [Proyecto Intermodular (PI)](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/overview) · entrada: [Visión general](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/73760769)

| Bloque | Páginas |
| --- | --- |
| Uso | [Guía de uso](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/73826305) · [FAQ](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/73924609) · [Flujo web](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/73859073) · [Flujo Android](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/73891841) |
| Web/API | [Hub Web y API](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/73957377) · [Arquitectura](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/73924625) · [Swagger](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/73793553) · [Modelo de datos](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/74022913) · [Seguridad](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/73990145) · [Operación](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/73433090) |
| Android | [Hub Android](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/74055681) · [Capas](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/74088449) · [Sincronización](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/73891857) · [Integración API](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/73957393) · [Build](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/73465860) |
| Diseño / BI | [Hub Diseño](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/73760785) · [Figma Web](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/73465876) · [Figma Móvil](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/73859089) · [Power BI](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/74153985) · [Scripts Python](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/74186753) |
| Jira | [Hub Jira](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/73924641) · [Intro](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/74285057) · [Resumen](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/74317875) · [Epics](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/74317825) · [Histórico sprints](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/74350593) |

Evidencias visuales en repo: [sección 3](#3-capturas-e-imágenes-del-producto) y [`docs/README.md`](docs/README.md).

---

## 11. Referencia rápida para exposición

| Dato | Valor |
| --- | --- |
| Fecha exposición | 5 de junio de 2026 |
| Franja equipo | 10:15 – 10:30 (orden 6) |
| Duración máxima | 15 minutos |
| Planning oficial (centro) | [exposiciones_proyecto_intermodular_25_26_2DAM_M](https://github.com/CPIFPAlanTuring/exposiciones_proyecto_intermodular_25_26_2DAM_M) |
| Repositorio guía (este repo) | [Proyecto-Intermodular](https://github.com/Almucero/Proyecto-Intermodular) |

### Presentación de la defensa

Material de diapositivas para la exposición (visión del producto, IPE, repositorio, Jira, Confluence, Python/Power BI, Figma, arquitectura SSR, demo web, Android, cierre).

| Formato | Enlace | Notas |
| --- | --- | --- |
| **Google Slides (web)** | [GameSage — presentación](https://docs.google.com/presentation/d/1W-anIqJPTWcOuoBRFDVEEV_gHqGkvpiVaXctoRChZRE/edit?usp=sharing) | **Versión preferible** para tribunal y revisión: mejor renderizado de fuentes, iconos y huecos de vídeo; se abre en el navegador sin depender del visor de Office |
| **PowerPoint en repo** | [`docs/GameSage.pptx`](docs/GameSage.pptx) | **Respaldo** offline y para quien no tenga acceso a Drive; el aspecto puede diferir (fuentes, iconos) según PowerPoint/LibreOffice |

Índice de evidencias en repo: [`docs/README.md`](docs/README.md#presentación-de-la-defensa-gamesage).

---

### Más documentación

| Recurso | Enlace |
| --- | --- |
| Planning exposiciones (centro) | [exposiciones_proyecto_intermodular_25_26_2DAM_M](https://github.com/CPIFPAlanTuring/exposiciones_proyecto_intermodular_25_26_2DAM_M) |
| Web y API | [angular-ssr/README.md](angular-ssr/README.md) |
| Android | [kotlin/README.md](kotlin/README.md) |
| Confluence | [Espacio PI](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/overview) · [Visión general](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/73760769) · [índice por bloques](#10-documentación-técnica-en-confluence) |
| PDF | [Espacio PI](docs/confluence/espacio-pi-completo.pdf) · [Resumen Jira](docs/jira/resumen-gestion-jira.pdf) |
| Presentación | [Google Slides](https://docs.google.com/presentation/d/1W-anIqJPTWcOuoBRFDVEEV_gHqGkvpiVaXctoRChZRE/edit?usp=sharing) (recomendada) · [PPTX](docs/GameSage.pptx) (respaldo) |
