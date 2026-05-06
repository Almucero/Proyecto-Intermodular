import { existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';

const cwd = process.cwd();
const serverPath = resolve(cwd, 'dist', 'game-sage', 'server', 'server.mjs');
const mainServerPath = resolve(cwd, 'dist', 'game-sage', 'server', 'main.server.mjs');

let activeChild = null;
let stopping = false;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function isChunkModuleError(stderrText) {
  return (
    stderrText.includes('ERR_MODULE_NOT_FOUND') &&
    stderrText.includes('dist\\game-sage\\server\\chunk-')
  );
}

function isChunkModuleErrorLine(line) {
  return (
    line.includes('ERR_MODULE_NOT_FOUND') ||
    line.includes('dist\\game-sage\\server\\chunk-') ||
    line.includes('Cannot find module') ||
    line.includes('imported from')
  );
}

async function waitForStableServerBuild(timeoutMs = 20000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    if (!existsSync(serverPath) || !existsSync(mainServerPath)) {
      await sleep(250);
      continue;
    }

    let initialMtimeServer = 0;
    let initialMtimeMainServer = 0;
    try {
      initialMtimeServer = statSync(serverPath).mtimeMs;
      initialMtimeMainServer = statSync(mainServerPath).mtimeMs;
    } catch {
      await sleep(250);
      continue;
    }

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

    if (
      initialMtimeServer !== secondMtimeServer ||
      initialMtimeMainServer !== secondMtimeMainServer
    ) {
      await sleep(250);
      continue;
    }

    return true;
  }

  return existsSync(serverPath) && existsSync(mainServerPath);
}

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
    const child = spawn(
      process.execPath,
      ['--max-old-space-size=8192', '--disable-warning=DEP0169', serverPath],
      {
        cwd,
        env: { ...process.env },
        stdio: ['inherit', 'pipe', 'pipe'],
      },
    );
    activeChild = child;

    child.stdout?.pipe(process.stdout);
    child.stderr?.on('data', (chunk) => {
      const text = chunk.toString();
      stderrBuffer += text;
      stderrLineBuffer += text;
      const lines = stderrLineBuffer.split(/\r?\n/);
      stderrLineBuffer = lines.pop() ?? '';

      for (const line of lines) {
        if (isChunkModuleErrorLine(line)) {
          suppressChunkTrace = true;
          continue;
        }
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

    const exitCode = await new Promise((resolveExit) => {
      child.on('exit', (code) => resolveExit(code ?? 0));
    });

    activeChild = null;
    if (stopping) return exitCode;

    if (isChunkModuleError(stderrBuffer)) {
      await sleep(500);
      continue;
    }

    return exitCode;
  }

  return 0;
}

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

process.on('SIGINT', () => terminate(0));
process.on('SIGTERM', () => terminate(0));

launchWithRetries()
  .then((code) => terminate(code))
  .catch((err) => {
    process.stderr.write(`Error inesperado en wrapper SSR: ${String(err)}\n`);
    terminate(1);
  });
