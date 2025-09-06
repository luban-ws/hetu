"use strict";
const electron = require("electron");
const path = require("path");
const url = require("url");
const __filename$1 = url.fileURLToPath(require("url").pathToFileURL(__filename).href);
const __dirname$1 = path.dirname(__filename$1);
let win;
function createWindow() {
  win = new electron.BrowserWindow({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname$1, "../preload/index.js")
    }
  });
  const menuTemplate = [
    {
      label: "File",
      submenu: [
        {
          label: "Quit",
          accelerator: "CommandOrControl+q",
          click() {
            electron.app.quit();
          }
        }
      ]
    },
    {
      label: "View",
      submenu: [
        {
          label: "Refresh",
          accelerator: "F5",
          click() {
            win.reload();
          }
        }
      ]
    },
    {
      label: "Dev",
      submenu: [
        {
          label: "Toggle Dev Tools",
          accelerator: "F12",
          click() {
            win.toggleDevTools();
          }
        }
      ]
    }
  ];
  const mainMenu = electron.Menu.buildFromTemplate(menuTemplate);
  electron.Menu.setApplicationMenu(mainMenu);
  if (process.env.NODE_ENV === "development") {
    win.loadURL("http://localhost:5174");
  } else {
    win.loadFile(path.join(__dirname$1, "../renderer/index.html"));
  }
  win.on("closed", () => {
    win = null;
  });
  win.maximize();
}
electron.app.on("ready", createWindow);
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
electron.app.on("activate", () => {
  if (win === null) {
    createWindow();
  }
});
