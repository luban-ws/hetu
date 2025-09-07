import { ComponentFixture, TestBed } from "@angular/core/testing";
import { beforeEach, describe, expect, it } from "vitest";

import { FileCountsComponent } from "../file-counts.component";
import { LayoutService } from "../../services/layout.service";
import { MockLayout } from "./mock-layout";
import { HotkeysService } from "@ngneat/hotkeys";
import { ElectronService } from "../../../infrastructure/electron.service";
import { MockElectron } from "./mock-electron";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

describe("FileCountsComponent", () => {
  let component: FileCountsComponent;
  let fixture: ComponentFixture<FileCountsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FileCountsComponent],
      imports: [NgbModule],
      providers: [
        {
          provide: LayoutService,
          useValue: {
            tooltipChanged: { subscribe: () => {} },
            tooltipEnabled: true,
          },
        },
        { provide: HotkeysService, useValue: {} },
        { provide: ElectronService, useValue: {} },
      ],
    })
      .overrideComponent(FileCountsComponent, {
        set: {
          template: "<div>Test Template</div>",
          styleUrls: [],
        },
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileCountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
