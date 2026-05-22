/**
 * @file: scripts/dev-ssr.mjs
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Script para iniciar el servidor en modo de desarrollo con SSR.
 */

import { spawn } from "node:child_process";

// Flag booleano para evitar llamadas de apagado concurrentes o cíclicas
let shuttingDown = false;

// Almacén para realizar el seguimiento de los procesos secundarios activos (Angular, Nodemon, SSL proxy)
const children = [];

/**
 * Redirige de forma controlada el flujo de un stream agregando un prefijo identificativo en consola.
 * Agrupa fragmentos de datos ('chunks') para reconstruir líneas completas y evitar cortes visuales.
 */
function pipeWithPrefix(stream, prefix, writer) {
  let buffer = "";
  stream.on("data", (chunk) => {
    buffer += chunk.toString();
    const parts = buffer.split(/\r?\n/);
    buffer = parts.pop() ?? ""; // Conserva el residuo incompleto de la última línea
    for (const line of parts) {
      if (line.length === 0) continue;
      if (line.trim() === "^C") continue; // Omite caracteres de interrupción crudos
      writer.write(`[${prefix}] ${line}\n`);
    }
  });
  stream.on("end", () => {
    // Procesa cualquier fragmento remanente en el buffer al finalizar la transmisión
    if (buffer.length > 0 && buffer.trim() !== "^C") {
      writer.write(`[${prefix}] ${buffer}\n`);
    }
  });
}

/**
 * Levanta un subproceso asíncrono con el shell del sistema de forma no bloqueante y captura sus flujos estándar.
 */
function startProcess(name, command) {
  const child = spawn(command, {
    shell: true,
    stdio: ["ignore", "pipe", "pipe"], // Ignora entrada estándar y captura salidas/errores para prefijado
  });
  children.push(child);
  
  if (child.stdout) pipeWithPrefix(child.stdout, name, process.stdout);
  if (child.stderr) pipeWithPrefix(child.stderr, name, process.stderr);
  
  // Si uno de los procesos vitales cae o falla, arranca el apagado global en cascada
  child.on("exit", (code) => {
    if (!shuttingDown) {
      shutdown(code ?? 1);
    }
  });
}

/**
 * Termina de forma segura un proceso hijo. En Windows utiliza 'taskkill' para
 * forzar el cierre del árbol de procesos completo (/T /F), impidiendo procesos zombies.
 */
function killChild(child) {
  if (!child.pid) return;
  if (process.platform === "win32") {
    spawn("taskkill", ["/PID", String(child.pid), "/T", "/F"], {
      shell: false,
      windowsHide: true,
      stdio: "ignore",
    });
    return;
  }
  child.kill("SIGTERM");
}

/**
 * Detiene todos los subprocesos de forma ordenada y aborta la ejecución del script padre tras una pequeña espera.
 */
function shutdown(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`\n[SYSTEM] Iniciando apagado controlado...`);
  
  for (const child of children) {
    killChild(child);
  }
  // Margen de espera en milisegundos para permitir a los procesos del SO liberar recursos
  setTimeout(() => process.exit(exitCode), 350);
}

// Suscribe capturadores para señales comunes de terminación (Ctrl+C, Vercel/PM2 termination)
process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

// PROCESO 1: Inicia el compilador dinámico de Angular en modo vigilancia con recarga en caliente
startProcess(
  "BUILD",
  "ng build --watch --configuration development --progress=false",
);

// PROCESO 2: Levanta Nodemon vigilando el directorio de build SSR para reiniciar el servidor al detectar cambios estables
startProcess(
  "SSR",
  'nodemon -C --quiet --delay 12000ms --watch dist/game-sage/server --ext mjs --exec "node scripts/serve-ssr-watch-safe.mjs"',
);

// PROCESO OPCIONAL: Inicializa proxy local SSL si está activa la variable de entorno para entornos con HTTPS local
if (process.env["DEV_SSL_PROXY"] === "1") {
  startProcess("HTTPS", "local-ssl-proxy --source 3443 --target 3000");
}
