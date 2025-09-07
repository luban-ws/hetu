import { Injectable, Output, EventEmitter } from "@angular/core";
import { ElectronService } from "../../infrastructure/electron.service";
import { LoadingService } from "../../infrastructure/loading-service.service";
import { ToastrService } from "ngx-toastr";
import { CredentialsService } from "./credentials.service";
import { PromptInjectorService } from "../../infrastructure/prompt-injector.service";
import { StatusBarService } from "../../infrastructure/status-bar.service";
import { Router } from "@angular/router";
import { ForcePushPromptComponent } from "../force-push-prompt/force-push-prompt.component";
import { CommitChangeService } from "./commit-change.service";
import { CreateBranchPromptComponent } from "../create-branch-prompt/create-branch-prompt.component";
import { HotkeysService } from "@ngneat/hotkeys";
import { Branch } from "../prototypes/branch";
import { IPC_EVENTS  } from '@common/ipc-events';

@Injectable()
export class RepoService {
  @Output() repoChange = new EventEmitter<string>();
  @Output() wipInfoChange = new EventEmitter();
  @Output() branchChange = new EventEmitter<Branch>();
  @Output() commitsChange = new EventEmitter<any[]>();
  @Output() refChange = new EventEmitter<any>();
  @Output() pulling = new EventEmitter<boolean>();
  @Output() pushing = new EventEmitter<boolean>();
  @Output() posUpdate = new EventEmitter<{ ahead: number; behind: number }>();

  commits: any[] = [];
  repoName = "";
  hasRepository = false;
  currentBranch: Branch | null = null;
  refDict = {};
  refs = [];
  remote = "";
  currentPos: { ahead: number; behind: number } = { ahead: 0, behind: 0 };
  pulloption = "";

  private _wipCommit = {
    sha: "00000",
    author: "",
    email: "",
    parents: [] as string[],
    message: "",
    date: "",
    ci: "",
    virtual: true,
    isStash: false,
    enabled: false,
    fileSummary: {},
  };
  private _currentWorkingPath = "";
  private _pendingOperation: Function | null = null;

  constructor(
    private electron: ElectronService,
    private loading: LoadingService,
    private toastr: ToastrService,
    private status: StatusBarService,
    private promptIj: PromptInjectorService,
    private cred: CredentialsService,
    private route: Router,
    private commitChange: CommitChangeService,
    private hotkeys: HotkeysService
  ) {}

  init(): void {
    this.electron.onCD(IPC_EVENTS.REPO.OPEN_SUCCESSFUL, (event: any, arg: any) => {
      this._currentWorkingPath = arg.workingDir;
      this.repoName = arg.repoName;
      this.repoChange.emit(this.repoName);
      this.hasRepository = true;
      this.loading.disableLoading();
    });
    this.electron.onCD(IPC_EVENTS.REPO.CURRENT_REMOVED, (event: any, arg: any) => {
      this.electron.ipcRenderer.send(IPC_EVENTS.REPO.CLOSE, {});
    });
    this.electron.onCD(IPC_EVENTS.REPO.CLOSED, (event: any, arg: any) => {
      this._currentWorkingPath = "";
      this.repoName = "";
      this.repoChange.emit(this.repoName);
      this.hasRepository = false;
      this.currentBranch = null;
      this.branchChange.emit(this.currentBranch || undefined);
      this.notifyCommitDifference([]);
    });
    this.electron.onCD(
      IPC_EVENTS.REPO.BRANCH_POSITION_RETRIEVED,
      (event: any, arg: any) => {
        this.currentPos = arg;
        this.posUpdate.emit(this.currentPos);
      }
    );
    this.electron.onCD(IPC_EVENTS.REPO.PULLED, (event: any, arg: any) => {
      this.pulling.emit(false);
      if (arg.result === "UP_TO_DATE") {
        this.toastr.info(
          "Your local branch is up-to-date with the remote",
          "Up to date"
        );
      } else {
        this.toastr.success(
          "Successfully updated local branch",
          "Pull Successful"
        );
      }
    });
    this.electron.onCD(IPC_EVENTS.REPO.PUSHED, (event: any, arg: any) => {
      this.pushing.emit(false);
      this.toastr.success("Successfully pushed to remote", "Pushed");
    });
    this.electron.onCD(IPC_EVENTS.REPO.COMMITS_UPDATED, (event: any, arg: any) => {
      this.notifyCommitDifference(arg.newCommits);
    });
    this.electron.onCD(IPC_EVENTS.REPO.FETCHED, (event: any, arg: any) => {});
    this.electron.onCD(IPC_EVENTS.REPO.OPEN_FAILED, (event: any, arg: any) => {
      this.toastr.error("Failed to open repository", "Error");
      this.loading.disableLoading();
    });
    this.electron.onCD(IPC_EVENTS.REPO.BRANCH_CREATE_FAILED, (event: any, arg: any) => {
      this.toastr.error("Failed to create branch, " + arg.detail, "Error");
    });
    this.electron.on(IPC_EVENTS.REPO.FOLDER_SELECTED, (event: any, arg: any) => {
      this._pendingOperation = null;
      this.openRepo(arg.path);
    });
    this.electron.onCD(IPC_EVENTS.REPO.BRANCH_CHANGED, (event: any, arg: any) => {
      this.currentBranch = arg;
      this._wipCommit.parents = [this.currentBranch?.target || ""];
      this.branchChange.emit(arg || undefined);
      this.emitCommitWithWIP();
    });
    this.electron.onCD(IPC_EVENTS.REPO.CREDENTIAL_ISSUE, (event: any, arg: any) => {
      if (this.remote) {
        if (
          this.remote.startsWith("http://") ||
          this.remote.startsWith("https://")
        ) {
          this.cred.promptUserUpdateCredential();
        } else {
          this.cred.promptUserEnterSSHPassword();
        }
      }
    });
    this.electron.onCD(IPC_EVENTS.REPO.FETCH_FAILED, (event: any, arg: any) => {
      if (arg.detail.indexOf("403") !== -1) {
        this.toastr.error(
          "It appears the remote is blocking this operation. You might have attempted to login too many times, please try again later",
          "Forbidden"
        );
      } else {
        this.status.flash("danger", "Fetch failed");
        this._pendingOperation = this.fetch;
      }
    });
    this.electron.onCD(IPC_EVENTS.REPO.PULL_FAILED, (event: any, arg: any) => {
      if (arg.detail === "LOCAL_AHEAD") {
        this.toastr.error(
          "Your local branch is ahead, cannot fast forward",
          "Local Ahead"
        );
      } else if (arg.detail === "UPSTREAM_NOT_FOUND") {
        this.toastr.info(
          "This branch does not have an upstream branch",
          "Upstream Branch Not Found"
        );
      } else {
        this.skipAuthError(arg.detail);
      }
      this.pulling.emit(false);
      this._pendingOperation = this.pull;
    });
    this.electron.onCD(IPC_EVENTS.REPO.PUSH_FAILED, (event: any, arg: any) => {
      if (arg.detail === "FORCE_REQUIRED") {
        let inst = this.promptIj.injectComponent(ForcePushPromptComponent);
        this._pendingOperation = this.push;
        inst.onResult.subscribe((force) => {
          if (force) {
            this.push(true);
            this._pendingOperation = null;
          } else {
            this._pendingOperation = null;
          }
        });
      } else if (arg.detail === "UP_TO_DATE") {
        this.toastr.info(
          "Your local branch is up-to-date with the remote",
          "Up To Date"
        );
      } else if (arg.detail === "REMOTE_UNCHANGED") {
        this.toastr.error(
          "Remote branch was unchanged, the branch might be protected",
          "Push Failed"
        );
      } else {
        this.skipAuthError(arg.detail);
      }
      this.pushing.emit(false);
    });
    this.electron.onCD(IPC_EVENTS.SETTINGS.EFFECTIVE_UPDATED, (event: any, arg: any) => {
      this.pulloption =
        arg && arg["gen-pulloption"] ? arg["gen-pulloption"] : "";
      if (
        arg &&
        arg.currentRepo &&
        this._currentWorkingPath !== arg.currentRepo.workingDir
      ) {
        this.openRepo(arg.currentRepo.workingDir);
      }
    });
    this.electron.onCD(IPC_EVENTS.REPO.REF_RETRIEVED, (event: any, arg: any) => {
      this.refDict = arg.refDict;
      this.refs = arg.references;
      this.refChange.emit({
        refDict: this.refDict,
        references: arg.references,
      });
    });
    this.electron.onCD(IPC_EVENTS.REPO.REMOTES_CHANGED, (event: any, arg: any) => {
      this.remote = arg.remote;
    });
    this.electron.onCD(IPC_EVENTS.AUTO_FETCH.TIMEOUT, (event: any, arg: any) => {
      if (!this._pendingOperation) {
        this.fetch();
      }
    });
    this.electron.onCD(
      IPC_EVENTS.REPO.BLOCKING_OPERATION_BEGAN,
      (event: any, arg: any) => {
        this.loading.enableLoading(arg.operation);
      }
    );
    this.electron.onCD(IPC_EVENTS.REPO.BLOCKING_OPERATION_END, (event: any, arg: any) => {
      this.loading.disableLoading();
    });
    this.electron.onCD(IPC_EVENTS.REPO.BLOCKING_UPDATE, (event: any, arg: any) => {
      this.loading.updateMessage(arg.operation);
    });
    this.electron.onCD(IPC_EVENTS.REPO.FILE_STATUS_RETRIEVED, (event: any, arg: any) => {
      let oldStatus = this._wipCommit.enabled;
      this._wipCommit.fileSummary = arg.summary;
      if (arg.staged.length || arg.unstaged.length) {
        this._wipCommit.enabled = true;
      } else {
        this._wipCommit.enabled = false;
      }
      if (oldStatus !== this._wipCommit.enabled) {
        this.emitCommitWithWIP();
      }
      this.wipInfoChange.emit();
    });
    this.electron.onCD(IPC_EVENTS.REPO.TAG_CREATED, (event: any, arg: any) => {
      this.toastr
        .success(
          `Tag ${arg.name} created successfully. Click here to publish it to remote`,
          "Tag Created"
        )
        .onTap.subscribe(() => {
          this.pushTag(arg.name);
        });
    });
    this.electron.onCD(IPC_EVENTS.REPO.TAG_DELETED, (event: any, arg: any) => {
      this.toastr.success(
        `Tag ${arg.name} deleted successfully.`,
        "Tag Deleted"
      );
      this.pushTag(arg.name, true);
    });
    this.electron.onCD(IPC_EVENTS.REPO.INIT_PATH_SELECTED, (event: any, arg: any) => {
      this.electron.ipcRenderer.send(IPC_EVENTS.REPO.INIT, { path: arg.path });
    });
    this.electron.onCD(IPC_EVENTS.REPO.INIT_SUCCESSFUL, (event: any, arg: any) => {
      this.openRepo(arg.path);
    });
    this.electron.onCD(IPC_EVENTS.REPO.INIT_FAILED, (event: any, arg: any) => {
      this.toastr.error(
        "Failed to initialize repository",
        "Initialization Error"
      );
    });
    this.cred.credentialChange.subscribe((newCreds) => {
      this.retry();
    });
    this.commitChange.messageChange.subscribe((msg) => {
      this._wipCommit.message = msg;
    });
    this.hotkeys.addShortcut({
      keys: "meta.shift.arrowup",
      description: "Push",
      callback: (event: KeyboardEvent) => {
        if (!this.loading.isBusy) {
          this.push();
        }
        event.preventDefault();
      },
    });
    this.hotkeys.addShortcut({
      keys: "meta.shift.arrowdown",
      description: "Pull",
      callback: (event: KeyboardEvent) => {
        if (!this.loading.isBusy) {
          this.pull();
        }
        event.preventDefault();
      },
    });
  }

  getCommitsWithWIP() {
    if (this._wipCommit.enabled) {
      return [this._wipCommit].concat(this.commits);
    } else {
      return this.commits;
    }
  }

  private emitCommitWithWIP() {
    this.commitsChange.emit(this.getCommitsWithWIP());
  }

  private skipAuthError(detail: any) {
    if (detail !== "CRED_ISSUE") {
      this.toastr.error(detail, "Error");
    }
  }

  notifyCommitDifference(newCommits: any) {
    let different = false;
    if (this.commits.length !== newCommits.length) {
      different = true;
    } else {
      for (let i = 0; i < this.commits.length; i++) {
        if (this.commits[i].sha !== newCommits[i].sha) {
          different = true;
          break;
        }
      }
    }
    if (different) {
      this.commits = newCommits;
      this.emitCommitWithWIP();
    }
  }

  openRepo(workingDir: any): void {
    if (this.electron.available) {
      this.loading.enableLoading("Opening Repo...");
      this.electron.ipcRenderer.send(IPC_EVENTS.REPO.OPEN, { workingDir: workingDir });
    }
  }

  openBrowse(): void {
    this.electron.ipcRenderer.send(IPC_EVENTS.REPO.BROWSE, {});
  }

  fetch(): void {
    this.electron.ipcRenderer.send(IPC_EVENTS.REPO.FETCH, {
      username: this.cred.username,
      password: this.cred.password,
    });
  }

  pull(): void {
    this.pulling.emit(true);
    this.electron.ipcRenderer.send(IPC_EVENTS.REPO.PULL, {
      username: this.cred.username,
      password: this.cred.password,
      option: this.pulloption,
    });
  }

  push(force = false): void {
    this.pushing.emit(true);
    this.electron.ipcRenderer.send(IPC_EVENTS.REPO.PUSH, {
      username: this.cred.username,
      password: this.cred.password,
      force: force,
    });
  }

  createBranch(): void {
    let prompt = this.promptIj.injectComponent(CreateBranchPromptComponent);
    prompt.onEnter.subscribe((name) => {
      this.electron.ipcRenderer.send(IPC_EVENTS.REPO.CREATE_BRANCH, {
        name: name,
        commit: this.currentBranch?.target || "",
      });
    });
  }

  checkout(shorthand: any): void {
    this.electron.ipcRenderer.send(IPC_EVENTS.REPO.CHECKOUT, { branch: shorthand });
  }
  pushTag(name: any, toDelete = false): void {
    this.electron.ipcRenderer.send(IPC_EVENTS.REPO.PUSH_TAG, {
      username: this.cred.username,
      password: this.cred.password,
      name: name,
      delete: toDelete,
    });
  }
  retry(): void {
    if (this._pendingOperation) {
      this._pendingOperation();
      this._pendingOperation = null;
    }
  }
  removeRepoSetting(workingDir: any) {
    this.electron.ipcRenderer.send(IPC_EVENTS.REPO.REMOVE_HISTORY, {
      workingDir: workingDir,
    });
  }

  browseInitFolder(): void {
    this.electron.ipcRenderer.send(IPC_EVENTS.REPO.INIT_BROWSE, {});
  }
}
