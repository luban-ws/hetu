import { ipcMain } from "electron";
import { requireArgParams } from "../infrastructure/handler-helper.js";
import axios from "axios";
import { IPC_EVENTS  } from '@common/ipc-events';
const serviceKey = "AppVeyor";
let accountName = "";
let projectName = "";
let secureStorage;
let settings;
let conn;
let window;
let cache;
let checkPeriodicUpdateHook;

function init(sett, sec, win, cac) {
  secureStorage = sec;
  settings = sett;
  window = win;
  cache = cac;

  // 注册 IPC 事件监听器
  ipcMain.on(IPC_EVENTS.CI.REPO_CHANGED, repoChange);
  ipcMain.on(IPC_EVENTS.CI.APPVEYOR.REBUILD, reBuildAppVeyor);
  ipcMain.on(IPC_EVENTS.CI.APPVEYOR.GET_LOG, requireArgParams(getBuildLog, ["version"]));
}

function repoChange(event, arg) {
  registry = {};
  clearInterval(checkPeriodicUpdateHook);
  if (arg.id && settings.get("ci-appveyor")) {
    accountName = settings.get("ci-appveyor-account");
    projectName = settings.get("ci-appveyor-project");
    secureStorage.getPass(`ci-appveyor-token@${arg.id}`).then((value) => {
      if (value) {
        conn = axios.create({
          baseURL: "https://ci.appveyor.com/api/",
          timeout: 10 * 1000,
          headers: { Authorization: `Bearer ${value}` },
        });
        setTimeout(() => {
          getExistingHistory();
        }, 5 * 1000);
        checkPeriodicUpdateHook = setInterval(() => {
          periodicUpdate();
        }, 20 * 1000);
      } else {
        conn = null;
      }
    });
  } else {
    conn = null;
  }
}

async function getExistingHistory() {
  if (conn) {
    window.webContents.send(IPC_EVENTS.CI.QUERY_BEGAN, { service: serviceKey });
    let batch = 2;
    let allBuilds = [];
    let startBuild;
    for (let i = 0; i < batch; i++) {
      let url = `/projects/${accountName}/${projectName}/history?recordsNumber=100`;
      if (startBuild) {
        url += `&startBuildId=${startBuild}`;
      }
      let resp = await conn.get(url);
      if (!resp) {
        window.webContents.send(IPC_EVENTS.CI.REQUEST_ERROR, {
          error: "GENERIC",
          detail: err.message,
          service: serviceKey,
        });
      } else {
        allBuilds = allBuilds.concat(resp.data.builds);
        if (resp.data.builds.length === 100) {
          startBuild = resp.data.builds[resp.data.builds.length - 1].buildId;
        } else {
          break;
        }
      }
    }
    let allResults = formatResults(allBuilds);
    window.webContents.send(IPC_EVENTS.CI.BUILDS_RETRIEVED, {
      service: serviceKey,
      data: allResults,
    });
  }
}

function formatResults(builds) {
  let result = builds.map((b) => {
    return {
      commit: b.commitId,
      status: b.status,
      buildId: b.buildId,
      build: b.buildNumber,
      version: b.version,
      branch: b.branch,
    };
  });
  let existing = {};
  for (let i = 0; i < result.length; i++) {
    if (existing[result[i].commit]) {
      result.splice(i, 1);
      i -= 1;
    } else {
      existing[result[i].commit] = true;
    }
  }
  return result;
}

function periodicUpdate() {
  if (conn) {
    conn
      .get(`/projects/${accountName}/${projectName}/history?recordsNumber=30`)
      .then((resp) => {
        let result = formatResults(resp.data.builds);
        window.webContents.send(IPC_EVENTS.CI.BUILDS_RETRIEVED, {
          service: serviceKey,
          data: result,
        });
      })
      .catch((err) => {
        window.webContents.send(IPC_EVENTS.CI.REQUEST_ERROR, {
          error: "GENERIC",
          detail: err.message,
          service: serviceKey,
        });
      });
  }
}

function getBuildLog(event, arg) {
  if (conn) {
    conn
      .get(`/projects/${accountName}/${projectName}/build/${arg.version}`)
      .then((resp) => {
        if (resp.data.build.jobs.length) {
          let jobId = resp.data.build.jobs[0].jobId;
          cache
            .downloadFile(
              `${conn.defaults.baseURL}/buildjobs/${jobId}/log`,
              conn.defaults.headers
            )
            .then((content) => {
              event.sender.send(IPC_EVENTS.CI.APPVEYOR.LOG_RETRIEVED, {
                version: arg.version,
                result: content,
              });
            });
        } else {
          event.sender.send(IPC_EVENTS.CI.APPVEYOR.LOG_NOT_FOUND, { version: arg.version });
        }
      });
  }
}

function reBuildAppVeyor(event, arg) {
  if (conn && arg.commit) {
    conn
      .post(`builds`, {
        accountName: accountName,
        projectSlug: projectName,
        branch: arg.branch,
        commitId: arg.commit,
      })
      .then((resp) => {
        event.sender.send(IPC_EVENTS.CI.APPVEYOR.REBUILDED, {});
      })
      .catch((err) => {
        event.sender.send(IPC_EVENTS.CI.APPVEYOR.REBUILD_FAILED, {});
      });
  }
}

export { init };
