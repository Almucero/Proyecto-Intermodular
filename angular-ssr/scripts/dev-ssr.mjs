import { spawn } from "node:child_process";

let shuttingDown = false;
const children = [];

function pipeWithPrefix(stream, prefix, writer) {
  let buffer = "";
  stream.on("data", (chunk) => {
    buffer += chunk.toString();
    const parts = buffer.split(/\r?\n/);
    buffer = parts.pop() ?? "";
    for (const line of parts) {
      if (line.length === 0) continue;
      if (line.trim() === "^C") continue;
      writer.write(`[${prefix}] ${line}\n`);
    }
  });
  stream.on("end", () => {
    if (buffer.length > 0 && buffer.trim() !== "^C") {
      writer.write(`[${prefix}] ${buffer}\n`);
    }
  });
}

function startProcess(name, command) {
  const child = spawn(command, {
    shell: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
  children.push(child);
  if (child.stdout) pipeWithPrefix(child.stdout, name, process.stdout);
  if (child.stderr) pipeWithPrefix(child.stderr, name, process.stderr);
  child.on("exit", (code) => {
    if (!shuttingDown) {
      shutdown(code ?? 1);
    }
  });
}

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

function shutdown(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    killChild(child);
  }
  setTimeout(() => process.exit(exitCode), 350);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

startProcess(
  "BUILD",
  "ng build --watch --configuration development --progress=false",
);
startProcess(
  "SSR",
  'nodemon -C --quiet --delay 12000ms --watch dist/game-sage/server --ext mjs --exec "node --max-old-space-size=8192 --disable-warning=DEP0169 dist/game-sage/server/server.mjs"',
);
if (process.env["DEV_SSL_PROXY"] === "1") {
  startProcess("HTTPS", "local-ssl-proxy --source 3443 --target 3000");
}
