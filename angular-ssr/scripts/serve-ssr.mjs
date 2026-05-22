/**
 * @file: scripts/serve-ssr.mjs
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Script para iniciar el servidor SSR en modo de producción.
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

// Obtiene el directorio de ejecución actual
const cwd = process.cwd();

// Ruta de producción del ejecutable final del servidor
const serverPath = join(cwd, 'dist', 'game-sage', 'server', 'server.mjs');

// Ruta del archivo de variables de entorno .env
const envPath = join(cwd, '.env');

// Valida la existencia física del compilado de SSR de Angular
if (!existsSync(serverPath)) {
  console.error('No hay build de SSR. Ejecuta antes: npm run build:ssr');
  process.exit(1);
}

// Valida que el archivo .env esté configurado para evitar fallos de conexión a BBDD/APIs
if (!existsSync(envPath)) {
  console.error('No se encontró .env. Cópialo desde .env.example y configura las variables necesarias.');
  process.exit(1);
}

/**
 * Función que detecta si una línea de stderr corresponde a la advertencia conocida de deprecación
 * de sintaxis tipo "Promise-like" del enrutador de Express, la cual se silencia para mantener limpio el log.
 */
const isPromiseLikeDeprecation = (line) =>
  line.includes('router deprecated') && line.includes('Promise-like');

// Levanta el servidor de Node en producción con límites holgados de heap de memoria
const child = spawn(process.execPath, ['--max-old-space-size=8192', '--disable-warning=DEP0169', serverPath], {
  stdio: ['inherit', 'pipe', 'pipe'], // Hereda stdin para interacciones y canaliza stdout/stderr
  cwd,
  env: { ...process.env },
});

// Redirige logs normales de salida estándar directamente a la consola
child.stdout.pipe(process.stdout);

let stderrBuf = '';

// Procesa flujos de error filtrando las advertencias deprecadas
child.stderr.on('data', (chunk) => {
  stderrBuf += chunk;
  const lines = stderrBuf.split(/\r?\n/);
  stderrBuf = lines.pop() ?? '';
  for (const line of lines) {
    if (line && !isPromiseLikeDeprecation(line)) process.stderr.write(line + '\n');
  }
});

child.stderr.on('end', () => {
  if (stderrBuf && !isPromiseLikeDeprecation(stderrBuf)) process.stderr.write(stderrBuf);
});

// Propaga el código de salida del proceso secundario al proceso principal
child.on('exit', (code) => process.exit(code ?? 0));
