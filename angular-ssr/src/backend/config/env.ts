import { config } from 'dotenv';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const envPath = join(process.cwd(), '.env');
config({ path: envPath, quiet: true });

if (!existsSync(envPath)) {
  throw new Error(
    'No se encontró .env. Cópialo desde .env.example y configura las variables necesarias.',
  );
}

const STRING_KEYS = [
  'PORT',
  'NODE_ENV',
  'JWT_SECRET',
  'POSTGRES_PRISMA_URL',
  'BCRYPT_SALT_ROUNDS',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'GOOGLE_GENERATIVE_AI_API_KEY',
  'ADMIN_EMAILS',
  'ADMIN_PASSWORDS',
  'ADMIN_NAMES',
] as const;

const NUMERIC_KEYS = ['PORT', 'BCRYPT_SALT_ROUNDS'] as const;

function validate(): void {
  const missing: string[] = [];
  const invalid: string[] = [];

  for (const k of STRING_KEYS) {
    const v = process.env[k];
    if (v === undefined || v === '') missing.push(k);
  }

  for (const k of NUMERIC_KEYS) {
    const v = process.env[k];
    if (v === undefined || v === '') continue;
    const n = Number(v);
    if (Number.isNaN(n) || n <= 0) invalid.push(k);
  }

  if (missing.length) {
    throw new Error(`Faltan variables de entorno: ${missing.join(', ')}`);
  }
  if (invalid.length) {
    throw new Error(
      `Variables con valor inválido (deben ser números > 0): ${invalid.join(', ')}`,
    );
  }
}

validate();

export const env = {
  PORT: Number(process.env.PORT),
  NODE_ENV: process.env.NODE_ENV!,
  JWT_SECRET: process.env.JWT_SECRET!,
  POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL!,
  BCRYPT_SALT_ROUNDS: Number(process.env.BCRYPT_SALT_ROUNDS),
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME!,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY!,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET!,
  GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
  ADMIN_EMAILS: process.env.ADMIN_EMAILS!,
  ADMIN_PASSWORDS: process.env.ADMIN_PASSWORDS!,
  ADMIN_NAMES: process.env.ADMIN_NAMES!,
};
