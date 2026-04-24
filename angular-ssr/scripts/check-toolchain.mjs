import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const rootDir = join(__dirname, '..');
const nodeModulesDir = join(rootDir, 'node_modules');
const binDir = join(nodeModulesDir, '.bin');
const ngBin = join(binDir, process.platform === 'win32' ? 'ng.cmd' : 'ng');
const prismaBin = join(binDir, process.platform === 'win32' ? 'prisma.cmd' : 'prisma');

const hasNodeModules = existsSync(nodeModulesDir);
const hasNg = existsSync(ngBin);
const hasPrisma = existsSync(prismaBin);

if (!hasNodeModules || !hasNg || !hasPrisma) {
  console.error('');
  console.error('❌ ERROR: Faltan dependencias o herramientas de build en `node_modules`.');
  console.error('');

  if (!hasNodeModules) {
    console.error('   Ejecuta: npm run setup:secure');
    console.error('');
    console.error('   Ese comando instala dependencias, aplica el fix de seguridad de producción y deja el build operativo.');
  } else {
    const missing = [];
    if (!hasNg) missing.push('Angular CLI (ng)');
    if (!hasPrisma) missing.push('Prisma CLI');
    console.error(`   Faltan: ${missing.join(', ')}.`);
    console.error('');
    console.error('   Ejecuta: npm install --include=dev --no-audit');
    console.error('');
    console.error('   Si quieres rehacer el flujo completo de seguridad: npm run setup:secure');
  }

  console.error('');
  console.error('   Luego vuelve a intentar el comando.');
  console.error('');
  process.exit(1);
}
