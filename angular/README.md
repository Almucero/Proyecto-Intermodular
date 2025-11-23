# GameSage

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.18.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

Posibles mejoras: velociad correcta del carrusel, desactivar copiado en carrusel (al arrastrar), poner titulo a todas las pantallas (igual que pone "Géneros" en Home, mas que nada para saber donde se esta), centrar el texto de generos con los elementos de abajo (puede que este centrado horizontalmente, pero no con los generos, es decir, que por ejemplo el texto de generos estuviese puesto justo entre deportes y estrategia, y que vaya bien en cada lenguaje). En la pantalla de juego; la plataforma es un seleccionable (que salga un cuadrado alrededor del seleccionado (imagen), y en caso de no haber seleccionado que haya un candado en comprar (como en figma)), que lo de desarrolladora y tal este con el mismo ancho que los botones de arriba, en la descripcion son 5 imagenes. En lo de idioma poner un flecha para abajo, y que sea lo que se pulse para cambiar de idioma. Que all abrir el menu el texto de menu sea pulsable para cerrarlo, y que al arbirlo el logo y el texto se desplacen (con animacion) para no quedar tapados. En usuario, poner (haciendo uso de la directiva de juan antonio, que ya la copie integra), la opcion de copiar el @ y el id, poner la barra esa vertical que separa la imagen de los datos. Hacer que la sesion se mantenga abierta al haber iniciado sesion, y que al cambiar la imagen, el icono de usuario del header sea la imagen cambiada. El color de fondo de usuario es incorrecto.
