import { app, BrowserWindow, Menu, ipcMain, dialog } from "electron";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Keep a global reference of the window object
let win;

function createWindow() {
  // 根据操作系统选择图标文件
  let iconPath;
  if (process.platform === "win32") {
    iconPath = path.join(__dirname, "../../build/icon.ico");
  } else if (process.platform === "darwin") {
    iconPath = path.join(__dirname, "../../build/icon.icns");
  } else {
    // Linux 使用 PNG 格式
    iconPath = path.join(__dirname, "../../build/Icon-512.png");
  }

  // Create the browser window.
  win = new BrowserWindow({
    icon: iconPath, // 设置应用图标
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "../preload/index.js"),
    },
  });

  const menuTemplate = [
    {
      label: "File",
      submenu: [
        {
          label: "Quit",
          accelerator: "CommandOrControl+q",
          click() {
            app.quit();
          },
        },
      ],
    },
    {
      label: "View",
      submenu: [
        {
          label: "Refresh",
          accelerator: "F5",
          click() {
            win.reload();
          },
        },
      ],
    },
    {
      label: "Dev",
      submenu: [
        {
          label: "Toggle Dev Tools",
          accelerator: "F12",
          click() {
            win.toggleDevTools();
          },
        },
      ],
    },
  ];

  const mainMenu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(mainMenu);

  // Load the app
  if (process.env.NODE_ENV === "development") {
    win.loadURL("http://localhost:5174");
  } else {
    win.loadFile(path.join(__dirname, "../renderer/index.html"));
  }

  win.on("closed", () => {
    win = null;
  });

  win.maximize();
}

// IPC handlers for repository functionality
function setupIpcHandlers() {
  // Handle repo browse request
  ipcMain.on("Repo-Browse", async (event, arg) => {
    try {
      const result = await dialog.showOpenDialog(win, {
        properties: ['openDirectory'],
        title: 'Select Repository Directory'
      });
      
      if (!result.canceled && result.filePaths && result.filePaths.length > 0) {
        // Send back the selected folder path
        event.reply("Repo-FolderSelected", { path: result.filePaths[0] });
      }
    } catch (error) {
      console.error('Error opening directory dialog:', error);
    }
  });

  // Handle repo init browse request
  ipcMain.on("Repo-InitBrowse", async (event, arg) => {
    try {
      const result = await dialog.showOpenDialog(win, {
        properties: ['openDirectory'],
        title: 'Select Directory to Initialize Repository'
      });
      
      if (!result.canceled && result.filePaths && result.filePaths.length > 0) {
        // Send back the selected folder path for initialization
        event.reply("Repo-InitPathSelected", { path: result.filePaths[0] });
      }
    } catch (error) {
      console.error('Error opening directory dialog for init:', error);
    }
  });
}

app.on("ready", () => {
  createWindow();
  setupIpcHandlers();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (win === null) {
    createWindow();
  }
});
