import { Component, OnInit } from "@angular/core";
import { ElectronService } from "../electron.service";
import { IPC_EVENTS } from "@common/ipc-events";

@Component({
  selector: "app-about-page",
  templateUrl: "./about-page.component.html",
  styleUrls: ["./about-page.component.scss"],
  standalone: false,
})
export class AboutPageComponent implements OnInit {
  constructor(private electron: ElectronService) {}

  ngOnInit() {}

  goToRepo() {
    this.electron.ipcRenderer.send(IPC_EVENTS.SHELL.OPEN, {
      url: "https://github.com/systembugtj/explorasa-git",
    });
  }
  goToBMC() {
    this.electron.ipcRenderer.send(IPC_EVENTS.SHELL.OPEN, {
      url: "https://www.buymeacoffee.com/mjCsGWDTS",
    });
  }
}
