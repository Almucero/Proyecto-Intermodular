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
  const apiSegments = new Set([
    'health', 'diagnostic', 'auth', 'users', 'games', 'developers',
    'publishers', 'genres', 'platforms', 'media', 'favorites', 'cart',
    'purchases', 'chat',
  ]);
  app.use((req, _res, next) => {
    if (req.url?.startsWith('/api/')) {
      const after = req.url.slice(5).replace(/^\//, '');
      const first = after.split('/')[0]?.split('?')[0] ?? '';
      if (!apiSegments.has(first)) {
        req.url = (after ? '/' + after : '/') + (req.url.includes('?') ? '?' + req.url.split('?')[1] : '');
      }
    } else if (req.url === '/api') {
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
    : mountBackend().catch((err) => {
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

// Servir estáticos del build de Angular
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
