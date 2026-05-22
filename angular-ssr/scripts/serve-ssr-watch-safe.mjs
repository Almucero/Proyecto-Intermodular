/**
 * @file: scripts/serve-ssr-watch-safe.mjs
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Inicia el servidor SSR en modo de desarrollo con vigilancia mejorada.
 */

import { existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';

// Guarda el directorio de trabajo activo del proceso
const cwd = process.cwd();

// Ruta absoluta del ejecutable del servidor de producción de SSR
const serverPath = resolve(cwd, 'dist', 'game-sage', 'server', 'server.mjs');

// Ruta del punto de entrada del bundle de servidor de Angular
const mainServerPath = resolve(cwd, 'dist', 'game-sage', 'server', 'main.server.mjs');

// Referencia al proceso del servidor que se está ejecutando actualmente
let activeChild = null;

// Bandera para evitar arrancar nuevos servidores cuando el script padre ha recibido señal de apagado
let stopping = false;

/**
 * Función auxiliar para pausar la ejecución de forma asíncrona un número de milisegundos.
 */
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Determina si el texto de error acumulado en stderr corresponde a un fallo de importación de
 * un archivo intermedio ('chunk') generado de forma volátil por el compilador de Angular.
 */
function isChunkModuleError(stderrText) {
  return (
    stderrText.includes('ERR_MODULE_NOT_FOUND') &&
    stderrText.includes('dist\\game-sage\\server\\chunk-')
  );
}

/**
 * Filtra si una línea específica de error de la consola pertenece a la traza de error de carga de un chunk.
 * Esto se utiliza para silenciar el stack trace ruidoso que inunda la terminal durante la recarga.
 */
function isChunkModuleErrorLine(line) {
  return (
    line.includes('ERR_MODULE_NOT_FOUND') ||
    line.includes('dist\\game-sage\\server\\chunk-') ||
    line.includes('Cannot find module') ||
    line.includes('imported from')
  );
}

/**
 * Mecanismo de seguridad: Espera a que los archivos del servidor en dist/ se estabilicen.
 * Compara los tiempos de modificación (mtime) con un intervalo de 300ms. Si los tiempos no cambian,
 * significa que el compilador de Angular ha terminado de escribir en el disco y es seguro arrancar.
 */
async function waitForStableServerBuild(timeoutMs = 20000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    // Si los archivos esenciales no existen todavía, espera una pequeña fracción de tiempo
    if (!existsSync(serverPath) || !existsSync(mainServerPath)) {
      await sleep(250);
      continue;
    }

    let initialMtimeServer = 0;
    let initialMtimeMainServer = 0;
    try {
      // Captura la marca de tiempo de modificación inicial de los archivos clave
      initialMtimeServer = statSync(serverPath).mtimeMs;
      initialMtimeMainServer = statSync(mainServerPath).mtimeMs;
    } catch {
      await sleep(250);
      continue;
    }

    // Espera una fracción de segundo para validar si siguen ocurriendo escrituras en segundo plano
    await sleep(300);

    let secondMtimeServer = 0;
    let secondMtimeMainServer = 0;
    try {
      secondMtimeServer = statSync(serverPath).mtimeMs;
      secondMtimeMainServer = statSync(mainServerPath).mtimeMs;
    } catch {
      await sleep(250);
      continue;
    }

    // Si los tiempos de modificación difieren, significa que el build aún se está escribiendo
    if (
      initialMtimeServer !== secondMtimeServer ||
      initialMtimeMainServer !== secondMtimeMainServer
    ) {
      await sleep(250);
      continue;
    }

    // El build es estable y está listo para ser cargado por Node.js sin provocar caídas
    return true;
  }

  return existsSync(serverPath) && existsSync(mainServerPath);
}

/**
 * Bucle principal de ejecución con reintentos. Levanta el servidor SSR y vigila su salida de error.
 * Si el proceso secundario muere debido a un error de módulo de 'chunk' no encontrado,
 * espera a que el disco se estabilice y lo reinicia automáticamente de forma transparente.
 */
async function launchWithRetries() {
  while (!stopping) {
    const ready = await waitForStableServerBuild();
    if (!ready) {
      process.stderr.write(
        'Esperando build SSR consistente antes de arrancar...\n',
      );
      await sleep(500);
      continue;
    }

    let stderrBuffer = '';
    let stderrLineBuffer = '';
    let suppressChunkTrace = false;
    
    // Levanta el servidor SSR de Node con ajustes de memoria optimizados
    const child = spawn(
      process.execPath,
      ['--max-old-space-size=8192', '--disable-warning=DEP0169', serverPath],
      {
        cwd,
        env: { ...process.env },
        stdio: ['inherit', 'pipe', 'pipe'], // Hereda entrada de teclado estándar y canaliza stdout/stderr
      },
    );
    activeChild = child;

    // Redirige la salida estándar de logs normal al proceso principal
    child.stdout?.pipe(process.stdout);
    
    // Procesa los buffers de error en tiempo real para capturar y suprimir el stack trace de chunks corruptos
    child.stderr?.on('data', (chunk) => {
      const text = chunk.toString();
      stderrBuffer += text;
      stderrLineBuffer += text;
      const lines = stderrLineBuffer.split(/\r?\n/);
      stderrLineBuffer = lines.pop() ?? '';

      for (const line of lines) {
        // Si la línea indica error de chunk, activa el flag de supresión de traza de stack
        if (isChunkModuleErrorLine(line)) {
          suppressChunkTrace = true;
          continue;
        }
        // Mientras esté activa la supresión, descarta todas las líneas internas del stack trace de Node
        if (suppressChunkTrace) {
          if (
            line.trim().startsWith('at ') ||
            line.trim().startsWith('at finalizeResolution') ||
            line.trim().startsWith('at moduleResolve') ||
            line.trim().startsWith('at defaultResolve') ||
            line.trim().startsWith('at #')
          ) {
            continue;
          }
          suppressChunkTrace = false;
        }
        if (line.trim().length === 0) continue;
        process.stderr.write(line + '\n');
      }
    });
    
    child.stderr?.on('end', () => {
      if (stderrLineBuffer.length === 0) return;
      if (!isChunkModuleErrorLine(stderrLineBuffer) && !suppressChunkTrace) {
        process.stderr.write(stderrLineBuffer);
      }
    });

    // Promesa que se resuelve cuando el servidor de Angular finaliza o cae
    const exitCode = await new Promise((resolveExit) => {
      child.on('exit', (code) => resolveExit(code ?? 0));
    });

    activeChild = null;
    if (stopping) return exitCode;

    // Si el servidor ha caído debido a que Angular eliminó/recreó un chunk de importación dinámica
    if (isChunkModuleError(stderrBuffer)) {
      // Realiza una pausa táctica y vuelve a arrancar el bucle
      await sleep(500);
      continue;
    }

    return exitCode;
  }

  return 0;
}

/**
 * Detiene el proceso actual del servidor SSR enviando la señal correspondiente
 * de forma compatible con múltiples plataformas (Windows taskkill vs unix kill).
 */
function terminate(code = 0) {
  if (stopping) return;
  stopping = true;
  if (activeChild?.pid) {
    if (process.platform === 'win32') {
      spawn('taskkill', ['/PID', String(activeChild.pid), '/T', '/F'], {
        shell: false,
        windowsHide: true,
        stdio: 'ignore',
      });
    } else {
      activeChild.kill('SIGTERM');
    }
  }
  setTimeout(() => process.exit(code), 120);
}

// Escucha señales del sistema operativo para apagar todo limpiamente
process.on('SIGINT', () => terminate(0));
process.on('SIGTERM', () => terminate(0));

// Arranca el flujo general con control de reintentos
launchWithRetries()
  .then((code) => terminate(code))
  .catch((err) => {
    process.stderr.write(`Error inesperado en wrapper SSR: ${String(err)}\n`);
    terminate(1);
  });

