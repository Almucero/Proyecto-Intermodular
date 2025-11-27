# Proyecto intermodular: GameSage

Proyecto intermodular desarrollado en el segundo curso del CFGS en Desarrollo de Aplicaciones Multiplataforma.  
Participantes: **[Rosario González](#rosario-gonzález)** y **[Álvaro Jiménez](#álvaro-jiménez)**

GameSage reúne en un solo proyecto todo lo aprendido durante el curso en diversas asignaturas, integrando backend, frontend web, aplicación móvil, base de datos, despliegue en la nube y prototipado UI, entre otros.

---

## Índice

1. [Miembros del Proyecto](#miembros-del-proyecto)
2. [Descripción del Proyecto](#descripción-del-proyecto)
3. [Arquitectura General](#arquitectura-general)
4. [Componentes del Proyecto](#componentes-del-proyecto)
   - [Base de Datos](#base-de-datos)
   - [API / Servicio Web](#api--servicio-web)
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

GameSage es una plataforma orientada a la gestión, consulta y visualización de información relacionada con videojuegos.  
El proyecto sirve como práctica completa del ciclo, integrando conocimientos de programación, diseño, bases de datos, servicios web, diseño de interfaces y despliegue.

El sistema se compone de:

- Una **base de datos alojada en Render**.
- Un **servicio backend** en Node.js también desplegado en Render.
- Una **aplicación web en Angular**, desplegada en Netlify.
- Una **aplicación móvil desarrollada en Kotlin** que consume la misma API.
- Un **prototipo de diseño UI/UX en Figma**.

---

## Arquitectura General

```text
     [Base de Datos - Render]
               ↑
               |
 [API REST en Node.js - Render]
               ↑
      ┌────────┴────────┐
      |                 |
[Web Angular]  [App Móvil Kotlin]
   Netlify           Android
```

---

## Componentes del Proyecto

### Base de Datos

- Alojada en **Render**.
- Contiene toda la información estructurada que consume el backend.

### API / Servicio Web

- Servidor desarrollado en **Node.js**.
- Desplegado en **Render**.
- Expone endpoints para juegos, usuarios y demás recursos necesarios.
- Documentación disponible mediante **Swagger**.

### Aplicación Web (Angular)

- Desarrollada en Angular.
- Conectada a la API alojada en Render.
- Desplegada en **Netlify**.

### Aplicación Móvil (Kotlin)

- App nativa para Android desarrollada en Kotlin.
- Consume la misma API.
- Permite acceder a la funcionalidad esencial de la plataforma.

### Prototipo en Figma

- Prototipo UI/UX inicial del proyecto.
- Base de referencia para la estructura visual.

---

## Enlaces de Interés

### Web: [Enlace a la web desplegada](https://gamingsage.netlify.app/)

### Swagger: [Swagger Docs](https://gamesage-service.onrender.com/api-docs/)

### Prototipo en Figma: [Ver prototipo](https://www.figma.com/proto/8WRYpwCvkO9wDyGhu57rel/App-venta-de-videojuegos?node-id=0-1&t=04WaZdl2dDfJg0df-1)

