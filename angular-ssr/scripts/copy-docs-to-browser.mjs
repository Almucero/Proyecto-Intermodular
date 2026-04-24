import { access, cp, mkdir, rm } from 'node:fs/promises';
import { constants } from 'node:fs';
import { resolve } from 'node:path';

const workspaceRoot = resolve(import.meta.dirname, '..');
const sourceDocsDir = resolve(workspaceRoot, 'docs');
const targetDocsDir = resolve(workspaceRoot, 'dist', 'game-sage', 'browser', 'docs');

const main = async () => {
  try {
    await access(sourceDocsDir, constants.R_OK);
  } catch {
    console.warn('No se encontro la carpeta docs. Omitiendo copia de Compodoc.');
    return;
  }

  await mkdir(resolve(workspaceRoot, 'dist', 'game-sage', 'browser'), { recursive: true });
  await rm(targetDocsDir, { recursive: true, force: true });
  await cp(sourceDocsDir, targetDocsDir, { recursive: true });

  console.log('Compodoc copiado a dist/game-sage/browser/docs');
};

main().catch((error) => {
  console.error('Error al copiar Compodoc al build del navegador:', error);
  process.exit(1);
});
