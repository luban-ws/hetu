import { ipcMain, dialog } from "electron";
import helper from "./repo-helpers.js";
import { requireArgParams } from "../infrastructure/handler-helper.js";
import { IPC_EVENTS  } from '@common/ipc-events';
let repoService = null;
let settings = null;
let secure = null;

function init(repo, sett, sec) {
  repoService = repo;
  settings = sett;
  secure = sec;

  // 注册 IPC 事件监听器
  ipcMain.on(IPC_EVENTS.REPO.OPEN, requireArgParams(openRepo, ["workingDir"]));
  ipcMain.on(IPC_EVENTS.REPO.INIT, requireArgParams(initRepo, ["path"]));
  ipcMain.on(IPC_EVENTS.REPO.BROWSE, openBrowseFolderDialog);
  ipcMain.on(IPC_EVENTS.REPO.INIT_BROWSE, openInitBrowseDialog);
  ipcMain.on(
    IPC_EVENTS.REPO.FETCH,
    requireArgParams(fetchRepo, ["username", "password"])
  );
  ipcMain.on(
    IPC_EVENTS.REPO.SET_CRED,
    requireArgParams(setCredentials, ["username", "password"])
  );
  ipcMain.on(
    IPC_EVENTS.REPO.PULL,
    requireArgParams(pull, ["username", "password", "option"])
  );
  ipcMain.on(IPC_EVENTS.REPO.PUSH, requireArgParams(push, ["username", "password"]));
  ipcMain.on(IPC_EVENTS.REPO.GET_COMMIT, requireArgParams(getCommit, ["commit"]));
  ipcMain.on(IPC_EVENTS.REPO.STAGE, requireArgParams(stage, ["paths"]));
  ipcMain.on(IPC_EVENTS.REPO.UNSTAGE, requireArgParams(unstage, ["paths"]));
  ipcMain.on(
    IPC_EVENTS.REPO.STAGE_LINES,
    requireArgParams(stageLines, ["path", "lines"])
  );
  ipcMain.on(
    IPC_EVENTS.REPO.UNSTAGE_LINES,
    requireArgParams(unstageLines, ["path", "lines"])
  );
  ipcMain.on(
    IPC_EVENTS.REPO.COMMIT_STAGED,
    requireArgParams(commitStaged, ["name", "email", "message"])
  );
  ipcMain.on(
    IPC_EVENTS.REPO.COMMIT,
    requireArgParams(commit, ["name", "email", "message", "files"])
  );
  ipcMain.on(
    IPC_EVENTS.REPO.STASH,
    requireArgParams(stash, ["name", "email", "message"])
  );
  ipcMain.on(IPC_EVENTS.REPO.POP, pop);
  ipcMain.on(IPC_EVENTS.REPO.APPLY, apply);
  ipcMain.on(
    IPC_EVENTS.REPO.CREATE_BRANCH,
    requireArgParams(createBranch, ["name", "commit"])
  );
  ipcMain.on(IPC_EVENTS.REPO.CHECKOUT, requireArgParams(checkout, ["branch"]));
  ipcMain.on(IPC_EVENTS.REPO.DISCARD_ALL, discardAll);
  ipcMain.on(IPC_EVENTS.REPO.RESET_HARD, requireArgParams(resetHard, ["commit"]));
  ipcMain.on(IPC_EVENTS.REPO.RESET_SOFT, requireArgParams(resetSoft, ["commit"]));
  ipcMain.on(IPC_EVENTS.REPO.DELETE_STASH, requireArgParams(deleteStash, ["index"]));
  ipcMain.on(
    IPC_EVENTS.REPO.CREATE_TAG,
    requireArgParams(createTag, ["targetCommit", "name"])
  );
  ipcMain.on(IPC_EVENTS.REPO.DELETE_TAG, requireArgParams(deleteTag, ["name"]));
  ipcMain.on(IPC_EVENTS.REPO.DELETE_BRANCH, requireArgParams(deleteBranch, ["name"]));
  ipcMain.on(
    IPC_EVENTS.REPO.PUSH_TAG,
    requireArgParams(pushTag, ["username", "password", "name"])
  );
  ipcMain.on(IPC_EVENTS.REPO.CLOSE, closeRepo);
}

function closeRepo(event, arg) {
  repoService.closeRepo();
}

function pull(event, arg) {
  repoService
    .pullWrapper(arg.username, arg.password, arg.option)
    .then((result) => {
      event.sender.send(IPC_EVENTS.REPO.PULLED, { result: result });
    })
    .catch((res) => {
      operationFailed(IPC_EVENTS.REPO.PULL_FAILED, event, res);
    });
}

function push(event, arg) {
  repoService
    .push(arg.username, arg.password, arg.force)
    .then((result) => {
      event.sender.send(IPC_EVENTS.REPO.PUSHED, { result: result });
    })
    .catch((res) => {
      operationFailed(IPC_EVENTS.REPO.PUSH_FAILED, event, res, res);
    });
}

function getCommit(event, arg) {
  repoService
    .getCommitDetails(arg.commit)
    .then((result) => {
      event.sender.send(IPC_EVENTS.REPO.COMMIT_DETAIL_RETRIEVED, { commit: result });
    })
    .catch((res) => {
      operationFailed(IPC_EVENTS.REPO.FAILED_GET_COMMIT_DETAIL, event, res);
    });
}

function openRepo(event, arg) {
  repoService
    .openRepo(arg.workingDir)
    .then(() => {
      getStoredCredentials(event);
    })
    .catch(function (err) {
      event.sender.send(IPC_EVENTS.REPO.OPEN_FAILED, {
        error: "OPEN_ERROR",
        detail_message: err,
      });
    });
}

function initRepo(event, arg) {
  repoService
    .initRepo(arg.path)
    .then(() => {
      event.sender.send(IPC_EVENTS.REPO.INIT_SUCCESSFUL, { path: arg.path });
    })
    .catch((err) => {
      event.sender.send(IPC_EVENTS.REPO.INIT_FAILED, { detail_message: err });
    });
}

function setCredentials(event, arg) {
  settings.updateRepoSetting("auth-username", arg.username);
  repoService.getCurrentFirstRemote().then((remote) => {
    let url = remote.url();
    if (!helper.isSSH(url)) {
      secure.setPass(`${arg.username}@${url}`, arg.password);
    } else {
      secure.setPass(`${url}`, arg.password);
    }
  });
}

function getStoredCredentials(event) {
  if (secure) {
    repoService.getCurrentFirstRemote().then((remote) => {
      let url = remote.url();
      if (!helper.isSSH(url)) {
        let storedUsername = settings.get("auth-username");
        if (storedUsername) {
          event.sender.send(IPC_EVENTS.REPO.USERNAME_RETRIEVED, {
            username: storedUsername,
          });
          secure.getPass(`${storedUsername}@${url}`).then((pass) => {
            event.sender.send(IPC_EVENTS.REPO.PASSWORD_RETRIEVED, { password: pass });
          });
        }
      } else {
        secure.getPass(`${url}`).then((pass) => {
          event.sender.send(IPC_EVENTS.REPO.PASSWORD_RETRIEVED, { password: pass });
        });
      }
    });
  }
}

function fetchRepo(event, arg) {
  repoService.fetchRepo(arg.username, arg.password).catch((res) => {
    operationFailed(IPC_EVENTS.REPO.FETCH_FAILED, event, res);
  });
}

async function openBrowseFolderDialog(event, arg) {
  try {
    const result = await dialog.showOpenDialog({ 
      properties: ["openDirectory"],
      title: 'Select Repository Directory'
    });
    
    if (!result.canceled && result.filePaths && result.filePaths.length > 0) {
      event.sender.send(IPC_EVENTS.REPO.FOLDER_SELECTED, { path: result.filePaths[0] });
    }
  } catch (error) {
    console.error('Error opening browse dialog:', error);
  }
}

async function openInitBrowseDialog(event, arg) {
  try {
    const result = await dialog.showOpenDialog({ 
      properties: ["openDirectory"],
      title: 'Select Directory to Initialize Repository'
    });
    
    if (!result.canceled && result.filePaths && result.filePaths.length > 0) {
      event.sender.send(IPC_EVENTS.REPO.INIT_PATH_SELECTED, { path: result.filePaths[0] });
    }
  } catch (error) {
    console.error('Error opening init browse dialog:', error);
  }
}

function operationFailed(op, event, res, payload) {
  if (res.message) {
    res = res.message;
  }
  let obj = { error: "OP_FAIL", detail: res };
  if (payload) {
    obj.payload = payload;
  }
  event.sender.send(op, obj);
}

function stage(event, arg) {
  repoService
    .stage(arg.paths)
    .then((res) => {})
    .catch((err) => {
      operationFailed(IPC_EVENTS.REPO.STAGE_FAIL, event, err);
    });
}

function stageLines(event, arg) {
  repoService
    .stageLines(arg.path, arg.lines)
    .then((res) => {})
    .catch((err) => {
      operationFailed(IPC_EVENTS.REPO.STAGE_FAIL, event, err);
    });
}

function unstageLines(event, arg) {
  repoService
    .unstageLines(arg.path, arg.lines)
    .then((res) => {})
    .catch((err) => {
      operationFailed(IPC_EVENTS.REPO.UNSTAGE_FAIL, event, err);
    });
}

function unstage(event, arg) {
  repoService
    .unstage(arg.paths)
    .then((res) => {})
    .catch((err) => {
      operationFailed(IPC_EVENTS.REPO.UNSTAGE_FAIL, event, err);
    });
}

function commitStaged(event, arg) {
  repoService
    .commitStaged(arg.name, arg.email, arg.message)
    .then((res) => {
      event.sender.send(IPC_EVENTS.REPO.COMMITTED, { sha: res });
    })
    .catch((err) => {
      operationFailed(IPC_EVENTS.REPO.COMMIT_FAIL, event, err);
    });
}

function commit(event, arg) {
  repoService
    .commit(arg.name, arg.email, arg.message, arg.files)
    .then((res) => {
      event.sender.send(IPC_EVENTS.REPO.COMMITTED, { sha: res });
    })
    .catch((err) => {
      operationFailed(IPC_EVENTS.REPO.COMMIT_FAIL, event, err);
    });
}

function stash(event, arg) {
  repoService
    .stash(arg.name, arg.email, arg.message)
    .then((res) => {
      event.sender.send(IPC_EVENTS.REPO.STASHED, {});
    })
    .catch((err) => {
      operationFailed(IPC_EVENTS.REPO.STASH_FAILED, event, err);
    });
}

function pop(event, arg) {
  repoService
    .pop(arg.index)
    .then((res) => {
      event.sender.send(IPC_EVENTS.REPO.POPPED, {});
    })
    .catch((err) => {
      if (err.errno === -3) {
        operationFailed(IPC_EVENTS.REPO.POP_FAILED, event, "NO_STASH");
      } else {
        operationFailed(IPC_EVENTS.REPO.POP_FAILED, event, err);
      }
    });
}
function apply(event, arg) {
  repoService
    .apply(arg.index)
    .then((res) => {
      event.sender.send(IPC_EVENTS.REPO.APPLIED, {});
    })
    .catch((err) => {
      operationFailed(IPC_EVENTS.REPO.APPLY_FAILED, event, err);
    });
}

function createBranch(event, arg) {
  repoService
    .createBranch(arg.name, arg.commit, arg.force)
    .then((res) => {
      event.sender.send(IPC_EVENTS.REPO.BRANCH_CREATED, {});
    })
    .catch((err) => {
      operationFailed(IPC_EVENTS.REPO.BRANCH_CREATE_FAILED, event, err);
    });
}

function checkout(event, arg) {
  repoService
    .checkout(arg.branch)
    .then((res) => {
      event.sender.send(IPC_EVENTS.REPO.CHECKEDOUT, {});
    })
    .catch((err) => {
      operationFailed(IPC_EVENTS.REPO.CHECKOUT_FAILED, event, err);
    });
}

function discardAll(event, arg) {
  repoService
    .discardAll()
    .then((res) => {
      event.sender.send(IPC_EVENTS.REPO.DISCARDED, {});
    })
    .catch((err) => {
      operationFailed(IPC_EVENTS.REPO.DISCARD_FAILED, event, err);
    });
}

function resetHard(event, arg) {
  repoService
    .resetHard(arg.commit)
    .then((res) => {
      event.sender.send(IPC_EVENTS.REPO.RESETTED, {});
    })
    .catch((err) => {
      operationFailed(IPC_EVENTS.REPO.RESET_FAILED, event, err);
    });
}

function resetSoft(event, arg) {
  repoService
    .resetSoft(arg.commit)
    .then((res) => {
      event.sender.send(IPC_EVENTS.REPO.RESETTED, {});
    })
    .catch((err) => {
      operationFailed(IPC_EVENTS.REPO.RESET_FAILED, event, err);
    });
}

function deleteStash(event, arg) {
  repoService
    .deleteStash(arg.index)
    .then((res) => {
      event.sender.send(IPC_EVENTS.REPO.STASH_DELETED, {});
    })
    .catch((err) => {
      operationFailed(IPC_EVENTS.REPO.DELETE_STASH_FAILED, event, err);
    });
}

function createTag(event, arg) {
  repoService
    .createTag(arg.targetCommit, arg.name)
    .then((res) => {
      event.sender.send(IPC_EVENTS.REPO.TAG_CREATED, { name: arg.name });
    })
    .catch((err) => {
      operationFailed(IPC_EVENTS.REPO.CREATE_TAG_FAILED, event, err);
    });
}

function deleteTag(event, arg) {
  repoService
    .deleteTag(arg.name)
    .then((res) => {
      event.sender.send(IPC_EVENTS.REPO.TAG_DELETED, { name: arg.name });
    })
    .catch((err) => {
      operationFailed(IPC_EVENTS.REPO.DELETE_TAG_FAILED, event, err);
    });
}

function deleteBranch(event, arg) {
  repoService
    .deleteBranch(arg.name, arg.username, arg.password)
    .then((res) => {
      event.sender.send(IPC_EVENTS.REPO.BRANCH_DELETED, {
        name: arg.name,
        upstream: res.upstream,
      });
    })
    .catch((err) => {
      operationFailed(IPC_EVENTS.REPO.BRANCH_DELETE_FAILED, event, err);
    });
}

function pushTag(event, arg) {
  repoService
    .pushTag(arg.username, arg.password, arg.name, arg.delete)
    .then((res) => {
      event.sender.send(IPC_EVENTS.REPO.TAG_PUSHED, { name: arg.name });
    })
    .catch((err) => {
      operationFailed(IPC_EVENTS.REPO.PUSH_TAG_FAILED, event, err);
    });
}

export { init };
