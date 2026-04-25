import './suppress-warnings';
import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  writeResponseToNodeResponse,
  isMainModule,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import { applySecurityHeaders, applyNoCacheHeaders } from './security-headers';

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

const getSeoTranslationForLang = (
  lang: string,
  seoTranslations: Record<
    string,
    { desc: string; keys: string; ogTitle: string; ogDesc: string }
  >,
) => {
  if (lang === 'en') return seoTranslations.en;
  if (lang === 'fr') return seoTranslations.fr;
  if (lang === 'de') return seoTranslations.de;
  if (lang === 'it') return seoTranslations.it;
  return seoTranslations.es;
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
const docsDistFolder = join(browserDistFolder, 'docs');
const docsFallbackFolder = join(import.meta.dirname, '../../../docs');
const docsFolder = existsSync(docsDistFolder) ? docsDistFolder : docsFallbackFolder;
const isProduction = process.env['NODE_ENV'] === 'production';

const app = express();
app.disable('x-powered-by');
app.use((req, res, next) => {
  applySecurityHeaders(req, res);
  
  if (!req.url?.startsWith('/assets/') && !req.url?.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
    applyNoCacheHeaders(res);
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
    } else if (req.url?.includes('?')) {
      const q = req.url.indexOf('?');
      const pathname = req.url.slice(0, q);
      const params = new URLSearchParams(req.url.slice(q + 1));
      if (params.has('__path')) {
        params.delete('__path');
        const qs = params.toString() ? '?' + params.toString() : '';
        req.url = pathname + qs;
      }
    }
    next();
  });
}
const angularApp = new AngularNodeAppEngine({
  allowedHosts: ['localhost', '127.0.0.1', '::1', 'api']
});

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

const processAngularResponse = async (req: express.Request, res: express.Response, next: express.NextFunction, response: Response | null) => {
  if (!response) {
    return next();
  }
  const contentType = response.headers.get('Content-Type') || '';
  if (contentType.includes('text/html')) {
    let html = await response.text();
    
    let lang = 'es';
    const cookies = req.headers.cookie;
    if (cookies) {
      const match = cookies.match(/app-language=([^;]+)/);
      if (match && ['es', 'en', 'fr', 'de', 'it'].includes(match[1])) {
        lang = match[1];
      }
    } else if (req.headers['accept-language']) {
      const acceptLang = req.headers['accept-language'].split(',')[0].split('-')[0];
      if (['es', 'en', 'fr', 'de', 'it'].includes(acceptLang)) {
        lang = acceptLang;
      }
    }

    const seoTranslations: Record<string, { desc: string; keys: string; ogTitle: string; ogDesc: string }> = {
      es: {
        desc: 'Descubre, analiza y chatea sobre tus videojuegos favoritos con IA en GameSage.',
        keys: 'videojuegos, ia, recomendador de juegos, tienda de juegos, game sage',
        ogTitle: 'GameSage - Tu tienda de videojuegos inteligente',
        ogDesc: 'Descubre y compra los mejores videojuegos asistido por IA.',
      },
      en: {
        desc: 'Discover, analyze, and chat about your favorite video games with AI on GameSage.',
        keys: 'video games, ai, game recommender, game store, game sage',
        ogTitle: 'GameSage - Your smart video game store',
        ogDesc: 'Discover and buy the best video games assisted by AI.',
      },
      fr: {
        desc: 'Découvrez, analysez et discutez de vos jeux vidéo préférés avec l\'IA sur GameSage.',
        keys: 'jeux vidéo, ia, recommandation de jeux, magasin de jeux, game sage',
        ogTitle: 'GameSage - Votre magasin de jeux vidéo intelligent',
        ogDesc: 'Découvrez et achetez les meilleurs jeux vidéo assistés par l\'IA.',
      },
      de: {
        desc: 'Entdecken, analysieren und chatten Sie über Ihre Lieblingsvideospiele mit KI auf GameSage.',
        keys: 'videospiele, ki, spieleempfehlung, spieleladen, game sage',
        ogTitle: 'GameSage - Ihr intelligenter Videospiele-Shop',
        ogDesc: 'Entdecken und kaufen Sie die besten Videospiele mit KI-Unterstützung.',
      },
      it: {
        desc: 'Scopri, analizza e chatta sui tuoi videogiochi preferiti con l\'IA su GameSage.',
        keys: 'videogiochi, ia, raccomandatore di giochi, negozio di giochi, game sage',
        ogTitle: 'GameSage - Il tuo negozio di videogiochi intelligente',
        ogDesc: 'Scopri e acquista i migliori videogiochi assistito dall\'IA.',
      }
    };

    const t = getSeoTranslationForLang(lang, seoTranslations);

    html = html.replace(/<html lang="[^"]*"/, `<html lang="${lang}"`);
    html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${t.desc}">`);
    html = html.replace(/<meta name="keywords" content="[^"]*">/, `<meta name="keywords" content="${t.keys}">`);
    html = html.replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${t.ogTitle}">`);
    html = html.replace(/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${t.ogTitle}">`);
    html = html.replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${t.ogDesc}">`);
    html = html.replace(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${t.ogDesc}">`);

    res.status(response.status);
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    res.send(html);
  } else {
    writeResponseToNodeResponse(response, res);
  }
};

const mountBackend = () =>
  import('./backend/app').then(({ default: backendApp }) => {
    app.use(backendApp);
  });

const setupAngularMiddleware = () => {
  app.use((req, res, next) => {
    applySecurityHeaders(req, res, next);
  });

  app.use(rejectSensitiveOrNumericOnlyPath);
  app.get('/docs', (_req, res) => {
    res.redirect(302, '/docs/');
  });
  app.get('/docs/', (_req, res) => {
    const docsIndex = join(docsFolder, 'index.html');
    if (!existsSync(docsIndex)) {
      res.status(404).send('Compodoc no está disponible todavía. Ejecuta npm run docs:build.');
      return;
    }
    const rawHtml = readFileSync(docsIndex, 'utf8');
    const withBase = rawHtml.includes('<base href="/docs/">')
      ? rawHtml
      : rawHtml.replace('<head>', '<head><base href="/docs/">');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(withBase);
  });
  app.use(
    '/docs',
    express.static(docsFolder, {
      maxAge: '1h',
      etag: true,
      lastModified: true,
      redirect: false,
      index: false,
      setHeaders: (res) => {
        res.setHeader('Cache-Control', 'public, max-age=3600');
      },
    }),
  );
  app.use(
    express.static(browserDistFolder, {
      maxAge: isProduction ? '1y' : 0,
      etag: isProduction,
      lastModified: true,
      index: false,
      redirect: false,
      setHeaders: (res, path) => {
        const isStaticAsset = path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/);
        if (!isProduction) {
          applyNoCacheHeaders(res);
          return;
        }
        if (isStaticAsset) {
          res.setHeader(
            'Cache-Control',
            'public, max-age=31536000, immutable',
          );
        } else {
          applyNoCacheHeaders(res);
        }
      },
    }),
  );
  app.use((req, res, next) => {
    Promise.resolve(angularApp.handle(req))
      .then((response) => processAngularResponse(req, res, next, response))
      .catch((error) => next(error));
  });
};

const backendReady =
  process.env['SSR_DISABLE_BACKEND'] || isMainModule(import.meta.url)
    ? Promise.resolve()
    : mountBackend()
        .then(setupAngularMiddleware)
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

if (process.env['SSR_DISABLE_BACKEND']) {
  setupAngularMiddleware();
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
    
    setupAngularMiddleware();

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
