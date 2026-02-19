import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const rootDir = join(__dirname, '..');
const prismaClientPath = join(rootDir, 'node_modules', '@prisma', 'client', 'index.d.ts');

if (!existsSync(prismaClientPath)) {
  console.error('');
  console.error('❌ ERROR: El cliente de Prisma no está generado.');
  console.error('');
  console.error('   Ejecuta antes: npx prisma generate');
  console.error('');
  process.exit(1);
}
