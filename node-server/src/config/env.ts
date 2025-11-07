import 'dotenv/config';

const required = (v: string | undefined, k: string) => {
  if (!v) throw new Error(`Falta variable de entorno: ${k}`);
  return v;
};

export const env = {
  PORT: Number(process.env.PORT ?? 3000),
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  JWT_SECRET: required(process.env.JWT_SECRET, 'JWT_SECRET'),
  DATABASE_URL: required(process.env.DATABASE_URL, 'DATABASE_URL'),
  BCRYPT_SALT_ROUNDS: Number(process.env.BCRYPT_SALT_ROUNDS ?? 10),
};

