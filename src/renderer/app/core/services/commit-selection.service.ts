import { Injectable, EventEmitter, Output } from '@angular/core';
import { ElectronService } from '../../infrastructure/electron.service';
import { CommitDetail, WIPCommit } from '../prototypes/commit';
import { CiIntegrationService } from './ci-integration.service';
import { FileDetail } from '../prototypes/file-detail';
import { PromptInjectorService } from '../../infrastructure/prompt-injector.service';
import { TagPromptComponent } from '../tag-prompt/tag-prompt.component';
import { ToastrService } from 'ngx-toastr';
import { CredentialsService } from './credentials.service';
import { IPC_EVENTS  } from '@common/ipc-events';

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
    private electron: ElectronService,
    private promptInj: PromptInjectorService,
    private toastr: ToastrService,
    private cred: CredentialsService
  ) {
    this.electron.onCD(IPC_EVENTS.REPO.COMMIT_DETAIL_RETRIEVED, (event, arg) => {
      this.selectedCommit = arg.commit;

      this.selectingChange.emit(false);
      this.selectionChange.emit(this.selectedCommit);
    });
    this.electron.onCD(IPC_EVENTS.REPO.FILE_STATUS_RETRIEVED, (event, arg) => {
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
    this.electron.onCD(IPC_EVENTS.REPO.FILE_DETAIL_RETRIEVED, (event, arg) => {
      this._fileDetail = arg;
      this.fileDetailChanged.emit(this._fileDetail);
    });
    this.electron.onCD(IPC_EVENTS.REPO.BRANCH_DELETED, (event, arg) => {
      if (arg.upstream) {
        this.toastr.info("Local branch deleted. Click here to delete the upstream branch", "Upstream Branch Found").onTap.subscribe(() => {
          this.deleteRemoteBranch(arg.upstream);
        });
      }
    });
    this.electron.onCD(IPC_EVENTS.REPO.BRANCH_DELETE_FAILED, (event, arg) => {
      if (arg.detail === 'IS_CURRENT_BRANCH') {
        this.toastr.error("You are trying to delete the current branch, please checkout another branch before deleting", "Current Branch");
      }
    });
    this.electron.onCD(IPC_EVENTS.REPO.LIVE_UPDATE_FILE_NOT_FOUND, (event, arg) => {
      this._selectedFile = "";
      this.selectedFileChange.emit(this._selectedFile);
    });
    this.electron.onCD(IPC_EVENTS.REPO.CLOSED, (event, arg) => {
      this.selectedCommit = null;
      this.selectionChange.emit(this.selectedCommit);
    });

    this.electron.onCD(IPC_EVENTS.REPO.OPEN_SUCCESSFUL, (event, arg) => {
      this.selectedCommit = null;
      this.selectionChange.emit(this.selectedCommit);
    });
  }

  selectFileDetail(file, sha = null, fullFile = false) {
    if (!sha) {
      sha = this.selectedCommit?.sha;
    }
    if (!sha) {
      return; // Can't get file detail without a commit SHA
    }
    this._selectedFile = file;
    this.selectedFileChange.emit(file);
    this.gettingFileDetail.emit();
    this.electron.ipcRenderer.send(IPC_EVENTS.REPO.GET_FILE_DETAIL, { file: file, commit: sha, fullFile: fullFile });
    this.subscribeLiveFileUpdate(file, sha, fullFile);
  }
  subscribeLiveFileUpdate(file, commit, fullFile) {
    this.unsubscribeFileUpdate();
    this._currentUpdateSubscription = this.electron.ipcRenderer.sendSync(IPC_EVENTS.REPO.SUBSCRIBE_FILE_UPDATE, {file: file, commit: commit, fullFile: fullFile});
  }
  select(commit) {
    if (commit && (!this.selectedCommit || commit !== this.selectedCommit.sha)) {
      if (commit === '00000') {
        this.selectedCommit = this._wipDetail;
        this.selectionChange.emit(this.selectedCommit);
      } else {
        this.selectingChange.emit(true);
        this.electron.ipcRenderer.send(IPC_EVENTS.REPO.GET_COMMIT, { commit: commit });
      }
    } else if (!commit || (this.selectedCommit && commit === this.selectedCommit.sha)) {
      this.selectedCommit = null;
      this.selectionChange.emit(this.selectedCommit);
    }
  }
  openExternalFileView(file, sha = null) {
    if (!sha) {
      sha = this.selectedCommit?.sha;
    }
    if (!sha) {
      return; // Can't open file without a commit SHA
    }
    this.electron.ipcRenderer.send(IPC_EVENTS.REPO.OPEN_EXTERNAL_FILE, { file: file, commit: sha });
  }
  reset(commit, mode): void {
    if (mode === 'hard') {
      this.electron.ipcRenderer.send(IPC_EVENTS.REPO.RESET_HARD, { commit: commit });
    } else if (mode === 'soft') {
      this.electron.ipcRenderer.send(IPC_EVENTS.REPO.RESET_SOFT, { commit: commit });
    }
  }
  createTag(commit): void {
    let compt = this.promptInj.injectComponent(TagPromptComponent);
    compt.sha = commit;
    compt.toCreate.subscribe(info => {
      this.electron.ipcRenderer.send(IPC_EVENTS.REPO.CREATE_TAG, { targetCommit: info.sha, name: info.name });
    });
  }
  deleteTag(name): void {
    this.electron.ipcRenderer.send(IPC_EVENTS.REPO.DELETE_TAG, { name: name });
  }
  deleteBranch(name): void {
    this.electron.ipcRenderer.send(IPC_EVENTS.REPO.DELETE_BRANCH, {name: name});
  }
  deleteRemoteBranch(name): void {
    let username = this.cred.username;
    let password = this.cred.password;
    this.electron.ipcRenderer.send(IPC_EVENTS.REPO.DELETE_BRANCH, {name: name, username: username, password: password});
  }
  unsubscribeFileUpdate(): void {
    this.electron.ipcRenderer.send(IPC_EVENTS.REPO.UNSUBSCRIBE_FILE_UPDATE, {id: this._currentUpdateSubscription});
  }
}
