/**
 * @file: scripts/free-port.mjs
 * @project: GameSage - Plataforma de Videojuegos
 * @authors: Rosario González y Álvaro Jiménez
 * @description: Libera un puerto de forma forzada.
 */

import { exec } from 'node:child_process';
import { promisify } from 'node:util';

// Promisifica la función exec para poder usarla con sintaxis async/await
const execAsync = promisify(exec);

/**
 * Función asíncrona que detecta y elimina cualquier proceso que retenga el puerto indicado.
 */
async function freePort(port) {
  // Asegura que el usuario haya especificado un puerto válido por argumento
  if (!port) {
    console.error('Please specify a port number.');
    process.exit(1);
  }

  // Bandera para diferenciar comandos de red y terminación en Windows vs Unix/Linux/macOS
  const isWin = process.platform === 'win32';

  try {
    // Define el comando adecuado para verificar puertos activos
    const checkCmd = isWin
      ? `netstat -ano | findstr :${port}`
      : `lsof -i :${port}`;

    try {
      // Intenta ejecutar la comprobación; si arroja error, significa que el puerto ya está libre
      await execAsync(checkCmd);
    } catch (e) {
      // Finaliza temprano ya que no hay procesos ocupando el puerto
      return;
    }

    // Lanza una primera pasada rápida usando la utilidad npx kill-port
    const { stdout } = await execAsync(`npx kill-port ${port}`);
    if (stdout && stdout.trim()) {
      console.log(`Port ${port} was in use. Process killed.`);
    }

    // Verificación adicional de seguridad para Windows (a veces los sockets quedan en TIME_WAIT o no se liberan)
    if (isWin) {
      try {
        // Vuelve a listar las conexiones asociadas al puerto
        const { stdout: used } = await execAsync(`netstat -ano | findstr :${port}`);
        
        // Parsea la salida de netstat para extraer de forma única los identificadores de proceso (PIDs) en la última columna
        const pids = [...new Set(
          used
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line) => line.split(/\s+/).pop()) // El PID es el último elemento delimitado por espacios
            .filter((pid) => pid && /^\d+$/.test(pid)) // Filtra asegurando que sea un número entero
        )];
        
        // Termina de forma contundente (/F) cada PID que siga reteniendo el puerto
        for (const pid of pids) {
          await execAsync(`taskkill /PID ${pid} /F`);
        }
      } catch {
        // Captura fallos de ejecución silenciosamente en caso de que los procesos ya hayan desaparecido
      }
    }
  } catch (error) {
    // Manejo de excepciones generales
  }
}

// Extrae el puerto a liberar desde los argumentos de la línea de comandos (ej: node free-port.mjs 3000)
const port = process.argv[2];
await freePort(port);
