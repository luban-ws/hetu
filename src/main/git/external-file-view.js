import { ipcMain, BrowserWindow } from "electron";
import { requireArgParams } from "../infrastructure/handler-helper.js";
import url from "url";
import path from "path";
import { IPC_EVENTS  } from '@common/ipc-events';
let fileWatch;

function init(fw) {
  fileWatch = fw;
  ipcMain.on(
    IPC_EVENTS.REPO.OPEN_EXTERNAL_FILE,
    requireArgParams(open, ["file", "commit"])
  );
}

function open(event, arg) {
  let win = new BrowserWindow({});
  win.setMenu(null);
  let address = url.format({
    pathname: path.join(__dirname, "../frontend/dist/index.html"),
    hash: `/file/${arg.commit}`,
    protocol: "file:",
    slashes: true,
  });
  win.webContents.once("did-finish-load", () => {
    fileWatch.getFileDetail(arg.file, arg.commit).then((result) => {
      // Ensure file detail result is serializable
      const serializableResult = {
        file: result.file || '',
        commit: result.commit || '',
        content: result.content || '',
        encoding: result.encoding || 'utf8',
        binary: Boolean(result.binary),
        size: Number(result.size) || 0,
        // Add any other properties that might exist
        ...(result.diff && { diff: String(result.diff) }),
        ...(result.patch && { patch: String(result.patch) }),
        ...(result.additions && { additions: Number(result.additions) }),
        ...(result.deletions && { deletions: Number(result.deletions) }),
      };
      win.webContents.send(IPC_EVENTS.REPO.FILE_DETAIL_RETRIEVED, serializableResult);
    });
  });
  win.loadURL(address);
  win.maximize();
}

export { init };
