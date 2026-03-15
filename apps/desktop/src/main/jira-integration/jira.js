import { ipcMain } from "electron";
import { requireArgParams } from "../infrastructure/handler-helper.js";
import axios from "axios";
import { IPC_EVENTS  } from '@common/ipc-events';
let username = "";
let apiToken = "";
let address = "";
let secureStorage;
let settings;
let conn;
let window;

function init(sett, sec, win) {
  secureStorage = sec;
  settings = sett;
  window = win;

  // 注册 IPC 事件监听器
  ipcMain.on(IPC_EVENTS.JIRA.REPO_CHANGED, requireArgParams(initJira, ["id"]));
  ipcMain.on(IPC_EVENTS.JIRA.GET_ISSUE, requireArgParams(getIssue, ["key"]));
  ipcMain.on(
    IPC_EVENTS.JIRA.UPDATE_ISSUE,
    requireArgParams(updateIssue, ["key", "data"])
  );
  ipcMain.on(IPC_EVENTS.JIRA.ADD_COMMENT, requireArgParams(addComment, ["key", "body"]));
  ipcMain.on(
    IPC_EVENTS.JIRA.GET_ASSIGNABLE_USERS,
    requireArgParams(findAssignableUsers, ["key"])
  );
  ipcMain.on(
    IPC_EVENTS.JIRA.ASSIGN_ISSUE,
    requireArgParams(assignIssue, ["key", "name"])
  );
  ipcMain.on(IPC_EVENTS.JIRA.ADD_SUBTASK, requireArgParams(addSubtask, ["key", "name"]));
  ipcMain.on(IPC_EVENTS.JIRA.SEARCH_ISSUES, requireArgParams(searchIssues, ["jql"]));
}

function initJira(event, arg) {
  if (settings.get("jira-enabled")) {
    username = settings.get("jira-username");
    address = settings.get("jira-address");
    secureStorage.getPass(`jira-token@${arg.id}`).then((pass) => {
      apiToken = pass;
      if (username && apiToken && address) {
        conn = axios.create({
          baseURL: `https://${address}/rest/api/2`,
          timeout: 10 * 1000,
          headers: {
            Authorization: `Basic ${Buffer.from(
              username + ":" + apiToken
            ).toString("base64")}`,
          },
        });
        // setup response inteceptors
        conn.interceptors.response.use(
          function (response) {
            return response;
          },
          function (error) {
            if (error.response) {
              if (
                error.response.headers[IPC_EVENTS.JIRA.LOGIN_REASON] ===
                "AUTHENTICATION_DENIED"
              ) {
                window.webContents.send(IPC_EVENTS.JIRA.CAPTCHA_REQUIRED, {});
                return Promise.resolve(error);
              } else if (error.response.status === 404) {
                window.webContents.send(IPC_EVENTS.JIRA.NOT_FOUND, {});
                return Promise.reject(error);
              } else if (error.request.path.indexOf("search") !== -1) {
                // swallow search errors
                return Promise.resolve("QUERY_ISSUE");
              } else {
                window.webContents.send(IPC_EVENTS.JIRA.OPERATION_FAILED, {});
              }
            } else if (error.code === "ECONNABORTED") {
              window.webContents.send(IPC_EVENTS.JIRA.TIMEOUT, { error: error });
            } else {
              window.webContents.send(IPC_EVENTS.JIRA.ERROR, { error: error });
            }
            return Promise.reject(error);
          }
        );
        getResolution();
        getIssueTypes();
      } else {
        conn = null;
      }
    });
  } else {
    conn = null;
  }
}

function getIssue(event, arg) {
  if (conn) {
    return getJiraIssue(arg.key).then((result) => {
      checkStoryFields(result);
      event.sender.send(IPC_EVENTS.JIRA.ISSUE_RETRIEVED, { issue: result.data });
    });
  }
}

function addComment(event, arg) {
  if (conn) {
    let data = {
      body: arg.body,
    };
    return conn.post(`/issue/${arg.key}/comment`, data).then((result) => {
      return getIssue(event, arg);
    });
  }
}

function getJiraIssue(key) {
  if (conn) {
    return conn
      .get(
        `/issue/${key}?expand=renderedFields,names,transitions,transitions.fields,editmeta`
      )
      .then((result) => {
        result.data.fields.description = result.data.renderedFields.description;
        return result;
      });
  } else {
    return Promise.reject("NO_CONN");
  }
}

function getResolution() {
  if (conn) {
    return conn.get(`/resolution`).then((result) => {
      window.webContents.send(IPC_EVENTS.JIRA.RESOLUTIONS_RETRIEVED, {
        resolutions: result.data,
      });
    });
  }
}

function getIssueTypes() {
  if (conn) {
    return conn.get("/issuetype").then((result) => {
      let subtaskType;
      result.data.forEach((issueType) => {
        if (issueType.subtask) {
          subtaskType = issueType;
        }
      });
      window.webContents.send(IPC_EVENTS.JIRA.ISSUE_TYPES_RETRIEVED, {
        issueTypes: result.data,
        subtaskType: subtaskType,
      });
    });
  }
}

function updateIssue(event, arg) {
  if (conn) {
    let req;
    if (arg.data.transition) {
      req = conn.post(`/issue/${arg.key}/transitions`, arg.data);
    } else {
      req = conn.put(`/issue/${arg.key}`, arg.data);
    }
    return req.then((result) => {
      return getIssue(event, arg);
    });
  }
}

function checkStoryFields(expandedResult) {
  Object.keys(expandedResult.data.names).forEach((k) => {
    // check story points
    if (expandedResult.data.names[k] === "Story Points") {
      expandedResult.data.fields.storyPoints = expandedResult.data.fields[k];
    }
  });
}

function findAssignableUsers(event, arg) {
  if (conn) {
    let url = `/user/assignable/search?issueKey=${arg.key}`;
    if (arg.search) {
      url += "&username=" + arg.search;
    }
    return conn.get(url).then((result) => {
      let resp = { key: arg.key, result: result.data };
      event.sender.send(IPC_EVENTS.JIRA.ASSIGNABLE_USERS_RETRIEVED, { result: resp });
    });
  }
}

function assignIssue(event, arg) {
  if (conn) {
    return conn
      .put(`/issue/${arg.key}/assignee`, { name: arg.name })
      .then((result) => {
        getIssue(event, arg);
      });
  }
}

function addSubtask(event, arg) {
  if (conn) {
    return conn
      .post(`/issue`, {
        fields: {
          project: {
            id: arg.projectId,
          },
          parent: {
            key: arg.key,
          },
          issuetype: {
            id: arg.subtaskId,
          },
          summary: arg.name,
        },
      })
      .then((result) => {
        getIssue(event, arg);
      });
  }
}

function searchIssues(event, arg) {
  if (conn) {
    let url = `/search`;
    let obj = { jql: arg.jql };
    if (arg.fields) {
      obj.fields = arg.fields;
    }
    return conn.post(url, obj).then((resp) => {
      if (resp === "QUERY_ISSUE") {
        event.sender.send(IPC_EVENTS.JIRA.ISSUE_QUERY_RESULT_RETRIEVED, { issues: [] });
      } else {
        event.sender.send(IPC_EVENTS.JIRA.ISSUE_QUERY_RESULT_RETRIEVED, {
          issues: resp.data.issues,
        });
      }
    });
  }
}

export { init };
