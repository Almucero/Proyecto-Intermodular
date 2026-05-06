
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

async function freePort(port) {
  if (!port) {
    console.error('Please specify a port number.');
    process.exit(1);
  }

  const isWin = process.platform === 'win32';

  try {
    // Check if port is in use
    const checkCmd = isWin
      ? `netstat -ano | findstr :${port}`
      : `lsof -i :${port}`;
    
    try {
      await execAsync(checkCmd);
    } catch (e) {
      // If command fails (e.g. findstr returns 1), port is likely free
      return;
    }

    // If we are here, port is in use. Try kill-port first.
    const { stdout } = await execAsync(`npx kill-port ${port}`);
    if (stdout && stdout.trim()) {
      console.log(`Port ${port} was in use. Process killed.`);
    }

    // On Windows, kill-port can miss edge cases. Fallback: kill pids from netstat.
    if (isWin) {
      try {
        const { stdout: used } = await execAsync(`netstat -ano | findstr :${port}`);
        const pids = [...new Set(
          used
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line) => line.split(/\s+/).pop())
            .filter((pid) => pid && /^\d+$/.test(pid))
        )];
        for (const pid of pids) {
          await execAsync(`taskkill /PID ${pid} /F`);
        }
      } catch {
        // ignore fallback errors
      }
    }
  } catch (error) {
    // Ignore errors during kill attempt
  }
}

const port = process.argv[2];
await freePort(port);
