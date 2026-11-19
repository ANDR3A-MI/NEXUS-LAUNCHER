// Ponte sicuro tra la UI (src/app.js) e il processo principale.
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("launcher", {
  listGames: () => ipcRenderer.invoke("games:list"),
  launchGame: (exePath) => ipcRenderer.invoke("games:launch", exePath),
  openPath: (target) => ipcRenderer.invoke("shell:open", target),
});
