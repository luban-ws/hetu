import { ipcMain, BrowserWindow } from "electron";
import { requireArgParams } from "../infrastructure/handler-helper.js";
import url from "url";
import path from "path";
let settings;

function init(sett, win) {
  settings = sett;
  if (!settings.get("show-release-note")) {
    settings.update("show-release-note", true);
    win.webContents.once("did-finish-load", () => {
      openReleaseNote();
    });
  }
}

function openReleaseNote() {
  let win = new BrowserWindow({});
  win.setMenu(null);
  let address = url.format({
    pathname: path.join(__dirname, "../frontend/dist/index.html"),
    hash: `/release-note`,
    protocol: "file:",
    slashes: true,
  });
  win.loadURL(address);
  win.maximize();
}

function openAboutPage() {
  let win = new BrowserWindow({});
  win.setMenu(null);
  let address = url.format({
    pathname: path.join(__dirname, "../frontend/dist/index.html"),
    hash: `/about`,
    protocol: "file:",
    slashes: true,
  });
  win.loadURL(address);
  win.maximize();
}

export { init, openReleaseNote, openAboutPage };
