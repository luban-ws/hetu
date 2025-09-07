import { Injectable, EventEmitter, Output } from "@angular/core";
import { ElectronService } from "../../infrastructure/electron.service";
import { CredentialsService } from "./credentials.service";
import { ToastrService } from "ngx-toastr";
import { Router } from "@angular/router";
import { HotkeysService } from "@ngneat/hotkeys";
import { CommitSelectionService } from "./commit-selection.service";
import { WIPCommit } from "../prototypes/commit";
import { LoadingService } from "../../infrastructure/loading-service.service";
import { IPC_EVENTS  } from '@common/ipc-events';

@Injectable()
export class CommitChangeService {
  @Output() messageChange = new EventEmitter<string>();
  @Output() detailChange = new EventEmitter<string>();
  @Output() stashed = new EventEmitter();
  @Output() popped = new EventEmitter();
  @Output() commitingChange = new EventEmitter<boolean>();
  private set commiting(cmting: boolean) {
    this._commiting = cmting;
    this.commitingChange.emit(this._commiting);
  }
  defaultKey = "";
  set newCommitMessage(msg) {
    this._message = msg;
    this.messageChange.emit(this._message);
  }
  get newCommitMessage() {
    return this._message;
  }
  set newCommitDetail(msg) {
    this._detail = msg;
    this.detailChange.emit(this._detail);
  }
  get newCommitDetail() {
    return this._detail;
  }
  private _message = "";
  private _detail = "";
  private _commiting = false;
  private selectedCommit: WIPCommit | null = null;
  constructor(
    private electron: ElectronService,
    private cred: CredentialsService,
    private route: Router,
    private toastr: ToastrService,
    private cmtSelect: CommitSelectionService,
    private hotkeys: HotkeysService,
    private loading: LoadingService
  ) {
    this.electron.onCD(IPC_EVENTS.REPO.COMMITTED, (event: any, arg: any) => {
      this.newCommitMessage = "";
      this.newCommitDetail = "";
      this.commiting = false;
    });
    this.electron.onCD(IPC_EVENTS.REPO.COMMIT_FAIL, (event: any, arg: any) => {
      this.toastr.error(
        "An error occured during commit, please try again",
        "Commit Error"
      );
      this.commiting = false;
    });
    this.electron.onCD(IPC_EVENTS.SETTINGS.EFFECTIVE_UPDATED, (event: any, arg: any) => {
      if (arg && arg["jira-enabled"] && arg["jira-keys"]) {
        let keys = arg["jira-keys"].split(";");
        let key = "";
        if (keys.length) {
          key = keys[0];
        }
        this.defaultKey = key;
      } else {
        this.defaultKey = "";
      }
    });
    this.electron.onCD(IPC_EVENTS.REPO.STASH_FAILED, (event: any, arg: any) => {
      this.toastr.error(
        "There was an error during stash, please try again",
        "Stash Error"
      );
      this.stashed.emit();
    });
    this.electron.onCD(IPC_EVENTS.REPO.POP_FAILED, (event: any, arg: any) => {
      if (arg.detail === "NO_STASH") {
        this.toastr.info("There's no stashed commits", "No Stash");
      } else {
        this.toastr.error(
          "There was an error during pop, please try again",
          "Pop Error"
        );
      }
    });
    this.electron.onCD(IPC_EVENTS.REPO.STASHED, (event: any, arg: any) => {
      this.stashed.emit();
    });
    this.electron.onCD(IPC_EVENTS.REPO.POPPED, (event: any, arg: any) => {
      this.popped.emit();
    });
    cmtSelect.selectionChange.subscribe((newSelect) => {
      if (<WIPCommit>newSelect) {
        this.selectedCommit = newSelect as WIPCommit;
      } else {
        this.selectedCommit = null;
      }
    });
    this.hotkeys.addShortcut({
      keys: "meta.s",
      description:
        "Commit staged changes (or all unstaged files if no files staged)",
      callback: (event: KeyboardEvent) => {
        if (!this.loading.isBusy) {
          this.tryCommit();
        }
        event.preventDefault();
      },
    });
    this.hotkeys.addShortcut({
      keys: "meta.arrowdown",
      description: "Stash",
      callback: (event: KeyboardEvent) => {
        if (!this.loading.isBusy) {
          this.stash();
        }
        event.preventDefault();
      },
    });
    this.hotkeys.addShortcut({
      keys: "meta.arrowup",
      description: "Pop latest stash",
      callback: (event: KeyboardEvent) => {
        if (!this.loading.isBusy) {
          this.pop();
        }
        event.preventDefault();
      },
    });
  }

  init() {}
  stage(paths: any): void {
    this.electron.ipcRenderer.send(IPC_EVENTS.REPO.STAGE, { paths: paths });
  }
  stageLines(path: any, lines: any) {
    this.electron.ipcRenderer.send(IPC_EVENTS.REPO.STAGE_LINES, {
      path: path,
      lines: lines,
    });
  }
  unstage(paths: any): void {
    this.electron.ipcRenderer.send(IPC_EVENTS.REPO.UNSTAGE, { paths: paths });
  }
  unstageLines(path: any, lines: any) {
    this.electron.ipcRenderer.send(IPC_EVENTS.REPO.UNSTAGE_LINES, {
      path: path,
      lines: lines,
    });
  }
  commit(paths: any): void {
    if (this.checkProfileExists()) {
      let name = this.cred.name;
      let email = this.cred.email;
      let message = `${this._message}\n${this.newCommitDetail}`;
      this.electron.ipcRenderer.send(IPC_EVENTS.REPO.COMMIT, {
        name: name,
        email: email,
        message: message,
        files: paths,
      });
    }
  }
  commitStaged(): void {
    if (this.checkProfileExists()) {
      let name = this.cred.name;
      let email = this.cred.email;
      let message = `${this._message}\n${this.newCommitDetail}`;
      this.electron.ipcRenderer.send(IPC_EVENTS.REPO.COMMIT_STAGED, {
        name: name,
        email: email,
        message: message,
      });
    }
  }
  stash(): void {
    if (this.checkProfileExists()) {
      let name = this.cred.name;
      let email = this.cred.email;
      let message = `${this._message}\n${this.newCommitDetail}`;
      this.electron.ipcRenderer.send(IPC_EVENTS.REPO.STASH, {
        name: name,
        email: email,
        message: message,
      });
    }
  }
  pop(index: any = -1): void {
    this.electron.ipcRenderer.send(IPC_EVENTS.REPO.POP, { index: index });
  }
  apply(index: any = -1): void {
    this.electron.ipcRenderer.send(IPC_EVENTS.REPO.APPLY, { index: index });
  }
  deleteStash(index: any): void {
    this.electron.ipcRenderer.send(IPC_EVENTS.REPO.DELETE_STASH, { index: index });
  }
  discardAll(): void {
    this.electron.ipcRenderer.send(IPC_EVENTS.REPO.DISCARD_ALL, {});
  }
  tryCommit(): void {
    if (
      this.newCommitMessage.length &&
      this.selectedCommit &&
      !this.commiting
    ) {
      this.commiting = true;
      const staged = this.selectedCommit.staged || [];
      const unstaged = this.selectedCommit.unstaged || [];
      
      if (Array.isArray(staged) && staged.length) {
        this.commitStaged();
      } else if (Array.isArray(unstaged)) {
        this.commit(unstaged.map((us) => us.path));
      }
    }
  }
  private checkProfileExists(): boolean {
    let noProfile = !this.cred.name || !this.cred.email;
    if (noProfile) {
      this.toastr
        .warning(
          "No profile settings found, click here to setup your profile",
          "Profile Not Setup"
        )
        .onTap.subscribe(() => {
          this.route.navigateByUrl("settings/profile");
        });
    }
    return !noProfile;
  }
}
