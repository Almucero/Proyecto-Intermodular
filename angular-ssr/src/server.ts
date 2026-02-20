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
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://www.gstatic.com https://generativelanguage.googleapis.com; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://fonts.googleapis.com; img-src 'self' data: https://res.cloudinary.com blob:; font-src 'self' data: https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://fonts.gstatic.com; connect-src 'self' https://res.cloudinary.com https://generativelanguage.googleapis.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'; media-src 'self' https://res.cloudinary.com blob:; worker-src 'self' blob:; manifest-src 'self'; upgrade-insecure-requests;");
  
  if (!req.url?.startsWith('/assets/') && !req.url?.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  
  next();
});
if (process.env['VERCEL']) {
  app.use((req, _res, next) => {
    if (req.url?.startsWith('/api?')) {
      const q = req.url.indexOf('?');
      const params = new URLSearchParams(req.url.slice(q + 1));
      const pathParam = params.get('__path') ?? '';
      params.delete('__path');
      const qs = params.toString() ? '?' + params.toString() : '';
      req.url = pathParam.length > 0 ? '/' + pathParam.replace(/^\//, '') + qs : '/';
    } else if (req.url === '/api') {
      req.url = '/';
    }
    next();
  });
}
const angularApp = new AngularNodeAppEngine();

const SENSITIVE_PATH_SEGMENTS = /\.(env|git|htaccess|zap\d+)|\.(idea|svn|hg|bzr|DS_Store)|server\.key|privatekey\.key|id_rsa|id_dsa|\.ssh\/|config\/database|WebServers\.xml|actuator\/|\.php|composer\.(json|lock)|sftp-config\.json|WS_FTP\.ini|filezilla\.xml|vim_settings\.xml|phpinfo|CHANGELOG\.txt|server-status|server-info/i;

const rejectSensitiveOrNumericOnlyPath = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
  if (req.url?.startsWith('/api')) return next();
  const pathname = (req.url ?? '').replace(/\?.*$/, '');
  const pathSegments = pathname.split('/').filter(Boolean);
  if (pathSegments.length === 1 && /^\d+$/.test(pathSegments[0])) {
    res.status(404).end();
    return;
  }
  if (SENSITIVE_PATH_SEGMENTS.test(pathname)) {
    res.status(404).end();
    return;
  }
  next();
};

const mountBackend = () =>
  import('./backend/app').then(({ default: backendApp }) => {
    app.use(backendApp);
  });

const backendReady =
  process.env['SSR_DISABLE_BACKEND'] || isMainModule(import.meta.url)
    ? Promise.resolve()
    : mountBackend()
        .then(() => {
          app.use(rejectSensitiveOrNumericOnlyPath);
          app.use(
            express.static(browserDistFolder, {
              maxAge: '1y',
              etag: true,
              lastModified: true,
              index: false,
              redirect: false,
              setHeaders: (res, path) => {
                res.setHeader('X-Frame-Options', 'DENY');
                res.setHeader('X-Content-Type-Options', 'nosniff');
                res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()');
                res.setHeader('X-XSS-Protection', '1; mode=block');
                res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
                res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
                res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://www.gstatic.com https://generativelanguage.googleapis.com; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://fonts.googleapis.com; img-src 'self' data: https://res.cloudinary.com blob:; font-src 'self' data: https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://fonts.gstatic.com; connect-src 'self' https://res.cloudinary.com https://generativelanguage.googleapis.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'; media-src 'self' https://res.cloudinary.com blob:; worker-src 'self' blob:; manifest-src 'self'; upgrade-insecure-requests;");
                if (path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
                  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
                } else {
                  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
                  res.setHeader('Pragma', 'no-cache');
                  res.setHeader('Expires', '0');
                }
              },
            }),
          );
          app.use((req, res, next) => {
            res.setHeader('X-Frame-Options', 'DENY');
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('X-XSS-Protection', '1; mode=block');
            res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
            res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()');
            res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
            res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://www.gstatic.com https://generativelanguage.googleapis.com; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://fonts.googleapis.com; img-src 'self' data: https://res.cloudinary.com blob:; font-src 'self' data: https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://fonts.gstatic.com; connect-src 'self' https://res.cloudinary.com https://generativelanguage.googleapis.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'; media-src 'self' https://res.cloudinary.com blob:; worker-src 'self' blob:; manifest-src 'self'; upgrade-insecure-requests;");
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
  app.use(rejectSensitiveOrNumericOnlyPath);
  app.use(
    express.static(browserDistFolder, {
      maxAge: '1y',
      etag: true,
      lastModified: true,
      index: false,
      redirect: false,
      setHeaders: (res, path) => {
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()');
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://www.gstatic.com https://generativelanguage.googleapis.com; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://fonts.googleapis.com; img-src 'self' data: https://res.cloudinary.com blob:; font-src 'self' data: https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://fonts.gstatic.com; connect-src 'self' https://res.cloudinary.com https://generativelanguage.googleapis.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'; media-src 'self' https://res.cloudinary.com blob:; worker-src 'self' blob:; manifest-src 'self'; upgrade-insecure-requests;");
        if (path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        } else {
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
        }
      },
    }),
  );
  app.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://www.gstatic.com https://generativelanguage.googleapis.com; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://fonts.googleapis.com; img-src 'self' data: https://res.cloudinary.com blob:; font-src 'self' data: https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://fonts.gstatic.com; connect-src 'self' https://res.cloudinary.com https://generativelanguage.googleapis.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'; media-src 'self' https://res.cloudinary.com blob:; worker-src 'self' blob:; manifest-src 'self'; upgrade-insecure-requests;");
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
