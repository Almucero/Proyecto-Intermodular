import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import swaggerUi from 'swagger-ui-express';
import { applySecurityHeaders, applyNoCacheHeaders } from '../security-headers';
import { errorHandler } from './middleware/error';
import { generalLimiter, authLimiter } from './middleware/rateLimiter';
import { requestLogger } from './middleware/requestLogger';
import { responseSerializer } from './middleware/serialize';
import { env } from './config/env';
import { swaggerSpec } from './config/swagger';
import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';
import gamesRoutes from './modules/games/games.routes';
import developersRoutes from './modules/developers/developers.routes';
import publishersRoutes from './modules/publishers/publishers.routes';
import genresRoutes from './modules/genres/genres.routes';
import platformsRoutes from './modules/platforms/platforms.routes';
import mediaRoutes from './modules/media/media.routes';
import favoritesRoutes from './modules/favorites/favorites.routes';
import cartRoutes from './modules/cart/cart.routes';
import purchasesRoutes from './modules/purchases/purchases.routes';
import chatRoutes from './modules/chat/chat.routes';
import { prisma } from './config/db';

const originalConsoleWarn = console.warn.bind(console);
console.warn = (...args: unknown[]) => {
  const joined = args
    .filter((arg): arg is string => typeof arg === 'string')
    .join(' ');

  if (
    joined.includes(
      'router deprecated handlers that are Promise-like are deprecated',
    ) ||
    joined.includes('Cleanup error:') ||
    joined.includes('No purchase ID available')
  ) {
    return;
  }

  originalConsoleWarn(...args);
};

const app = express();
app.disable('x-powered-by');

app.set('trust proxy', 1);

app.use((req, res, next) => {
  applySecurityHeaders(req, res);
  if (env.NODE_ENV === 'production') {
    const proto =
      req.get('x-forwarded-proto') || (req.secure ? 'https' : 'http');
    if (proto !== 'https') {
      return res.redirect(301, `https://${req.get('host')}${req.originalUrl}`);
    }
  }
  next();
});

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }),
);

app.use((req, res, next) => {
  applySecurityHeaders(req, res);
  next();
});
const corsOriginsFromEnv = env.CORS_ORIGIN
  ? env.CORS_ORIGIN.split(',')
      .map((o) => o.trim())
      .filter(Boolean)
  : [];
const localhostOrigins = [
  `http://localhost:${env.PORT}`,
  'http://localhost:4200',
];
const allowedOrigins =
  env.NODE_ENV === 'production'
    ? corsOriginsFromEnv
    : [...new Set([...localhostOrigins, ...corsOriginsFromEnv])];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOrigins.length === 0) {
      if (env.NODE_ENV === 'production') {
        return callback(
          new Error('CORS_ORIGIN debe estar configurado en producción'),
        );
      }
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400,
};
app.use(cors(corsOptions));
app.use(hpp());
app.use(express.json({ limit: '10mb' }));

app.use((req, res, next) => {
  const hasNullByte = (obj: any): boolean => {
    if (typeof obj === 'string') return obj.includes('\0');
    if (Array.isArray(obj)) return obj.some(hasNullByte);
    if (obj !== null && typeof obj === 'object') {
      return Object.values(obj).some(hasNullByte);
    }
    return false;
  };

  if (
    hasNullByte(req.query) ||
    hasNullByte(req.params) ||
    hasNullByte(req.body)
  ) {
    res.status(400).json({ message: 'Caracteres no válidos detectados' });
    return;
  }
  next();
});

// Ignorar llamadas de Chrome DevTools para evitar warnings 404
app.get('/.well-known/appspecific/com.chrome.devtools.json', (_req, res) => {
  res.status(200).json({});
});

app.use(requestLogger);
app.use(responseSerializer);

app.use('/api', (req, res, next) => {
  applySecurityHeaders(req, res);
  applyNoCacheHeaders(res);
  next();
});

if (env.NODE_ENV === 'production') {
  app.use(generalLimiter);
}

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.get('/api/diagnostic', (_req, res) =>
  res.json({ ok: true, msg: 'Backend is alive' }),
);

app.get('/sitemap-products.xml', (req, res) => {
  void prisma.game
    .findMany({
      select: { id: true, releaseDate: true },
      orderBy: { id: 'desc' },
    })
    .then((games: Array<{ id: number; releaseDate: Date | null }>) => {
      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
      for (const game of games) {
        const lastMod = game.releaseDate
          ? new Date(game.releaseDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0];
        xml += `
  <url>
    <loc>https://game-sage.vercel.app/product/${game.id}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
      }
      xml += `\n</urlset>`;
      res.header('Content-Type', 'application/xml');
      res.send(xml);
    })
    .catch(() => {
      res.status(500).end();
    });
});

const swaggerSecurityHeaders = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  applySecurityHeaders(req, res);
  applyNoCacheHeaders(res);
  next();
};

const buildSwaggerSpecForRequest = (
  req: express.Request,
): Record<string, unknown> => {
  const host = req.get('host') || '';
  const protocol =
    req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
  const dynamicSpec = JSON.parse(JSON.stringify(swaggerSpec)) as Record<
    string,
    unknown
  >;

  const servers =
    env.NODE_ENV === 'production'
      ? [
          {
            url: `${protocol}://${host}/`,
            description: 'Servidor de producción (Vercel)',
          },
        ]
      : [
          {
            url: `http://localhost:${env.PORT}`,
            description: 'Servidor de desarrollo',
          },
        ];

  dynamicSpec['servers'] = servers;
  return dynamicSpec;
};

const swaggerAssetRedirects: Record<string, string> = {
  'swagger-ui.css':
    'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css',
  'swagger-ui-bundle.js':
    'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js',
  'swagger-ui-standalone-preset.js':
    'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-standalone-preset.js',
  'favicon-16x16.png':
    'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/favicon-16x16.png',
  'favicon-32x32.png':
    'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/favicon-32x32.png',
};

app.get(/^\/api-docs$/, swaggerSecurityHeaders, (_req, res) => {
  res.redirect(302, '/api-docs/');
});
app.get(
  [
    '/swagger-ui-init.js',
    '/swagger-ui.css',
    '/swagger-ui-bundle.js',
    '/swagger-ui-standalone-preset.js',
    '/favicon-16x16.png',
    '/favicon-32x32.png',
  ],
  swaggerSecurityHeaders,
  (req, res) => {
    const asset = req.path.replace(/^\//, '');
    res.redirect(302, `/api-docs/${asset}`);
  },
);
app.get('/api-docs/:asset', swaggerSecurityHeaders, (req, res, next) => {
  const asset = req.params['asset'];
  if (!asset) return next();
  if (asset === 'swagger-ui-init.js') return next();
  const target = swaggerAssetRedirects[asset];
  if (!target) return next();
  return res.redirect(302, target);
});
app.use('/api-docs', swaggerSecurityHeaders, swaggerUi.serve);
app.get('/api-docs/', swaggerSecurityHeaders, (req, res, next) => {
  const dynamicSpec = buildSwaggerSpecForRequest(req);

  return swaggerUi.setup(dynamicSpec, {
    customCssUrl:
      'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css',
    customJs: [
      'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js',
      'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-standalone-preset.js',
    ],
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      deepLinking: true,
    },
  })(req, res, next);
});

if (env.NODE_ENV !== 'test') {
  app.use('/api/auth', authLimiter, authRoutes);
} else {
  app.use('/api/auth', authRoutes);
}

app.use('/api/users', usersRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/developers', developersRoutes);
app.use('/api/publishers', publishersRoutes);
app.use('/api/genres', genresRoutes);
app.use('/api/platforms', platformsRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/purchases', purchasesRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api', (_req, res) =>
  res.status(404).json({ message: 'Endpoint API no encontrado' }),
);

app.use(errorHandler);

export default app;
