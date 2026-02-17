import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

const cwd = process.cwd();
const serverPath = join(cwd, 'dist', 'game-sage', 'server', 'server.mjs');
const envPath = join(cwd, '.env');

if (!existsSync(serverPath)) {
  console.error('No hay build de SSR. Ejecuta antes: npm run build:ssr');
  process.exit(1);
}

if (!existsSync(envPath)) {
  console.error('No se encontró .env. Cópialo desde .env.example y configura las variables necesarias.');
  process.exit(1);
}

const isPromiseLikeDeprecation = (line) =>
  line.includes('router deprecated') && line.includes('Promise-like');

const child = spawn(process.execPath, ['--disable-warning=DEP0169', serverPath], {
  stdio: ['inherit', 'pipe', 'pipe'],
  cwd,
  env: { ...process.env },
});
child.stdout.pipe(process.stdout);
let stderrBuf = '';
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
child.on('exit', (code) => process.exit(code ?? 0));
