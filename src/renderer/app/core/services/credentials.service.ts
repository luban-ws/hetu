import { Injectable, EventEmitter, Inject, NgZone } from "@angular/core";
import { DESKTOP_ADAPTER, DesktopAdapter } from "../../infrastructure/desktop-adapter";
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
    @Inject(DESKTOP_ADAPTER) private adapter: DesktopAdapter,
    private zone: NgZone,
    private promptIj: PromptInjectorService,
    private toastr: ToastrService,
    private route: Router
  ) {
    this.adapter.on(IPC_EVENTS.REPO.OPEN_SUCCESSFUL, (event: any, arg: any) => {
      this.zone.run(() => {
        this.username = "";
        this.password = "";
        this.email = "";
        this.name = "";
      });
    });
    this.adapter.on(IPC_EVENTS.SETTINGS.EFFECTIVE_UPDATED, (event: any, arg: any) => {
      this.zone.run(() => {
        this.email = arg && arg["profile-email"] ? arg["profile-email"] : "";
        this.name = arg && arg["profile-name"] ? arg["profile-name"] : "";
      });
    });
    this.adapter.on(IPC_EVENTS.REPO.USERNAME_RETRIEVED, (event: any, arg: any) => {
      this.zone.run(() => {
        this.username = arg && arg.username ? arg.username : "";
        this.notifyCredentialChange();
      });
    });
    this.adapter.on(IPC_EVENTS.REPO.PASSWORD_RETRIEVED, (event: any, arg: any) => {
      this.zone.run(() => {
        this.password = arg && arg.password ? arg.password : "";
        this.notifyCredentialChange();
      });
    });
    this.adapter.on(IPC_EVENTS.REPO.SSH_KEY_REQUIRED, (event: any, arg: any) => {
      this.zone.run(() => {
        this.toastr
          .warning(
            "This repo uses SSH authentication, click here to set up your SSH keys",
            "SSH Key Required"
          )
          .onTap.subscribe(() => {
            this.route.navigateByUrl("settings/auth");
          });
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

  /** Send updated credentials to the backend */
  updateCredentials(username: string, password: string) {
    this.adapter.send(IPC_EVENTS.REPO.SET_CRED, {
      username: username,
      password: password,
    });
  }
}
