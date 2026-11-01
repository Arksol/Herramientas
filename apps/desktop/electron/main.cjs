const { app, BrowserWindow, shell } = require("electron");
const fs = require("node:fs/promises");
const path = require("node:path");
const { backup, DatabaseSync } = require("node:sqlite");

let localServer;
let stopLocalServer;
app.setName("Herramientas");

async function migrateLocalData(destination) {
  if (app.isPackaged) return;
  const source = path.join(__dirname, "..");
  for (const file of [".auth.local.json", ".obsidian.local.json", ".users.local.json"]) {
    const from = path.join(source, file);
    const to = path.join(destination, file);
    try {
      await fs.access(to);
    } catch {
      try { await fs.copyFile(from, to); } catch (reason) {
        if (reason.code !== "ENOENT") throw reason;
      }
    }
  }
  const fromDatabase = path.join(source, "data", "herramientas.sqlite");
  const toDatabase = path.join(destination, "data", "herramientas.sqlite");
  try {
    await fs.access(toDatabase);
  } catch {
    try {
      await fs.access(fromDatabase);
      await fs.mkdir(path.dirname(toDatabase), { recursive: true });
      const database = new DatabaseSync(fromDatabase, { readOnly: true });
      try { await backup(database, toDatabase); } finally { database.close(); }
    } catch (reason) {
      if (reason.code !== "ENOENT") throw reason;
    }
  }
}

app.whenReady().then(async () => {
  const dataPath = app.getPath("userData");
  await fs.mkdir(dataPath, { recursive: true });
  await migrateLocalData(dataPath);
  const developmentUrl = !app.isPackaged ? process.env.HERRAMIENTAS_DEV_URL : undefined;
  let localUrl = developmentUrl;
  if (!localUrl) {
    process.env.HERRAMIENTAS_EMBEDDED = "1";
    process.env.HERRAMIENTAS_PORT = "0";
    process.env.HERRAMIENTAS_DATA_DIR = dataPath;

    const service = await import("../service/server.mjs");
    stopLocalServer = service.stopLocalServer;
    const running = await service.startLocalServer();
    localServer = running.server;
    localUrl = `http://127.0.0.1:${running.port}`;
  }

  const window = new BrowserWindow({
    title: "Herramientas",
    icon: path.join(__dirname, "icon.png"),
    width: 1280,
    height: 850,
    minWidth: 900,
    minHeight: 640,
    backgroundColor: "#070b12",
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  window.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https://")) void shell.openExternal(url);
    return { action: "deny" };
  });
  window.webContents.on("will-navigate", (event, url) => {
    if (!url.startsWith(`${localUrl}/`) && url !== localUrl) event.preventDefault();
  });
  await window.loadURL(localUrl);
  if (app.isPackaged) {
    const { autoUpdater } = require("electron-updater");
    autoUpdater.on("error", (reason) => console.warn("Actualización no disponible:", reason.message));
    const check = () => void autoUpdater.checkForUpdatesAndNotify().catch((reason) => {
      console.warn("No se pudo comprobar la actualización:", reason.message);
    });
    setTimeout(check, 10000).unref();
    setInterval(check, 15 * 60 * 1000).unref();
  }
}).catch((reason) => {
  console.error("No se pudo iniciar Herramientas:", reason);
  app.quit();
});

app.on("window-all-closed", () => app.quit());
app.on("before-quit", () => {
  if (localServer) void stopLocalServer(localServer);
});
