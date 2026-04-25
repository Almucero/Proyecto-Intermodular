import { access, copyFile, mkdir } from 'node:fs/promises';
import { constants } from 'node:fs';
import { dirname, resolve } from 'node:path';

const workspaceRoot = resolve(import.meta.dirname, '..');
const sourceFile = resolve(
  workspaceRoot,
  'src',
  'backend',
  'config',
  'swagger.generated.json',
);
const targetFiles = [
  resolve(
    workspaceRoot,
    'dist',
    'game-sage',
    'server',
    'backend',
    'config',
    'swagger.generated.json',
  ),
  resolve(
    workspaceRoot,
    'dist',
    'game-sage',
    'server',
    'swagger.generated.json',
  ),
];

const main = async () => {
  await access(sourceFile, constants.R_OK);
  for (const targetFile of targetFiles) {
    await mkdir(dirname(targetFile), { recursive: true });
    await copyFile(sourceFile, targetFile);
  }
  console.log('Swagger generado copiado a rutas de dist/server');
};

main().catch((error) => {
  console.error('Error al copiar swagger.generated.json a dist:', error);
  process.exit(1);
});
