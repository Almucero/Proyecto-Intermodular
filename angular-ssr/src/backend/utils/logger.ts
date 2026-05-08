import winston from 'winston';
import { env } from '../config/env';

/** Niveles de severidad usados por el logger de backend. */
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

/** Mapeo de colores para visualización en consola. */
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

winston.addColors(colors);

/** Formato de salida común para todos los transports. */
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

/** Lista de transports activos según entorno. */
const transports: winston.transport[] = [new winston.transports.Console()];

if (env.NODE_ENV !== 'production' && process.env.VERCEL !== '1') {
  transports.push(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
  );
  transports.push(new winston.transports.File({ filename: 'logs/all.log' }));
}

/** Nivel mínimo de logs permitido por entorno de ejecución. */
const level =
  env.NODE_ENV === 'development'
    ? 'debug'
    : env.NODE_ENV === 'test'
      ? 'error'
      : 'warn';

/** Instancia central de logger para toda la aplicación backend. */
export const logger = winston.createLogger({
  level,
  levels,
  format,
  transports,
});
