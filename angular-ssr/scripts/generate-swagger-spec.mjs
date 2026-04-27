import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const { swaggerSpec } = await import('../src/backend/config/swagger.ts');

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const outputFile = resolve(
  __dirname,
  '../src/backend/config/swagger.generated.json',
);

const main = async () => {
  await mkdir(dirname(outputFile), { recursive: true });
  await writeFile(outputFile, JSON.stringify(swaggerSpec, null, 2), 'utf8');
  console.log(`Swagger spec generada en: ${outputFile}`);
};

main().catch((error) => {
  console.error('Error generando swagger.generated.json:', error);
  process.exit(1);
});
