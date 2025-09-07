import { Injectable, EventEmitter } from "@angular/core";
import { ElectronService } from "../../infrastructure/electron.service";
import { EnterLoginPromptComponent } from "../enter-login-prompt/enter-login-prompt.component";
import { ToastrService } from "ngx-toastr";
import { Router } from "@angular/router";
import { SshPasswordPromptComponent } from "../ssh-password-prompt/ssh-password-prompt.component";
import { PromptInjectorService } from "../../infrastructure/prompt-injector.service";
import { IPC_EVENTS  } from '@common/ipc-events';

@Injectable()
export class CredentialsService {
  username = "";
  password = "";
  email = "";
  name = "";
  credentialChange = new EventEmitter<{ username: string; password: string }>();
  constructor(
    private electron: ElectronService,
    private promptIj: PromptInjectorService,
    private toastr: ToastrService,
    private route: Router
  ) {
    this.electron.onCD(IPC_EVENTS.REPO.OPEN_SUCCESSFUL, (event: any, arg: any) => {
      this.username = "";
      this.password = "";
      this.email = "";
      this.name = "";
    });
    this.electron.onCD(IPC_EVENTS.SETTINGS.EFFECTIVE_UPDATED, (event: any, arg: any) => {
      this.email = arg && arg["profile-email"] ? arg["profile-email"] : "";
      this.name = arg && arg["profile-name"] ? arg["profile-name"] : "";
    });
    this.electron.onCD(IPC_EVENTS.REPO.USERNAME_RETRIEVED, (event: any, arg: any) => {
      this.username = arg && arg.username ? arg.username : "";
      this.notifyCredentialChange();
    });
    this.electron.onCD(IPC_EVENTS.REPO.PASSWORD_RETRIEVED, (event: any, arg: any) => {
      this.password = arg && arg.password ? arg.password : "";
      this.notifyCredentialChange();
    });
    this.electron.onCD(IPC_EVENTS.REPO.SSH_KEY_REQUIRED, (event: any, arg: any) => {
      this.toastr
        .warning(
          "This repo uses SSH authentication, click here to set up your SSH keys",
          "SSH Key Required"
        )
        .onTap.subscribe(() => {
          this.route.navigateByUrl("settings/auth");
        });
    });
  }

  init() {}

  promptUserUpdateCredential() {
    let component = this.promptIj.injectComponent(EnterLoginPromptComponent);
    (<EnterLoginPromptComponent>component).onEnter.subscribe((creds) => {
      this.username = creds.username;
      this.password = creds.password;
      this.updateCredentials(creds.username, creds.password);
      this.notifyCredentialChange();
    });
  }

  promptUserEnterSSHPassword() {
    let component = this.promptIj.injectComponent(SshPasswordPromptComponent);
    (<SshPasswordPromptComponent>component).onEnter.subscribe((creds) => {
      this.password = creds.password;
      this.updateCredentials("", creds.password);
      this.notifyCredentialChange();
    });
  }

  notifyCredentialChange() {
    this.credentialChange.emit({
      username: this.username,
      password: this.password,
    });
  }

  updateCredentials(username: string, password: string) {
    this.electron.ipcRenderer.send(IPC_EVENTS.REPO.SET_CRED, {
      username: username,
      password: password,
    });
  }
}
