import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import swaggerUi from 'swagger-ui-express';
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
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://www.gstatic.com https://generativelanguage.googleapis.com; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://fonts.googleapis.com; img-src 'self' data: https://res.cloudinary.com https://img.youtube.com blob:; font-src 'self' data: https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://fonts.gstatic.com; connect-src 'self' https://res.cloudinary.com https://generativelanguage.googleapis.com; frame-src 'self' https://www.youtube-nocookie.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'; media-src 'self' https://res.cloudinary.com blob:; worker-src 'self' blob:; manifest-src 'self'; upgrade-insecure-requests;");
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

app.use((_req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://www.gstatic.com https://generativelanguage.googleapis.com; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://fonts.googleapis.com; img-src 'self' data: https://res.cloudinary.com https://img.youtube.com blob:; font-src 'self' data: https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://fonts.gstatic.com; connect-src 'self' https://res.cloudinary.com https://generativelanguage.googleapis.com; frame-src 'self' https://www.youtube-nocookie.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'; media-src 'self' https://res.cloudinary.com blob:; worker-src 'self' blob:; manifest-src 'self'; upgrade-insecure-requests;");
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

// Ignorar llamadas de Chrome DevTools para evitar warnings 404
app.get('/.well-known/appspecific/com.chrome.devtools.json', (_req, res) => {
  res.status(200).json({});
});

app.use(requestLogger);
app.use(responseSerializer);

app.use('/api', (_req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://www.gstatic.com https://generativelanguage.googleapis.com; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://fonts.googleapis.com; img-src 'self' data: https://res.cloudinary.com https://img.youtube.com blob:; font-src 'self' data: https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://fonts.gstatic.com; connect-src 'self' https://res.cloudinary.com https://generativelanguage.googleapis.com; frame-src 'self' https://www.youtube-nocookie.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'; media-src 'self' https://res.cloudinary.com blob:; worker-src 'self' blob:; manifest-src 'self'; upgrade-insecure-requests;");
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

if (env.NODE_ENV === 'production') {
  app.use(generalLimiter);
}

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.get('/api/diagnostic', (_req, res) =>
  res.json({ ok: true, msg: 'Backend is alive' }),
);

const swaggerSecurityHeaders = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://www.gstatic.com https://generativelanguage.googleapis.com; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://fonts.googleapis.com; img-src 'self' data: https://res.cloudinary.com https://img.youtube.com blob:; font-src 'self' data: https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://fonts.gstatic.com; connect-src 'self' https://res.cloudinary.com https://generativelanguage.googleapis.com; frame-src 'self' https://www.youtube-nocookie.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'; media-src 'self' https://res.cloudinary.com blob:; worker-src 'self' blob:; manifest-src 'self'; upgrade-insecure-requests;");
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
};

app.use('/api-docs', swaggerSecurityHeaders, swaggerUi.serve);
app.get('/api-docs', swaggerSecurityHeaders, (req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://www.gstatic.com https://generativelanguage.googleapis.com; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://fonts.googleapis.com; img-src 'self' data: https://res.cloudinary.com https://img.youtube.com blob:; font-src 'self' data: https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://fonts.gstatic.com; connect-src 'self' https://res.cloudinary.com https://generativelanguage.googleapis.com; frame-src 'self' https://www.youtube-nocookie.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'; media-src 'self' https://res.cloudinary.com blob:; worker-src 'self' blob:; manifest-src 'self'; upgrade-insecure-requests;");
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
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
