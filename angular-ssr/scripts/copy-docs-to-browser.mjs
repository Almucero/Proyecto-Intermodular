/**
 * @file: scripts/copy-docs-to-browser.mjs
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Copia la documentación generada por Compodoc al directorio de salida del navegador.
 */

import { access, cp, mkdir, rm } from 'node:fs/promises';
import { constants } from 'node:fs';
import { resolve } from 'node:path';

// Determina la ruta raíz del espacio de trabajo subiendo un nivel desde el directorio del módulo actual
const workspaceRoot = resolve(import.meta.dirname, '..');

// Ruta de origen local de la documentación generada de Compodoc (docs/)
const sourceDocsDir = resolve(workspaceRoot, 'docs');

// Ruta de destino en el build de producción del navegador para servir la documentación estática
const targetDocsDir = resolve(workspaceRoot, 'dist', 'game-sage', 'browser', 'docs');

const main = async () => {
  try {
    // Comprueba si la carpeta original de documentación 'docs/' existe y tiene permisos de lectura
    await access(sourceDocsDir, constants.R_OK);
  } catch {
    // Si la carpeta docs/ no existe (por ejemplo, en un build rápido sin Compodoc), omite la copia sin error de parada
    console.warn('No se encontro la carpeta docs. Omitiendo copia de Compodoc.');
    return;
  }

  // Asegura de forma asíncrona la existencia del directorio de destino final del navegador
  await mkdir(resolve(workspaceRoot, 'dist', 'game-sage', 'browser'), { recursive: true });

  // Elimina cualquier copia previa de la carpeta 'docs' en el directorio de destino para evitar contenido obsoleto
  await rm(targetDocsDir, { recursive: true, force: true });

  // Copia de forma recursiva y asíncrona todos los archivos de la documentación generada a la ruta de distribución
  await cp(sourceDocsDir, targetDocsDir, { recursive: true });

  console.log('Compodoc copiado a dist/game-sage/browser/docs');
};

// Arranca el flujo principal del script y captura fallos críticos para abortar el proceso
main().catch((error) => {
  console.error('Error al copiar Compodoc al build del navegador:', error);
  process.exit(1);
});
