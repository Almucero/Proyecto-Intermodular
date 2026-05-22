/**
 * @file: scripts/check-toolchain.mjs
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Verifica que la toolchain esté correctamente instalada y configurada.
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Obtiene la ruta del directorio del script actual en entornos ESM
const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Calcula el directorio raíz del proyecto subiendo un nivel desde scripts/
const rootDir = join(__dirname, '..');

// Define la ruta del directorio 'node_modules' donde se almacenan las dependencias del proyecto
const nodeModulesDir = join(rootDir, 'node_modules');

// Define el directorio local '.bin' donde se encuentran los ejecutables instalados de npm
const binDir = join(nodeModulesDir, '.bin');

// Resuelve la ruta del comando de Angular CLI ('ng'), usando sufijo '.cmd' si se detecta sistema Windows
const ngBin = join(binDir, process.platform === 'win32' ? 'ng.cmd' : 'ng');

// Resuelve la ruta del comando de Prisma CLI ('prisma'), usando sufijo '.cmd' si es sistema Windows
const prismaBin = join(binDir, process.platform === 'win32' ? 'prisma.cmd' : 'prisma');

// Verifica la existencia física de las dependencias instaladas y de los binarios requeridos
const hasNodeModules = existsSync(nodeModulesDir);
const hasNg = existsSync(ngBin);
const hasPrisma = existsSync(prismaBin);

// Si falta la carpeta de dependencias o alguna de las herramientas CLI principales, detiene el flujo
if (!hasNodeModules || !hasNg || !hasPrisma) {
  console.error('');
  console.error('❌ ERROR: Faltan dependencias o herramientas de build en `node_modules`.');
  console.error('');

  // Caso específico: Si no existe la carpeta 'node_modules', indica el comando de instalación segura
  if (!hasNodeModules) {
    console.error('   Ejecuta: npm run setup:secure');
    console.error('');
    console.error('   Ese comando instala dependencias, aplica el fix de seguridad de producción y deja el build operativo.');
  } else {
    // Caso específico: Si existen las dependencias pero faltan los binarios (p.ej. instalaciones incompletas o corruptas)
    const missing = [];
    if (!hasNg) missing.push('Angular CLI (ng)');
    if (!hasPrisma) missing.push('Prisma CLI');
    console.error(`   Faltan: ${missing.join(', ')}.`);
    console.error('');
    console.error('   Ejecuta: npm run setup:secure');
  }

  console.error('');
  console.error('   Luego vuelve a intentar el comando.');
  console.error('');
  // Aborta la ejecución indicando error de entorno/toolchain
  process.exit(1);
}
