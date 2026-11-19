// Processo principale: crea la finestra e gestisce l'avvio dei giochi.
const { app, BrowserWindow, ipcMain, shell } = require("electron");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

const GAMES_FILE = path.join(__dirname, "src", "games.json");

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 600,
    backgroundColor: "#171a21",
    title: "Nexus Launcher",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  win.loadFile(path.join(__dirname, "src", "index.html"));
}

// Restituisce la lista giochi definita in src/games.json
ipcMain.handle("games:list", () => {
  return JSON.parse(fs.readFileSync(GAMES_FILE, "utf8"));
});

// Avvia l'eseguibile del gioco (campo "exe" in games.json)
ipcMain.handle("games:launch", (_e, exePath) => {
  if (!exePath || !fs.existsSync(exePath)) {
    return { ok: false, error: "Eseguibile non trovato: " + exePath };
  }
  const child = spawn(exePath, [], { detached: true, stdio: "ignore", cwd: path.dirname(exePath) });
  child.unref();
  return { ok: true };
});

// Apre una cartella o un link esterno
ipcMain.handle("shell:open", (_e, target) => shell.openPath(target));

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
