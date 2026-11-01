import { spawn } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const directory = path.dirname(fileURLToPath(import.meta.url));
const project = path.resolve(directory, "..");
const require = createRequire(import.meta.url);
const children = new Map();
const sync = process.argv.includes("--sync");
const userData = process.platform === "win32"
  ? path.join(process.env.APPDATA ?? path.join(os.homedir(), "AppData", "Roaming"), "Herramientas")
  : path.join(os.homedir(), ".config", "Herramientas");
let stopping = false;

async function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
  });
}

async function ready(url, child) {
  for (let attempt = 0; attempt < 80; attempt++) {
    if (child.exitCode !== null) throw new Error(`El proceso terminó antes de abrir ${url}.`);
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(500) });
      if (response.ok) return;
    } catch { /* Todavía está iniciando. */ }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`No se pudo abrir ${url}.`);
}

function start(name, command, args, env = {}) {
  const child = spawn(command, args, {
    cwd: project,
    env: { ...process.env, ...env },
    stdio: "inherit",
    windowsHide: true
  });
  children.set(name, child);
  child.once("exit", (code) => {
    if (children.get(name) === child) children.delete(name);
    if (!stopping) console.log(`${name} terminó (${code ?? "sin código"}).`);
  });
  return child;
}

function stop(name) {
  const child = children.get(name);
  if (child && child.exitCode === null) child.kill();
  children.delete(name);
}

async function shutdown() {
  if (stopping) return;
  stopping = true;
  for (const name of [...children.keys()]) stop(name);
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

try {
  fs.mkdirSync(userData, { recursive: true });
  const apiPort = await freePort();
  const vitePort = await freePort();
  const apiUrl = `http://127.0.0.1:${apiPort}`;
  const devUrl = `http://127.0.0.1:${vitePort}`;
  const apiEnvironment = {
    HERRAMIENTAS_PORT: String(apiPort),
    HERRAMIENTAS_DATA_DIR: userData
  };
  let service = start("Servicio local", process.execPath, ["service/server.mjs"], apiEnvironment);
  await ready(`${apiUrl}/api/health`, service);
  const vite = start("Vista web", process.execPath, ["node_modules/vite/bin/vite.js"], {
    HERRAMIENTAS_API_PORT: String(apiPort),
    HERRAMIENTAS_VITE_PORT: String(vitePort)
  });
  await ready(devUrl, vite);
  const electron = require("electron");
  const openDesktop = () => start("Escritorio", electron, ["."], {
    HERRAMIENTAS_DEV_URL: devUrl
  });
  openDesktop();
  if (sync) start("GitHub", process.execPath, ["scripts/sync-github.mjs"]);

  console.log(`Navegador: ${devUrl}`);
  console.log("La ventana de escritorio comparte esta vista y los datos de la instalación.");
  const watcher = fs.watch(path.join(project, "service"), { recursive: true }, () => {
    clearTimeout(watcher.restartTimer);
    watcher.restartTimer = setTimeout(async () => {
      stop("Servicio local");
      await new Promise((resolve) => setTimeout(resolve, 500));
      service = start("Servicio local", process.execPath, ["service/server.mjs"], apiEnvironment);
      try { await ready(`${apiUrl}/api/health`, service); }
      catch (reason) { console.error(reason); }
    }, 700);
  });
  const mainWatcher = fs.watch(path.join(project, "electron"), { recursive: true }, () => {
    clearTimeout(mainWatcher.restartTimer);
    mainWatcher.restartTimer = setTimeout(() => {
      stop("Escritorio");
      setTimeout(openDesktop, 700);
    }, 700);
  });
  process.once("exit", () => {
    watcher.close();
    mainWatcher.close();
  });
} catch (reason) {
  console.error("No se pudo iniciar el modo en vivo:", reason);
  await shutdown();
}
