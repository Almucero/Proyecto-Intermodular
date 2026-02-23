
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

    // If we are here, port is in use. Kill it.
    // We use npx kill-port because it handles cross-platform killing well by port
    // but we suppress its output by capturing stdout
    const { stdout } = await execAsync(`npx kill-port ${port}`);
    // Only log if we actually killed something or if the tool reports it
    if (stdout && stdout.trim()) {
        console.log(`Port ${port} was in use. Process killed.`);
    }
  } catch (error) {
    // Ignore errors during kill attempt
  }
}

const port = process.argv[2];
freePort(port);
