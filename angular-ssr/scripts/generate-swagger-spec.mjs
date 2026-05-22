/**
 * @file: scripts/generate-swagger-spec.mjs
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Genera el archivo JSON de especificación de Swagger a partir de la configuración en memoria.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Importa dinámicamente y de forma asíncrona la especificación construida por Swagger/ts-node en el backend
const { swaggerSpec } = await import('../src/backend/config/swagger.ts');

// Determina la ruta del archivo actual e identifica su directorio contenedor
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define la ruta absoluta del archivo JSON final donde se volcará la especificación
const outputFile = resolve(
  __dirname,
  '../src/backend/config/swagger.generated.json',
);

const main = async () => {
  // Asegura de forma asíncrona que el directorio destino exista de forma recursiva antes de escribir el archivo
  await mkdir(dirname(outputFile), { recursive: true });

  // Serializa el objeto de especificación a formato de texto JSON con un espaciado de 2 espacios para que sea legible
  await writeFile(outputFile, JSON.stringify(swaggerSpec, null, 2), 'utf8');
  
  console.log(`Swagger spec generada en: ${outputFile}`);
};

// Ejecuta el flujo principal del script y captura posibles fallos críticos (p.ej. fallos en la estructura de ts-node)
main().catch((error) => {
  console.error('Error generando swagger.generated.json:', error);
  process.exit(1);
});
