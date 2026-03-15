import { Inject, Injectable, Output, EventEmitter, NgZone, OnDestroy } from "@angular/core";
import { LoadingService } from "../../infrastructure/loading-service.service";
import { ToastrService } from "ngx-toastr";
import { CredentialsService } from "./credentials.service";
import { PromptInjectorService } from "../../infrastructure/prompt-injector.service";
import { StatusBarService } from "../../infrastructure/status-bar.service";
import { Router } from "@angular/router";
import { ForcePushPromptComponent } from "../force-push-prompt/force-push-prompt.component";
import { CommitChangeService } from "./commit-change.service";
import { CreateBranchPromptComponent } from "../create-branch-prompt/create-branch-prompt.component";
import { GitInitPromptComponent } from "../git-init-prompt/git-init-prompt.component";
import { HotkeysService } from "@ngneat/hotkeys";
import { Branch } from "../prototypes/branch";
import { DESKTOP_ADAPTER, DesktopAdapter } from "../../infrastructure/desktop-adapter";

/** IPC channel constants for repo-related events */
const CH_REPO_OPEN_SUCCESSFUL   = 'Repo-OpenSuccessful';
const CH_REPO_CURRENT_REMOVED   = 'Repo-CurrentRemoved';
const CH_REPO_CLOSED            = 'Repo-Closed';
const CH_REPO_BRANCH_POS        = 'Repo-BranchPositionRetrieved';
const CH_REPO_PULLED            = 'Repo-Pulled';
const CH_REPO_PUSHED            = 'Repo-Pushed';
const CH_REPO_COMMITS_UPDATED   = 'Repo-CommitsUpdated';
const CH_REPO_FETCHED           = 'Repo-Fetched';
const CH_REPO_OPEN_FAILED       = 'Repo-OpenFailed';
const CH_REPO_BRANCH_CREATE_FAIL = 'Repo-BranchCreateFailed';
const CH_REPO_FOLDER_SELECTED   = 'Repo-FolderSelected';
const CH_REPO_BRANCH_CHANGED    = 'Repo-BranchChanged';
const CH_REPO_CREDENTIAL_ISSUE  = 'Repo-CredentialIssue';
const CH_REPO_FETCH_FAILED      = 'Repo-FetchFailed';
const CH_REPO_PULL_FAILED       = 'Repo-PullFailed';
const CH_REPO_PUSH_FAILED       = 'Repo-PushFailed';
const CH_REPO_REF_RETRIEVED     = 'Repo-RefRetrieved';
const CH_REPO_REMOTES_CHANGED   = 'Repo-RemotesChanged';
const CH_REPO_BLOCKING_BEGAN    = 'Repo-BlockingOperationBegan';
const CH_REPO_BLOCKING_END      = 'Repo-BlockingOperationEnd';
const CH_REPO_BLOCKING_UPDATE   = 'Repo-BlockingUpdate';
const CH_REPO_FILE_STATUS       = 'Repo-FileStatusRetrieved';
const CH_REPO_TAG_CREATED       = 'Repo-TagCreated';
const CH_REPO_TAG_DELETED       = 'Repo-TagDeleted';
const CH_REPO_INIT_PATH_SELECTED = 'Repo-InitPathSelected';
const CH_REPO_INIT_SUCCESSFUL   = 'Repo-InitSuccessful';
const CH_REPO_INIT_FAILED       = 'Repo-InitFailed';
const CH_SETTINGS_EFFECTIVE     = 'Settings-EffectiveUpdated';
const CH_AUTO_FETCH_TIMEOUT     = 'AutoFetch-Timeout';

/** IPC channel constants for repo commands */
const CMD_REPO_OPEN           = 'Repo-Open';
const CMD_REPO_BROWSE         = 'Repo-Browse';
const CMD_REPO_CLOSE          = 'Repo-Close';
const CMD_REPO_FETCH          = 'Repo-Fetch';
const CMD_REPO_PULL           = 'Repo-Pull';
const CMD_REPO_PUSH           = 'Repo-Push';
const CMD_REPO_CREATE_BRANCH  = 'Repo-CreateBranch';
const CMD_REPO_CHECKOUT       = 'Repo-Checkout';
const CMD_REPO_REMOVE_HISTORY = 'Repo-RemoveHistory';
const CMD_REPO_INIT_BROWSE    = 'Repo-InitBrowse';
const CMD_REPO_INIT           = 'Repo-Init';

/**
 * Central service for repository lifecycle, git operations,
 * and IPC event wiring via DesktopAdapter.
 */
@Injectable()
export class RepoService implements OnDestroy {
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
  private unsubscribers: Array<() => void> = [];

  constructor(
    @Inject(DESKTOP_ADAPTER) private adapter: DesktopAdapter,
    private loading: LoadingService,
    private toastr: ToastrService,
    private status: StatusBarService,
    private promptIj: PromptInjectorService,
    private cred: CredentialsService,
    private route: Router,
    private commitChange: CommitChangeService,
    private hotkeys: HotkeysService,
    private ngZone: NgZone
  ) {}

  ngOnDestroy(): void {
    this.unsubscribers.forEach(unsubscribe => unsubscribe());
    this.unsubscribers = [];
  }

  /** Initialise IPC listeners, credential handling and hotkeys. */
  init(): void {
    if (!this.adapter.available) {
      console.error("DesktopAdapter not available");
      return;
    }

    this.setupEventHandlers();
    this.setupCredentialHandling();
    this.setupHotkeys();
  }

  private setupEventHandlers(): void {
    // Repository lifecycle events
    this.unsubscribers.push(
      this.adapter.on(CH_REPO_OPEN_SUCCESSFUL, (event: any, arg: any) => {
        this.ngZone.run(() => {
          this._currentWorkingPath = arg.workingDir;
          this.repoName = arg.repoName;
          this.repoChange.emit(this.repoName);
          this.hasRepository = true;
          this.loading.disableLoading();
        });
      })
    );

    this.unsubscribers.push(
      this.adapter.on(CH_REPO_CURRENT_REMOVED, (_event: any, _arg: any) => {
        this.ngZone.run(() => {
          this.adapter.send(CMD_REPO_CLOSE);
        });
      })
    );

    this.unsubscribers.push(
      this.adapter.on(CH_REPO_CLOSED, (_event: any, _arg: any) => {
        this.ngZone.run(() => {
          this._currentWorkingPath = "";
          this.repoName = "";
          this.repoChange.emit(this.repoName);
          this.hasRepository = false;
          this.currentBranch = null;
          this.branchChange.emit(this.currentBranch || undefined);
          this.notifyCommitDifference([]);
        });
      })
    );

    this.unsubscribers.push(
      this.adapter.on(CH_REPO_BRANCH_POS, (_event: any, arg: any) => {
        this.ngZone.run(() => {
          this.currentPos = arg;
          this.posUpdate.emit(this.currentPos);
        });
      })
    );

    // Git operation result events
    this.unsubscribers.push(
      this.adapter.on(CH_REPO_PULLED, (_event: any, arg: any) => {
        this.ngZone.run(() => {
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
      })
    );

    this.unsubscribers.push(
      this.adapter.on(CH_REPO_PUSHED, (_event: any, _arg: any) => {
        this.ngZone.run(() => {
          this.pushing.emit(false);
          this.toastr.success("Successfully pushed to remote", "Pushed");
        });
      })
    );

    this.unsubscribers.push(
      this.adapter.on(CH_REPO_COMMITS_UPDATED, (_event: any, arg: any) => {
        this.ngZone.run(() => {
          if (arg && arg.commits) {
            this.notifyCommitDifference(arg.commits);
          }
        });
      })
    );

    this.unsubscribers.push(
      this.adapter.on(CH_REPO_FETCHED, (_event: any, _arg: any) => {
        this.ngZone.run(() => {
          // Handle fetch success if needed
        });
      })
    );

    // Error handling events
    this.unsubscribers.push(
      this.adapter.on(CH_REPO_OPEN_FAILED, (_event: any, arg: any) => {
        this.ngZone.run(() => {
          this.loading.disableLoading();

          if (arg.error === 'NOT_GIT_REPOSITORY' && arg.canInitialize && arg.workingDir) {
            const gitInitPrompt = this.promptIj.injectComponent(GitInitPromptComponent);
            gitInitPrompt.configure(arg.detail_message, arg.workingDir);

            gitInitPrompt.onResult.subscribe((shouldInitialize: boolean) => {
              if (shouldInitialize) {
                this.loading.enableLoading("Initializing git repository...");
                this.adapter.send(CMD_REPO_INIT, { path: arg.workingDir });
              }
            });
          } else {
            const message = arg.detail_message || "Failed to open repository";
            this.toastr.error(message, "Error");
          }
        });
      })
    );

    this.unsubscribers.push(
      this.adapter.on(CH_REPO_BRANCH_CREATE_FAIL, (_event: any, arg: any) => {
        this.ngZone.run(() => {
          const detail = arg?.detail || "unknown error";
          this.toastr.error("Failed to create branch, " + detail, "Error");
        });
      })
    );

    // Browse and folder selection events
    this.unsubscribers.push(
      this.adapter.on(CH_REPO_FOLDER_SELECTED, (_event: any, arg: any) => {
        this.ngZone.run(() => {
          this._pendingOperation = null;
          if (arg?.path) {
            this.openRepo(arg.path);
          }
        });
      })
    );

    // Branch and state change events
    this.unsubscribers.push(
      this.adapter.on(CH_REPO_BRANCH_CHANGED, (_event: any, arg: any) => {
        this.ngZone.run(() => {
          this.currentBranch = arg;
          this._wipCommit.parents = [this.currentBranch?.target || ""];
          this.branchChange.emit(arg || undefined);
          this.emitCommitWithWIP();
        });
      })
    );

    // Credential handling
    this.unsubscribers.push(
      this.adapter.on(CH_REPO_CREDENTIAL_ISSUE, (_event: any, _arg: any) => {
        this.ngZone.run(() => {
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
      })
    );

    // Fetch failure handling
    this.unsubscribers.push(
      this.adapter.on(CH_REPO_FETCH_FAILED, (_event: any, arg: any) => {
        this.ngZone.run(() => {
          const detail = arg?.detail || "";
          if (detail.indexOf("403") !== -1) {
            this.toastr.error(
              "It appears the remote is blocking this operation. You might have attempted to login too many times, please try again later",
              "Forbidden"
            );
          } else {
            this.status.flash("danger", "Fetch failed");
            this._pendingOperation = this.fetch;
          }
        });
      })
    );

    // Pull failure handling
    this.unsubscribers.push(
      this.adapter.on(CH_REPO_PULL_FAILED, (_event: any, arg: any) => {
        this.ngZone.run(() => {
          const detail = arg?.detail || "";
          if (detail === "LOCAL_AHEAD") {
            this.toastr.error(
              "Your local branch is ahead, cannot fast forward",
              "Local Ahead"
            );
          } else if (detail === "UPSTREAM_NOT_FOUND") {
            this.toastr.info(
              "This branch does not have an upstream branch",
              "Upstream Branch Not Found"
            );
          } else {
            this.skipAuthError(detail);
          }
          this.pulling.emit(false);
          this._pendingOperation = this.pull;
        });
      })
    );

    // Push failure handling
    this.unsubscribers.push(
      this.adapter.on(CH_REPO_PUSH_FAILED, (_event: any, arg: any) => {
        this.ngZone.run(() => {
          const detail = arg?.detail || "";
          if (detail === "FORCE_REQUIRED") {
            const inst = this.promptIj.injectComponent(ForcePushPromptComponent);
            this._pendingOperation = this.push;
            inst.onResult.subscribe((force: boolean) => {
              if (force) {
                this.push(true);
                this._pendingOperation = null;
              } else {
                this._pendingOperation = null;
              }
            });
          } else if (detail === "UP_TO_DATE") {
            this.toastr.info(
              "Your local branch is up-to-date with the remote",
              "Up To Date"
            );
          } else if (detail === "REMOTE_UNCHANGED") {
            this.toastr.error(
              "Remote branch was unchanged, the branch might be protected",
              "Push Failed"
            );
          } else {
            this.skipAuthError(detail);
          }
          this.pushing.emit(false);
        });
      })
    );

    // Settings and state events
    this.unsubscribers.push(
      this.adapter.on(CH_SETTINGS_EFFECTIVE, (_event: any, arg: any) => {
        this.ngZone.run(() => {
          this.pulloption = arg && arg["gen-pulloption"] ? arg["gen-pulloption"] : "";
          if (
            arg &&
            arg.currentRepo &&
            this._currentWorkingPath !== arg.currentRepo.workingDir
          ) {
            this.openRepo(arg.currentRepo.workingDir);
          }
        });
      })
    );

    this.unsubscribers.push(
      this.adapter.on(CH_REPO_REF_RETRIEVED, (_event: any, arg: any) => {
        this.ngZone.run(() => {
          this.refDict = arg.refDict;
          this.refs = arg.references;
          this.refChange.emit({
            refDict: this.refDict,
            references: arg.references,
          });
        });
      })
    );

    this.unsubscribers.push(
      this.adapter.on(CH_REPO_REMOTES_CHANGED, (_event: any, arg: any) => {
        this.ngZone.run(() => {
          this.remote = arg.remote;
        });
      })
    );

    // Auto-fetch timeout
    this.unsubscribers.push(
      this.adapter.on(CH_AUTO_FETCH_TIMEOUT, (_event: any, _arg: any) => {
        this.ngZone.run(() => {
          if (!this._pendingOperation) {
            this.fetch();
          }
        });
      })
    );

    // Loading state events
    this.unsubscribers.push(
      this.adapter.on(CH_REPO_BLOCKING_BEGAN, (_event: any, arg: any) => {
        this.ngZone.run(() => {
          this.loading.enableLoading(arg.operation);
        });
      })
    );

    this.unsubscribers.push(
      this.adapter.on(CH_REPO_BLOCKING_END, (_event: any, _arg: any) => {
        this.ngZone.run(() => {
          this.loading.disableLoading();
        });
      })
    );

    this.unsubscribers.push(
      this.adapter.on(CH_REPO_BLOCKING_UPDATE, (_event: any, arg: any) => {
        this.ngZone.run(() => {
          this.loading.updateMessage(arg.operation);
        });
      })
    );

    // File status events
    this.unsubscribers.push(
      this.adapter.on(CH_REPO_FILE_STATUS, (_event: any, arg: any) => {
        this.ngZone.run(() => {
          const oldStatus = this._wipCommit.enabled;
          this._wipCommit.fileSummary = arg?.summary || {};
          const staged = arg?.staged || [];
          const unstaged = arg?.unstaged || [];
          if (staged.length || unstaged.length) {
            this._wipCommit.enabled = true;
          } else {
            this._wipCommit.enabled = false;
          }
          if (oldStatus !== this._wipCommit.enabled) {
            this.emitCommitWithWIP();
          }
          this.wipInfoChange.emit();
        });
      })
    );

    // Tag events
    this.unsubscribers.push(
      this.adapter.on(CH_REPO_TAG_CREATED, (_event: any, arg: any) => {
        this.ngZone.run(() => {
          this.toastr
            .success(
              `Tag ${arg.name} created successfully. Click here to publish it to remote`,
              "Tag Created"
            )
            .onTap.subscribe(() => {
              this.pushTag(arg.name);
            });
        });
      })
    );

    this.unsubscribers.push(
      this.adapter.on(CH_REPO_TAG_DELETED, (_event: any, arg: any) => {
        this.ngZone.run(() => {
          this.toastr.success(
            `Tag ${arg.name} deleted successfully.`,
            "Tag Deleted"
          );
          this.pushTag(arg.name, true);
        });
      })
    );

    // Init events
    this.unsubscribers.push(
      this.adapter.on(CH_REPO_INIT_PATH_SELECTED, (_event: any, arg: any) => {
        this.ngZone.run(() => {
          if (arg?.path) {
            this.adapter.send(CMD_REPO_INIT, { path: arg.path });
          }
        });
      })
    );

    this.unsubscribers.push(
      this.adapter.on(CH_REPO_INIT_SUCCESSFUL, (_event: any, arg: any) => {
        this.ngZone.run(() => {
          if (arg?.path) {
            this.openRepo(arg.path);
          }
        });
      })
    );

    this.unsubscribers.push(
      this.adapter.on(CH_REPO_INIT_FAILED, (_event: any, _arg: any) => {
        this.ngZone.run(() => {
          this.toastr.error(
            "Failed to initialize repository",
            "Initialization Error"
          );
        });
      })
    );
  }

  private setupCredentialHandling(): void {
    this.cred.credentialChange.subscribe(() => {
      this.retry();
    });

    this.commitChange.messageChange.subscribe((msg: string) => {
      this._wipCommit.message = msg;
    });
  }

  private setupHotkeys(): void {
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

  /** @returns commits list prepended with WIP commit when active */
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

  /** Emit commit change only when the sha list actually differs. */
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

  /** Open a repository at the given working directory. */
  openRepo(workingDir: any): void {
    if (this.adapter.available) {
      this.loading.enableLoading("Opening Repo...");
      this.adapter.send(CMD_REPO_OPEN, { workingDir });
    }
  }

  /** Open native folder-browse dialog for repository selection. */
  openBrowse(): void {
    if (this.adapter.available) {
      this.adapter.send(CMD_REPO_BROWSE);
    }
  }

  /** Fetch from remote with current credentials. */
  fetch(): void {
    if (this.adapter.available) {
      this.adapter.send(CMD_REPO_FETCH, {
        username: this.cred.username,
        password: this.cred.password,
      });
    }
  }

  /** Pull from remote with current credentials and pull option. */
  pull(): void {
    this.pulling.emit(true);
    if (this.adapter.available) {
      this.adapter.send(CMD_REPO_PULL, {
        username: this.cred.username,
        password: this.cred.password,
        option: this.pulloption,
      });
    }
  }

  /** Push to remote, optionally forcing. */
  push(force = false): void {
    this.pushing.emit(true);
    if (this.adapter.available) {
      this.adapter.send(CMD_REPO_PUSH, {
        username: this.cred.username,
        password: this.cred.password,
        force,
      });
    }
  }

  /** Prompt user for a branch name and create it at the current HEAD. */
  createBranch(): void {
    const prompt = this.promptIj.injectComponent(CreateBranchPromptComponent);
    prompt.onEnter.subscribe((name: string) => {
      if (this.adapter.available) {
        this.adapter.send(CMD_REPO_CREATE_BRANCH, { name, commit: this.currentBranch?.target || "" });
      }
    });
  }

  /** Checkout the given branch shorthand. */
  checkout(shorthand: any): void {
    if (this.adapter.available) {
      this.adapter.send(CMD_REPO_CHECKOUT, { branch: shorthand });
    }
  }

  /** Push (or delete) a tag to remote. */
  pushTag(name: any, toDelete = false): void {
    if (this.adapter.available) {
      this.adapter.send(CMD_REPO_PUSH, {
        username: this.cred.username,
        password: this.cred.password,
        name,
        delete: toDelete,
      });
    }
  }

  /** Retry the last failed operation after credential refresh. */
  retry(): void {
    if (this._pendingOperation) {
      this._pendingOperation();
      this._pendingOperation = null;
    }
  }

  /** Remove persisted history for a given working directory. */
  removeRepoSetting(workingDir: any): void {
    if (this.adapter.available) {
      this.adapter.send(CMD_REPO_REMOVE_HISTORY, { workingDir });
    }
  }

  /** Open native folder-browse dialog for git-init target. */
  browseInitFolder(): void {
    if (this.adapter.available) {
      this.adapter.send(CMD_REPO_INIT_BROWSE);
    }
  }
}
