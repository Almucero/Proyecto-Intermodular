import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  writeResponseToNodeResponse,
  isMainModule,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { env } from './backend/config/env';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

// Montamos la API solo cuando no estamos en modo de extracción de rutas
if (!process.env['SSR_DISABLE_BACKEND']) {
  import('./backend/app')
    .then(({ default: backendApp }) => {
      app.use(backendApp);
    })
    .catch((err) => {
      // Evitar romper el servidor si falla el backend; se loguea el error.
      console.error('Error al cargar el backend de Express:', err);
    });
}

// Servir estáticos del build de Angular
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

// SSR para el resto de rutas
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

// Exportar el handler que usa Angular CLI / Vercel / etc.
export const reqHandler = createNodeRequestHandler(app);

// Arrancar servidor HTTP cuando se ejecuta directamente con Node
if (isMainModule(import.meta.url)) {
  const port = env.PORT;
  app.listen(port, (err?: Error) => {
    if (err) {
      console.error('Error al iniciar el servidor:', err);
      throw err;
    }
    console.log(`Servidor SSR + API escuchando en http://localhost:${port}`);
  });
}
