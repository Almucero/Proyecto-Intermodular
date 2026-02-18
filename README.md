# Proyecto Intermodular: GameSage

Proyecto intermodular desarrollado en el segundo curso del CFGS en Desarrollo de Aplicaciones Multiplataforma.  
Participantes: **[Rosario González](#rosario-gonzález)** y **[Álvaro Jiménez](#álvaro-jiménez)**

GameSage reúne en un solo proyecto todo lo aprendido durante el curso, integrando una arquitectura moderna basada en la nube, aplicación web con renderizado en servidor (SSR), backend HTTP unificado, desarrollo móvil nativo y diseño UI/UX.

---

## Índice

1. [Miembros del Proyecto](#miembros-del-proyecto)
2. [Descripción del Proyecto](#descripción-del-proyecto)
3. [Arquitectura General](#arquitectura-general)
4. [Componentes del Proyecto](#componentes-del-proyecto)
   - [Base de Datos (Neon)](#base-de-datos-neon)
   - [API Serverless (Vercel)](#api-serverless-vercel)
   - [Aplicación Web (Angular)](#aplicación-web-angular)
   - [Aplicación Móvil (Kotlin)](#aplicación-móvil-kotlin)
   - [Prototipo en Figma](#prototipo-en-figma)
5. [Enlaces de Interés](#enlaces-de-interés)

---

## Miembros del Proyecto

### **Rosario González**

- Correo: <mailto:ayigonzalezortiz@gmail.com>
- GitHub: <https://github.com/RosarioGonzalez06>
- LinkedIn: <https://www.linkedin.com/in/rosario-gonzález-ortiz/>

### **Álvaro Jiménez**

- Correo: <mailto:alvarokilor@gmail.com>
- GitHub: <https://github.com/Almucero>
- LinkedIn: <https://linkedin.com/in/almucero>

---

## Descripción del Proyecto

GameSage es una plataforma integral orientada a la gestión, consulta y visualización de información de videojuegos.  
El proyecto representa la culminación del ciclo formativo, evolucionando hacia una **infraestructura 100% Serverless** centralizada en Vercel para garantizar escalabilidad, rendimiento y despliegue continuo.

El sistema se compone de:

- Una **base de datos PostgreSQL Serverless** gestionada por Neon.
- Una **aplicación web Angular SSR + API REST** unificadas en un solo proyecto desplegado en Vercel.
- Una **aplicación móvil nativa en Kotlin** que consume la API REST.
- Un **prototipo de diseño UI/UX en Figma**.

---

## Arquitectura General

```text
      [Base de Datos - Neon Serverless]
                  (PostgreSQL)
                       ↑
                       |
   [Angular SSR + API REST unificados en Vercel]
                       ↑
           ┌───────────┴───────────┐
           |                       |
    [Web Angular SSR]      [App Móvil Kotlin]
         (Vercel)                (Android)
```

---

## Componentes del Proyecto

### Base de Datos (Neon)

- **Tecnología:** PostgreSQL Serverless (Neon Tech).
- **Integración:** Conectada nativamente a Vercel.
- **Características:** Escalado automático a cero (Scale-to-Zero) y pool de conexiones optimizado para entornos serverless.

### Aplicación Web + API (Angular SSR en Vercel)

- **Framework:** Angular con renderizado en servidor (**SSR**) y backend HTTP basado en Express.
- **Despliegue:** Proyecto unificado desplegado en Vercel (SSR + API REST en el mismo runtime).
- **Funcionalidad:** Centraliza la lógica de negocio, autenticación, gestión de datos y renderizado de la interfaz web.
- **Documentación:** Interfaz interactiva disponible mediante **Swagger UI** expuesta desde el propio backend.

### Aplicación Móvil (Kotlin)

- **Tecnología:** Desarrollo nativo Android con Kotlin.
- **Integración:** Consume la API REST expuesta en Vercel.
- **Funcionalidad:** Acceso completo a la plataforma desde dispositivos móviles con experiencia nativa.

### Prototipo en Figma

- **Diseño:** Prototipo UI/UX de alta fidelidad.
- **Uso:** Base de referencia para la estructura visual y flujo de usuario de ambas aplicaciones.

---

## Enlaces de Interés

### Figma Web: [https://www.figma.com/proto/...](https://www.figma.com/proto/8WRYpwCvkO9wDyGhu57rel/App-venta-de-videojuegos?node-id=0-1&t=04WaZdl2dDfJg0df-1)

### Figma Móvil: [https://www.figma.com/proto/...](https://www.figma.com/proto/8WRYpwCvkO9wDyGhu57rel/App-venta-de-videojuegos?node-id=567-2837&p=f&t=a0jbOffYZnVYoZLL-0&scaling=scale-down&content-scaling=fixed&page-id=16%3A2973&starting-point-node-id=567%3A2837)

### URL del proyecto unificado (Angular SSR + API): [https://gamingsage.vercel.app/](https://gamingsage.vercel.app/)







