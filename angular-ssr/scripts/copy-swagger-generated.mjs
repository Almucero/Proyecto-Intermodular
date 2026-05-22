/**
 * @file: scripts/copy-swagger-generated.mjs
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Copia la documentación generada por Swagger al directorio de salida del navegador.
 */

import { access, copyFile, mkdir } from 'node:fs/promises';
import { constants } from 'node:fs';
import { dirname, resolve } from 'node:path';

// Calcula la ruta raíz del espacio de trabajo de Node.js a partir del directorio del script actual
const workspaceRoot = resolve(import.meta.dirname, '..');

// Ubicación del archivo de especificación de Swagger generado en la estructura de código fuente
const sourceFile = resolve(
  workspaceRoot,
  'src',
  'backend',
  'config',
  'swagger.generated.json',
);

// Destinos requeridos en el empaquetado de producción de Vercel y servidor local para servir la especificación de la API
const targetFiles = [
  // Ruta utilizada por el backend en el entorno empaquetado final
  resolve(
    workspaceRoot,
    'dist',
    'game-sage',
    'server',
    'backend',
    'config',
    'swagger.generated.json',
  ),
  // Ruta directa de respaldo en el directorio del servidor de distribución
  resolve(
    workspaceRoot,
    'dist',
    'game-sage',
    'server',
    'swagger.generated.json',
  ),
];

const main = async () => {
  // Comprueba la existencia y disponibilidad de lectura del archivo de especificación Swagger de origen
  await access(sourceFile, constants.R_OK);

  // Copia de forma asíncrona el archivo a cada una de las ubicaciones destino requeridas
  for (const targetFile of targetFiles) {
    // Asegura la existencia recursiva de los directorios contenedores antes de copiar
    await mkdir(dirname(targetFile), { recursive: true });
    
    // Ejecuta la copia del archivo sobrescribiendo cualquier versión anterior
    await copyFile(sourceFile, targetFile);
  }
  console.log('Swagger generado copiado a rutas de dist/server');
};

// Llama al proceso principal y gestiona excepciones finalizando la ejecución con código de error
main().catch((error) => {
  console.error('Error al copiar swagger.generated.json a dist:', error);
  process.exit(1);
});
