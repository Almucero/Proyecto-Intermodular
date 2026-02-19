import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const rootDir = join(__dirname, '..');

const hasNodeModules = existsSync(join(rootDir, 'node_modules'));
const hasNg = existsSync(join(rootDir, 'node_modules', '.bin', process.platform === 'win32' ? 'ng.cmd' : 'ng'));
const hasPrisma = existsSync(
  join(rootDir, 'node_modules', '.bin', process.platform === 'win32' ? 'prisma.cmd' : 'prisma'),
);

if (!hasNodeModules || !hasNg || !hasPrisma) {
  console.error('');
  console.error('❌ ERROR: No se ha ejecutado `npm install` (o `node_modules` está incompleto).');
  console.error('');
  console.error('   Ejecuta primero: npm install');
  console.error('');
  console.error('   Luego vuelve a intentar el comando.');
  console.error('');
  process.exit(1);
}

