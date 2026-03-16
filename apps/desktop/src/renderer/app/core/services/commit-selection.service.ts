import { Injectable, EventEmitter, Output, Inject, NgZone } from '@angular/core';
import { DESKTOP_ADAPTER, DesktopAdapter } from '../../infrastructure/desktop-adapter';
import { CommitDetail, WIPCommit } from '../prototypes/commit';
import { CiIntegrationService } from './ci-integration.service';
import { FileDetail } from '../prototypes/file-detail';
import { PromptInjectorService } from '../../infrastructure/prompt-injector.service';
import { TagPromptComponent } from '../tag-prompt/tag-prompt.component';
import { ToastrService } from 'ngx-toastr';
import { CredentialsService } from './credentials.service';
import { IPC_EVENTS } from '@infrastructure/ipc-events';

@Injectable()
export class CommitSelectionService {

  @Output() selectionChange = new EventEmitter<CommitDetail | WIPCommit>();
  @Output() selectingChange = new EventEmitter<boolean>();
  @Output() selectedFileChange = new EventEmitter<string>();
  @Output() fileDetailChanged = new EventEmitter<FileDetail>();
  @Output() gettingFileDetail = new EventEmitter();

  selectedCommit: CommitDetail | WIPCommit;
  private _selectedFile = "";
  private _fileDetail: FileDetail;
  private _currentUpdateSubscription = "";
  private _wipDetail: WIPCommit = {
    sha: "00000",
    author: "",
    email: "",
    parents: [],
    message: "",
    date: new Date(),
    ci: "",
    staged: null,
    unstaged: null,
    stagedSummary: {
      ignored: 0,
      newCount: 0,
      deleted: 0,
      modified: 0,
      renamed: 0,
    },
    unstagedSummary: {
      ignored: 0,
      newCount: 0,
      deleted: 0,
      modified: 0,
      renamed: 0,
    },
    virtual: true,
    isStash: false,
    stashIndex: -1,
  };
  constructor(
    @Inject(DESKTOP_ADAPTER) private adapter: DesktopAdapter,
    private zone: NgZone,
    private promptInj: PromptInjectorService,
    private toastr: ToastrService,
    private cred: CredentialsService
  ) {
    this.adapter.on(IPC_EVENTS.REPO.COMMIT_DETAIL_RETRIEVED, (event: any, arg: any) => {
      this.zone.run(() => {
        this.selectedCommit = arg.commit;
        this.selectingChange.emit(false);
        this.selectionChange.emit(this.selectedCommit);
      });
    });
    this.adapter.on(IPC_EVENTS.REPO.FILE_STATUS_RETRIEVED, (event: any, arg: any) => {
      this.zone.run(() => {
        if (arg) {
          this._wipDetail.stagedSummary = arg.stagedSummary || { ignored: 0, newCount: 0, deleted: 0, modified: 0, renamed: 0 };
          this._wipDetail.unstagedSummary = arg.unstagedSummary || { ignored: 0, newCount: 0, deleted: 0, modified: 0, renamed: 0 };
          this._wipDetail.staged = arg.staged || [];
          this._wipDetail.unstaged = arg.unstaged || [];
          
          const stagedLength = Array.isArray(this._wipDetail.staged) ? this._wipDetail.staged.length : 0;
          const unstagedLength = Array.isArray(this._wipDetail.unstaged) ? this._wipDetail.unstaged.length : 0;
          
          if (!stagedLength && !unstagedLength && this.selectedCommit && this.selectedCommit.sha === '00000') {
            this.selectedCommit = null;
            this.selectionChange.emit(this.selectedCommit);
          }
        }
      });
    });
    this.adapter.on(IPC_EVENTS.REPO.FILE_DETAIL_RETRIEVED, (event: any, arg: any) => {
      this.zone.run(() => {
        this._fileDetail = arg;
        this.fileDetailChanged.emit(this._fileDetail);
      });
    });
    this.adapter.on(IPC_EVENTS.REPO.BRANCH_DELETED, (event: any, arg: any) => {
      this.zone.run(() => {
        if (arg.upstream) {
          this.toastr.info("Local branch deleted. Click here to delete the upstream branch", "Upstream Branch Found").onTap.subscribe(() => {
            this.deleteRemoteBranch(arg.upstream);
          });
        }
      });
    });
    this.adapter.on(IPC_EVENTS.REPO.BRANCH_DELETE_FAILED, (event: any, arg: any) => {
      this.zone.run(() => {
        if (arg.detail === 'IS_CURRENT_BRANCH') {
          this.toastr.error("You are trying to delete the current branch, please checkout another branch before deleting", "Current Branch");
        }
      });
    });
    this.adapter.on(IPC_EVENTS.REPO.LIVE_UPDATE_FILE_NOT_FOUND, (event: any, arg: any) => {
      this.zone.run(() => {
        this._selectedFile = "";
        this.selectedFileChange.emit(this._selectedFile);
      });
    });
    this.adapter.on(IPC_EVENTS.REPO.CLOSED, (event: any, arg: any) => {
      this.zone.run(() => {
        this.selectedCommit = null;
        this.selectionChange.emit(this.selectedCommit);
      });
    });
    this.adapter.on(IPC_EVENTS.REPO.OPEN_SUCCESSFUL, (event: any, arg: any) => {
      this.zone.run(() => {
        this.selectedCommit = null;
        this.selectionChange.emit(this.selectedCommit);
      });
    });
  }

  /** Select a file and fetch its diff detail for the given commit */
  async selectFileDetail(file: any, sha: any = null, fullFile = false) {
    if (!sha) {
      sha = this.selectedCommit?.sha;
    }
    if (!sha) {
      return;
    }
    this._selectedFile = file;
    this.selectedFileChange.emit(file);
    this.gettingFileDetail.emit();
    this.adapter.send(IPC_EVENTS.REPO.GET_FILE_DETAIL, { file: file, commit: sha, fullFile: fullFile });
    await this.subscribeLiveFileUpdate(file, sha, fullFile);
  }

  /** Subscribe to live file updates via invoke (request-response) */
  async subscribeLiveFileUpdate(file: any, commit: any, fullFile: any): Promise<void> {
    this.unsubscribeFileUpdate();
    this._currentUpdateSubscription = await this.adapter.invoke<string>(IPC_EVENTS.REPO.SUBSCRIBE_FILE_UPDATE, {file: file, commit: commit, fullFile: fullFile});
  }

  /** Select a commit by SHA, or deselect if already selected */
  select(commit: any) {
    if (commit && (!this.selectedCommit || commit !== this.selectedCommit.sha)) {
      if (commit === '00000') {
        this.selectedCommit = this._wipDetail;
        this.selectionChange.emit(this.selectedCommit);
      } else {
        this.selectingChange.emit(true);
        this.adapter.send(IPC_EVENTS.REPO.GET_COMMIT, { commit: commit });
      }
    } else if (!commit || (this.selectedCommit && commit === this.selectedCommit.sha)) {
      this.selectedCommit = null;
      this.selectionChange.emit(this.selectedCommit);
    }
  }

  /** Open a file in the system's external diff/editor tool */
  openExternalFileView(file: any, sha: any = null) {
    if (!sha) {
      sha = this.selectedCommit?.sha;
    }
    if (!sha) {
      return;
    }
    this.adapter.send(IPC_EVENTS.REPO.OPEN_EXTERNAL_FILE, { file: file, commit: sha });
  }

  /** Reset the repository to a given commit (hard or soft) */
  reset(commit: any, mode: any): void {
    if (mode === 'hard') {
      this.adapter.send(IPC_EVENTS.REPO.RESET_HARD, { commit: commit });
    } else if (mode === 'soft') {
      this.adapter.send(IPC_EVENTS.REPO.RESET_SOFT, { commit: commit });
    }
  }

  /** Prompt the user and create a tag on the given commit */
  createTag(commit: any): void {
    let compt = this.promptInj.injectComponent(TagPromptComponent);
    compt.sha = commit;
    compt.toCreate.subscribe(info => {
      this.adapter.send(IPC_EVENTS.REPO.CREATE_TAG, { targetCommit: info.sha, name: info.name });
    });
  }

  /** Delete a tag by name */
  deleteTag(name: any): void {
    this.adapter.send(IPC_EVENTS.REPO.DELETE_TAG, { name: name });
  }

  /** Delete a local branch by name */
  deleteBranch(name: any): void {
    this.adapter.send(IPC_EVENTS.REPO.DELETE_BRANCH, {name: name});
  }

  /** Delete a remote branch with credentials */
  deleteRemoteBranch(name: any): void {
    let username = this.cred.username;
    let password = this.cred.password;
    this.adapter.send(IPC_EVENTS.REPO.DELETE_BRANCH, {name: name, username: username, password: password});
  }

  /** Cancel any active live file-update subscription */
  unsubscribeFileUpdate(): void {
    this.adapter.send(IPC_EVENTS.REPO.UNSUBSCRIBE_FILE_UPDATE, {id: this._currentUpdateSubscription});
  }
}
