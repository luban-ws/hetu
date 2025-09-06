import { Component, OnInit } from "@angular/core";
import { ElectronService } from "../electron.service";

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
    this.electron.ipcRenderer.send("Shell-Open", {
      url: "https://github.com/Yamazaki93/explorasa-git",
    });
  }
  goToBMC() {
    this.electron.ipcRenderer.send("Shell-Open", {
      url: "https://www.buymeacoffee.com/mjCsGWDTS",
    });
  }
}
