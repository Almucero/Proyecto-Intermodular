/**
 * @file: scripts/check-prisma.mjs
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Script para verificar la generación del cliente de Prisma.
 */


import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Obtiene la ruta del directorio del script actual en entornos ESM (ECMAScript Modules)
const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Calcula el directorio raíz del proyecto subiendo un nivel desde el directorio actual (scripts/)
const rootDir = join(__dirname, '..');

// Define la ruta del archivo índice de tipos del cliente Prisma dentro de node_modules
const prismaClientPath = join(rootDir, 'node_modules', '@prisma', 'client', 'index.d.ts');

// Comprueba de forma síncrona si el archivo del cliente existe físicamente
if (!existsSync(prismaClientPath)) {
  console.error('');
  console.error('❌ ERROR: El cliente de Prisma no está generado.');
  console.error('');
  console.error('   Ejecuta antes: npx prisma generate');
  console.error('');
  // Finaliza la ejecución con código de error 1 indicando que el cliente de base de datos no está listo
  process.exit(1);
}
