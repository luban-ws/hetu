import { Injectable, Output, EventEmitter, NgZone, OnDestroy } from "@angular/core";
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

// Preload API interface
declare global {
  interface Window {
    electronAPI: {
      git: {
        openRepository: (workingDir: string) => boolean;
        initRepository: (path: string) => boolean;
        browseRepository: () => boolean;
        browseFolderForInit: () => boolean;
        closeRepository: () => boolean;
        fetch: (credentials: any) => boolean;
        pull: (credentials: any) => boolean;
        push: (credentials: any) => boolean;
        createBranch: (name: string, commit: string) => boolean;
        checkout: (branch: string) => boolean;
        removeHistory: (workingDir: string) => boolean;
      };
      gitEvents: {
        onOpenSuccessful: (callback: Function) => () => void;
        onOpenFailed: (callback: Function) => () => void;
        onClosed: (callback: Function) => () => void;
        onCurrentRemoved: (callback: Function) => () => void;
        onCommitsUpdated: (callback: Function) => () => void;
        onBranchChanged: (callback: Function) => () => void;
        onBranchPositionRetrieved: (callback: Function) => () => void;
        onRemotesChanged: (callback: Function) => () => void;
        onFileStatusRetrieved: (callback: Function) => () => void;
        onCredentialIssue: (callback: Function) => () => void;
        onPulled: (callback: Function) => () => void;
        onPullFailed: (callback: Function) => () => void;
        onPushed: (callback: Function) => () => void;
        onPushFailed: (callback: Function) => () => void;
        onFetched: (callback: Function) => () => void;
        onFetchFailed: (callback: Function) => () => void;
        onFolderSelected: (callback: Function) => () => void;
        onInitPathSelected: (callback: Function) => () => void;
        onInitSuccessful: (callback: Function) => () => void;
        onInitFailed: (callback: Function) => () => void;
        onBlockingOperationBegan: (callback: Function) => () => void;
        onBlockingOperationEnd: (callback: Function) => () => void;
        onBlockingUpdate: (callback: Function) => () => void;
        onBranchCreated: (callback: Function) => () => void;
        onBranchCreateFailed: (callback: Function) => () => void;
        onTagCreated: (callback: Function) => () => void;
        onTagDeleted: (callback: Function) => () => void;
        onRefRetrieved: (callback: Function) => () => void;
      };
      settingsEvents: {
        onEffectiveUpdated: (callback: Function) => () => void;
      };
      autoFetchEvents: {
        onTimeout: (callback: Function) => () => void;
      };
    };
  }
}

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
    // Clean up all event subscriptions
    this.unsubscribers.forEach(unsubscribe => unsubscribe());
    this.unsubscribers = [];
  }

  init(): void {
    if (!window.electronAPI) {
      console.error("electronAPI not available");
      return;
    }

    this.setupEventHandlers();
    this.setupCredentialHandling();
    this.setupHotkeys();
  }

  private setupEventHandlers(): void {
    // Repository lifecycle events
    this.unsubscribers.push(
      window.electronAPI.gitEvents.onOpenSuccessful((event: any, arg: any) => {
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
      window.electronAPI.gitEvents.onCurrentRemoved((event: any, arg: any) => {
        this.ngZone.run(() => {
          window.electronAPI.git.closeRepository();
        });
      })
    );

    this.unsubscribers.push(
      window.electronAPI.gitEvents.onClosed((event: any, arg: any) => {
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
      window.electronAPI.gitEvents.onBranchPositionRetrieved((event: any, arg: any) => {
        this.ngZone.run(() => {
          this.currentPos = arg;
          this.posUpdate.emit(this.currentPos);
        });
      })
    );

    // Git operation result events
    this.unsubscribers.push(
      window.electronAPI.gitEvents.onPulled((event: any, arg: any) => {
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
      window.electronAPI.gitEvents.onPushed((event: any, arg: any) => {
        this.ngZone.run(() => {
          this.pushing.emit(false);
          this.toastr.success("Successfully pushed to remote", "Pushed");
        });
      })
    );

    this.unsubscribers.push(
      window.electronAPI.gitEvents.onCommitsUpdated((event: any, arg: any) => {
        this.ngZone.run(() => {
          if (arg && arg.commits) {
            this.notifyCommitDifference(arg.commits);
          }
        });
      })
    );

    this.unsubscribers.push(
      window.electronAPI.gitEvents.onFetched((event: any, arg: any) => {
        this.ngZone.run(() => {
          // Handle fetch success if needed
        });
      })
    );

    // Error handling events
    this.unsubscribers.push(
      window.electronAPI.gitEvents.onOpenFailed((event: any, arg: any) => {
        this.ngZone.run(() => {
          this.loading.disableLoading();
          
          if (arg.error === 'NOT_GIT_REPOSITORY' && arg.canInitialize && arg.workingDir) {
            const gitInitPrompt = this.promptIj.injectComponent(GitInitPromptComponent);
            gitInitPrompt.configure(arg.detail_message, arg.workingDir);
            
            gitInitPrompt.onResult.subscribe((shouldInitialize) => {
              if (shouldInitialize) {
                this.loading.enableLoading("Initializing git repository...");
                window.electronAPI.git.initRepository(arg.workingDir);
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
      window.electronAPI.gitEvents.onBranchCreateFailed((event: any, arg: any) => {
        this.ngZone.run(() => {
          const detail = arg?.detail || "unknown error";
          this.toastr.error("Failed to create branch, " + detail, "Error");
        });
      })
    );

    // Browse and folder selection events
    this.unsubscribers.push(
      window.electronAPI.gitEvents.onFolderSelected((event: any, arg: any) => {
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
      window.electronAPI.gitEvents.onBranchChanged((event: any, arg: any) => {
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
      window.electronAPI.gitEvents.onCredentialIssue((event: any, arg: any) => {
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
      window.electronAPI.gitEvents.onFetchFailed((event: any, arg: any) => {
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
      window.electronAPI.gitEvents.onPullFailed((event: any, arg: any) => {
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
      window.electronAPI.gitEvents.onPushFailed((event: any, arg: any) => {
        this.ngZone.run(() => {
          const detail = arg?.detail || "";
          if (detail === "FORCE_REQUIRED") {
            const inst = this.promptIj.injectComponent(ForcePushPromptComponent);
            this._pendingOperation = this.push;
            inst.onResult.subscribe((force) => {
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
      window.electronAPI.settingsEvents.onEffectiveUpdated((event: any, arg: any) => {
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
      window.electronAPI.gitEvents.onRefRetrieved((event: any, arg: any) => {
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
      window.electronAPI.gitEvents.onRemotesChanged((event: any, arg: any) => {
        this.ngZone.run(() => {
          this.remote = arg.remote;
        });
      })
    );

    // Auto-fetch timeout
    this.unsubscribers.push(
      window.electronAPI.autoFetchEvents.onTimeout((event: any, arg: any) => {
        this.ngZone.run(() => {
          if (!this._pendingOperation) {
            this.fetch();
          }
        });
      })
    );

    // Loading state events
    this.unsubscribers.push(
      window.electronAPI.gitEvents.onBlockingOperationBegan((event: any, arg: any) => {
        this.ngZone.run(() => {
          this.loading.enableLoading(arg.operation);
        });
      })
    );

    this.unsubscribers.push(
      window.electronAPI.gitEvents.onBlockingOperationEnd((event: any, arg: any) => {
        this.ngZone.run(() => {
          this.loading.disableLoading();
        });
      })
    );

    this.unsubscribers.push(
      window.electronAPI.gitEvents.onBlockingUpdate((event: any, arg: any) => {
        this.ngZone.run(() => {
          this.loading.updateMessage(arg.operation);
        });
      })
    );

    // File status events
    this.unsubscribers.push(
      window.electronAPI.gitEvents.onFileStatusRetrieved((event: any, arg: any) => {
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
      window.electronAPI.gitEvents.onTagCreated((event: any, arg: any) => {
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
      window.electronAPI.gitEvents.onTagDeleted((event: any, arg: any) => {
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
      window.electronAPI.gitEvents.onInitPathSelected((event: any, arg: any) => {
        this.ngZone.run(() => {
          if (arg?.path) {
            window.electronAPI.git.initRepository(arg.path);
          }
        });
      })
    );

    this.unsubscribers.push(
      window.electronAPI.gitEvents.onInitSuccessful((event: any, arg: any) => {
        this.ngZone.run(() => {
          if (arg?.path) {
            this.openRepo(arg.path);
          }
        });
      })
    );

    this.unsubscribers.push(
      window.electronAPI.gitEvents.onInitFailed((event: any, arg: any) => {
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
    this.cred.credentialChange.subscribe((newCreds) => {
      this.retry();
    });

    this.commitChange.messageChange.subscribe((msg) => {
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

  // Public API methods using preload
  openRepo(workingDir: any): void {
    if (window.electronAPI) {
      this.loading.enableLoading("Opening Repo...");
      window.electronAPI.git.openRepository(workingDir);
    }
  }

  openBrowse(): void {
    if (window.electronAPI) {
      window.electronAPI.git.browseRepository();
    }
  }

  fetch(): void {
    if (window.electronAPI) {
      window.electronAPI.git.fetch({
        username: this.cred.username,
        password: this.cred.password,
      });
    }
  }

  pull(): void {
    this.pulling.emit(true);
    if (window.electronAPI) {
      window.electronAPI.git.pull({
        username: this.cred.username,
        password: this.cred.password,
        option: this.pulloption,
      });
    }
  }

  push(force = false): void {
    this.pushing.emit(true);
    if (window.electronAPI) {
      window.electronAPI.git.push({
        username: this.cred.username,
        password: this.cred.password,
        force: force,
      });
    }
  }

  createBranch(): void {
    const prompt = this.promptIj.injectComponent(CreateBranchPromptComponent);
    prompt.onEnter.subscribe((name) => {
      if (window.electronAPI) {
        window.electronAPI.git.createBranch(name, this.currentBranch?.target || "");
      }
    });
  }

  checkout(shorthand: any): void {
    if (window.electronAPI) {
      window.electronAPI.git.checkout(shorthand);
    }
  }

  pushTag(name: any, toDelete = false): void {
    if (window.electronAPI) {
      window.electronAPI.git.push({
        username: this.cred.username,
        password: this.cred.password,
        name: name,
        delete: toDelete,
      });
    }
  }

  retry(): void {
    if (this._pendingOperation) {
      this._pendingOperation();
      this._pendingOperation = null;
    }
  }

  removeRepoSetting(workingDir: any): void {
    if (window.electronAPI) {
      window.electronAPI.git.removeHistory(workingDir);
    }
  }

  browseInitFolder(): void {
    if (window.electronAPI) {
      window.electronAPI.git.browseFolderForInit();
    }
  }
}