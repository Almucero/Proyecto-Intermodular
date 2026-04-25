import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { swaggerSpec } from '../src/backend/config/swagger';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const outputFile = resolve(
  __dirname,
  '../src/backend/config/swagger.generated.json',
);

const main = async (): Promise<void> => {
  await mkdir(dirname(outputFile), { recursive: true });
  await writeFile(outputFile, JSON.stringify(swaggerSpec, null, 2), 'utf8');
  console.log(`Swagger spec generada en: ${outputFile}`);
};

main().catch((error) => {
  console.error('Error generando swagger.generated.json:', error);
  process.exit(1);
});
