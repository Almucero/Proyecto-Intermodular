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
  const first = typeof args[0] === 'string' ? args[0] : '';

  if (
    first.startsWith(
      'router deprecated handlers that are Promise-like are deprecated',
    ) ||
    first.startsWith('Cleanup error:') ||
    first.startsWith('No purchase ID available')
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
    const proto = req.get('x-forwarded-proto') || (req.secure ? 'https' : 'http');
    if (proto !== 'https') {
      return res.redirect(301, `https://${req.get('host')}${req.originalUrl}`);
    }
  }
  next();
});

app.use(
  helmet({
    contentSecurityPolicy: false,
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
  ? env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean)
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
        return callback(new Error('CORS_ORIGIN debe estar configurado en producción'));
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

  if (hasNullByte(req.query) || hasNullByte(req.params) || hasNullByte(req.body)) {
    // eslint-disable-next-line security/detect-possible-timing-attacks
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

app.get('/sitemap-products.xml', async (req, res) => {
  try {
    const games = await prisma.game.findMany({
      select: { id: true, releaseDate: true },
      orderBy: { id: 'desc' }
    });

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
    for (const game of games) {
      const lastMod = game.releaseDate ? new Date(game.releaseDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
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
  } catch (error) {
    res.status(500).end();
  }
});

const swaggerSecurityHeaders = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  applySecurityHeaders(req, res);
  applyNoCacheHeaders(res);
  next();
};

app.use('/api-docs', swaggerSecurityHeaders, swaggerUi.serve);
app.get('/api-docs', swaggerSecurityHeaders, (req, res, next) => {
  applySecurityHeaders(req, res);
  applyNoCacheHeaders(res);
  
  const host = req.get('host') || '';
  const protocol =
    req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');

  const dynamicSpec = JSON.parse(JSON.stringify(swaggerSpec));

  if (dynamicSpec.servers) {
    if (env.NODE_ENV === 'production') {
      dynamicSpec.servers = [
        {
          url: `${protocol}://${host}/`,
          description: 'Servidor de producción (Vercel)',
        },
      ];
    } else {
      dynamicSpec.servers = [
        {
          url: `http://localhost:${env.PORT}`,
          description: 'Servidor de desarrollo',
        },
      ];
    }
  }

  return swaggerUi.setup(dynamicSpec, {
    customCssUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.0.0/swagger-ui.min.css',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.0.0/swagger-ui-bundle.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.0.0/swagger-ui-standalone-preset.js',
    ],
    customCss:
      '.swagger-ui .topbar { display: none } .swagger-ui .scheme-container .schemes { display: flex; justify-content: space-between !important; }',
    swaggerOptions: {
      persistAuthorization: true,
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

app.use(errorHandler);

export default app;
