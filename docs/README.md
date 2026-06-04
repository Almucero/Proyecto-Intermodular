# Documentación visual y exportes (monorepo)

Evidencias en imagen y PDF del [README raíz](../README.md) (secciones 2 a 9). La documentación ampliada está en **Confluence (espacio PI)** y en los PDF de las secciones 7 y 8.

**Wiki en vivo:** [Proyecto Intermodular (PI)](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/overview)

---

## Presentación de la defensa (GameSage)

Diapositivas para la exposición del proyecto intermodular (14 diapositivas: visión, IPE, GitHub, Jira, Confluence, datos/BI, Figma, arquitectura, demos web/Android, cierre).

| Formato | Enlace | Uso recomendado |
| ------- | ------ | --------------- |
| **Google Slides (web)** | [GameSage — presentación](https://docs.google.com/presentation/d/1W-anIqJPTWcOuoBRFDVEEV_gHqGkvpiVaXctoRChZRE/edit?usp=sharing) | **Preferible:** mejor renderizado (tipografías, iconos, vídeos embebidos) y sin problemas de compatibilidad al abrir |
| **PowerPoint (repo)** | [`GameSage.pptx`](GameSage.pptx) | Copia de respaldo offline; puede variar el aspecto respecto a la versión web según el visor |

Detalle y contexto de exposición: [README raíz — sección 11](../README.md#11-referencia-rápida-para-exposición).

---

## Estructura

```text
docs/
├── GameSage.pptx      Presentación defensa (respaldo; ver Google Slides arriba)
├── producto/          Capturas alineadas (web, Android, Figma)
│   ├── web/
│   ├── android/
│   ├── figma-web/
│   └── figma-movil/
├── diagramas/         ERD, arquitectura, Swagger, Compodoc
├── jira/              Tablero, epics, SP + PDF resumen
├── confluence/        PDF exportación completa del espacio PI
├── equipo/            Capturas de reparto de trabajo (GitHub Contributors)
└── analitica/         Power BI y similares
```

---

## Producto (`producto/`)

Misma secuencia de pantallas en las cuatro carpetas, para comparar implementación y diseño:

**login → home → catálogo → ficha → carrito → chat**

| Carpeta        | Prefijo de archivo | Origen                                                                      |
| -------------- | ------------------ | --------------------------------------------------------------------------- |
| `web/`         | `web-`             | App en producción ([gamingsage.vercel.app](https://gamingsage.vercel.app/)) |
| `android/`     | `android-`         | APK / emulador ([`kotlin/`](../kotlin/))                                    |
| `figma-web/`   | `figma-web-`       | Prototipo escritorio (export Figma)                                         |
| `figma-movil/` | `figma-movil-`     | Prototipo móvil (export Figma)                                              |

Solo en `web/`: `web-admin.png` (área de administración).

Ejemplos de rutas usadas en el README raíz: `producto/web/web-login.png`, `producto/android/android-catalogo.png`, `producto/figma-web/figma-web-home.png`.

---

## Diagramas (`diagramas/`)

| Archivo                    | Uso                            | Origen                                                                                                                      |
| -------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `arquitectura-general.png` | Vista global del sistema       | README sección 2 · [Arquitectura interna (Confluence)](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/73924625) |
| `erd-base-datos.svg`       | Modelo relacional              | `angular-ssr/prisma/schema.prisma` · [Modelo de datos](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/74022913) |
| `swagger-api.png`          | Contratos REST documentados    | [API Docs](https://gamingsage.vercel.app/api-docs/)                                                                         |
| `compodoc-inicio.png`      | Documentación Angular generada | [Compodoc](https://gamingsage.vercel.app/docs/)                                                                             |

---

## Jira (`jira/`)

| Archivo                    | Contenido                                  |
| -------------------------- | ------------------------------------------ |
| `jira-tablero.png`         | Tablero Scrum del proyecto **PI**          |
| `jira-epics.png`           | Vista de epics                             |
| `jira-reparto-sp.png`      | Reparto de Story Points por miembro        |
| `resumen-gestion-jira.pdf` | Resumen ejecutivo con capturas incrustadas |

Detalle en el [README raíz — sección 8](../README.md#8-resumen-de-la-gestión-en-jira-pdf). Wiki: [Gestión Jira](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/73924641) · [Resumen](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/74317875).

---

## Confluence (`confluence/`)

| Archivo                   | Contenido                                                                         |
| ------------------------- | --------------------------------------------------------------------------------- |
| `espacio-pi-completo.pdf` | Documentación unificada del espacio PI (46 páginas, orden del índice del espacio) |

Detalle en el [README raíz — sección 7](../README.md#7-documentación-unificada-del-proyecto-pdf). Wiki: [espacio PI](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/overview).

---

## Analítica (`analitica/`)

| Archivo                 | Contenido                            |
| ----------------------- | ------------------------------------ |
| `powerbi-dashboard.png` | Captura del cuadro de mando Power BI |

Scripts de exportación: [`angular-ssr/src/backend/scripts/`](../angular-ssr/src/backend/scripts/) y [Power BI en Confluence](https://g-team-d9bwba4i.atlassian.net/wiki/spaces/PI/pages/74153985).

---

## Enlaces rápidos

| Necesitas                                         | Dónde                                                                                                                                                                                                                      |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Presentación defensa (recomendada: web)           | [Google Slides](https://docs.google.com/presentation/d/1W-anIqJPTWcOuoBRFDVEEV_gHqGkvpiVaXctoRChZRE/edit?usp=sharing) · [`GameSage.pptx`](GameSage.pptx) · [Sección 11](../README.md#11-referencia-rápida-para-exposición) |
| Galería web / Android / Figma en el README        | [Sección 3 — Capturas](../README.md#3-capturas-e-imágenes-del-producto)                                                                                                                                                    |
| Diagramas y herramientas (ERD, Swagger, Compodoc) | [Sección 3 — Diagramas](../README.md#3-capturas-e-imágenes-del-producto)                                                                                                                                                   |
| Compodoc desplegado                               | [Sección 9 — Compodoc](../README.md#9-documentación-de-código-compodoc)                                                                                                                                                    |
| Acceso producción y admin                         | [Sección 6 — Acceso Vercel](../README.md#acceso-en-producción-vercel)                                                                                                                                                      |
| PDF espacio PI                                    | `confluence/espacio-pi-completo.pdf` · [Sección 7 — PDF Confluence](../README.md#7-documentación-unificada-del-proyecto-pdf)                                                                                               |
| PDF resumen Jira                                  | `jira/resumen-gestion-jira.pdf` · [Sección 8 — PDF Jira](../README.md#8-resumen-de-la-gestión-en-jira-pdf)                                                                                                                 |
| Índice wiki por bloques                           | [Sección 10 — Confluence](../README.md#10-documentación-técnica-en-confluence)                                                                                                                                             |
