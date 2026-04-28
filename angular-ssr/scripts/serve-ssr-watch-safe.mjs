import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { spawn } from 'node:child_process';

const cwd = process.cwd();
const serverPath = resolve(cwd, 'dist', 'game-sage', 'server', 'server.mjs');

let activeChild = null;
let stopping = false;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function getImportTargets(filePath) {
  const content = readFileSync(filePath, 'utf8');
  const dir = dirname(filePath);
  const targets = [];
  const regex = /(?:import\s+[^'"]*from\s+|import\s*\()(['"])([^'"]+)\1/g;
  let match = regex.exec(content);
  while (match) {
    const spec = match[2];
    if (spec && (spec.startsWith('./') || spec.startsWith('../'))) {
      targets.push(resolve(dir, spec));
    }
    match = regex.exec(content);
  }
  return targets;
}

function isChunkModuleError(stderrText) {
  return (
    stderrText.includes('ERR_MODULE_NOT_FOUND') &&
    stderrText.includes('dist\\game-sage\\server\\chunk-')
  );
}

async function waitForStableServerBuild(timeoutMs = 20000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    if (!existsSync(serverPath)) {
      await sleep(250);
      continue;
    }

    let initialMtime = 0;
    try {
      initialMtime = statSync(serverPath).mtimeMs;
    } catch {
      await sleep(250);
      continue;
    }

    await sleep(300);

    let secondMtime = 0;
    try {
      secondMtime = statSync(serverPath).mtimeMs;
    } catch {
      await sleep(250);
      continue;
    }

    if (initialMtime !== secondMtime) {
      await sleep(250);
      continue;
    }

    try {
      const imports = getImportTargets(serverPath);
      const allPresent = imports.every((p) => existsSync(p));
      if (allPresent) return true;
    } catch {
      // Build parcialmente escrito; reintentar.
    }

    await sleep(250);
  }

  return false;
}

async function launchWithRetries() {
  while (!stopping) {
    const ready = await waitForStableServerBuild();
    if (!ready) {
      process.stderr.write(
        '[SSR] Esperando build SSR consistente antes de arrancar...\n',
      );
      await sleep(500);
      continue;
    }

    let stderrBuffer = '';
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
      process.stderr.write(text);
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
    process.stderr.write(`[SSR] Error inesperado en wrapper SSR: ${String(err)}\n`);
    terminate(1);
  });
