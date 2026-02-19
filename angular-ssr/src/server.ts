import './suppress-warnings';
import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  writeResponseToNodeResponse,
  isMainModule,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const isSetupError = (err: unknown): boolean => {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.startsWith('No se encontró') ||
    msg.startsWith('Faltan variables') ||
    msg.startsWith('Variables con valor inválido') ||
    /^Falta variable de entorno:/.test(msg) ||
    /prisma.*did not initialize|run ["']prisma generate["']/i.test(msg)
  );
};

const getSetupMessage = (err: unknown): string | null => {
  if (!isSetupError(err)) return null;
  const msg = err instanceof Error ? err.message : String(err);
  if (/prisma|prisma generate/i.test(msg)) {
    return 'No se ha generado el cliente Prisma. Ejecuta antes: npx prisma generate';
  }
  return msg;
};

const handleSetupError = (err: unknown): void => {
  const short = getSetupMessage(err);
  if (short) {
    console.error(short);
    process.exit(1);
  }
};

process.on('uncaughtException', (err) => {
  handleSetupError(err);
  throw err;
});
process.on('unhandledRejection', (reason) => {
  handleSetupError(reason);
});

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
app.use((_req, res, next) => {
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
});
if (process.env['VERCEL']) {
  app.use((req, _res, next) => {
    let pathParam = req.query?.__path;
    if (typeof pathParam !== 'string' && req.url?.includes('?')) {
      const q = req.url.indexOf('?');
      const params = new URLSearchParams(req.url.slice(q + 1));
      pathParam = params.get('__path') ?? '';
    }
    if (typeof pathParam === 'string' && pathParam.length > 0) {
      const rest = req.query ? { ...req.query } : {};
      delete rest.__path;
      const qs = Object.keys(rest).length
        ? '?' + new URLSearchParams(rest as Record<string, string>).toString()
        : '';
      req.url = '/' + pathParam.replace(/^\//, '') + qs;
    } else if (req.url === '/api' || req.url?.startsWith('/api?')) {
      req.url = '/';
    }
    next();
  });
}
const angularApp = new AngularNodeAppEngine();

const mountBackend = () =>
  import('./backend/app').then(({ default: backendApp }) => {
    app.use(backendApp);
  });

const backendReady =
  process.env['SSR_DISABLE_BACKEND'] || isMainModule(import.meta.url)
    ? Promise.resolve()
    : mountBackend()
        .then(() => {
          app.use(
            express.static(browserDistFolder, {
              maxAge: '1y',
              index: false,
              redirect: false,
            }),
          );
          app.use((req, res, next) => {
            return Promise.resolve(angularApp.handle(req)).then((response) =>
              response ? writeResponseToNodeResponse(response, res) : next(),
            ).catch(next);
          });
        })
        .catch((err) => {
          const short = getSetupMessage(err);
          if (short) {
            console.error(short);
            process.exit(1);
          }
          console.error('Error al cargar el backend:', err instanceof Error ? err.message : err);
          throw err;
        });

if (!process.env['SSR_DISABLE_BACKEND'] && !isMainModule(import.meta.url)) {
  backendReady.catch(() => {});
}

if (process.env['SSR_DISABLE_BACKEND'] || isMainModule(import.meta.url)) {
  app.use(
    express.static(browserDistFolder, {
      maxAge: '1y',
      index: false,
      redirect: false,
    }),
  );
  app.use((req, res, next) => {
    return Promise.resolve(angularApp.handle(req)).then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    ).catch(next);
  });
}

export const reqHandler = createNodeRequestHandler(app);
export { backendReady };

// Arrancar servidor HTTP cuando se ejecuta directamente con Node
if (isMainModule(import.meta.url)) {
  try {
    const { env } = await import('./backend/config/env');
    const port = env.PORT;
    if (!process.env['SSR_DISABLE_BACKEND']) {
      await mountBackend();
    }
    app.listen(port, (err?: Error) => {
      if (err) {
        console.error('Error al iniciar el servidor:', err.message);
        process.exit(1);
      }
      console.log(`Servidor SSR + API escuchando en http://localhost:${port}`);
      if (!process.env['SSR_DISABLE_BACKEND']) {
        console.log(`Swagger: http://localhost:${port}/api-docs`);
      }
    });
  } catch (err) {
    const short = getSetupMessage(err);
    console.error(short ?? (err instanceof Error ? err.message : String(err)));
    process.exit(1);
  }
}
