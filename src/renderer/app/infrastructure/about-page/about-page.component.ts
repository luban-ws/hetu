import { Component, OnInit, Inject } from "@angular/core";
import { DesktopAdapter, DESKTOP_ADAPTER } from '../desktop-adapter';
import { IPC_EVENTS } from "@common/ipc-events";

@Component({
  selector: "app-about-page",
  templateUrl: "./about-page.component.html",
  styleUrls: ["./about-page.component.scss"],
  standalone: false,
})
export class AboutPageComponent implements OnInit {
  constructor(@Inject(DESKTOP_ADAPTER) private adapter: DesktopAdapter) {}

  ngOnInit() {}

  /** @description Open the project repository in the default browser */
  goToRepo() {
    this.adapter.send(IPC_EVENTS.SHELL.OPEN, {
      url: "https://github.com/systembugtj/hetu",
    });
  }

  /** @description Open the Buy Me a Coffee page in the default browser */
  goToBMC() {
    this.adapter.send(IPC_EVENTS.SHELL.OPEN, {
      url: "https://www.buymeacoffee.com/mjCsGWDTS",
    });
  }
}
