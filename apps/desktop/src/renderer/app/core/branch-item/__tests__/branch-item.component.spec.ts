import { ComponentFixture, TestBed } from "@angular/core/testing";

import { BranchItemComponent } from "../branch-item.component";
import { D3Service } from "../../d3/d3.service";
import { DESKTOP_ADAPTER } from '@infrastructure/desktop-adapter';
import { MockDesktopAdapter } from '@infrastructure/mocks/mock-desktop-adapter';
import { MockD3 } from "../../mocks/mock-d3-service";
import {
  ContextMenuModule,
  ContextMenuService,
} from "@perfectmemory/ngx-contextmenu";
import { MockContextMenuService } from "../../mocks/mock-context-menu-service";
import { CommitSelectionService } from "../../services/commit-selection.service";
import { MockCommitSelection } from "../../mocks/mock-commit-selection-service";
import { SubmodulesService } from "../../services/submodules.service";
import { MockSubmodule } from "../../mocks/mock-submodule-service";

describe("BranchItemComponent", () => {
  let component: BranchItemComponent;
  let fixture: ComponentFixture<BranchItemComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [BranchItemComponent],
      imports: [ContextMenuModule],
      providers: [
        { provide: DESKTOP_ADAPTER, useClass: MockDesktopAdapter },
        { provide: D3Service, useClass: MockD3 },
        { provide: ContextMenuService, useClass: MockContextMenuService },
        { provide: CommitSelectionService, useClass: MockCommitSelection },
        { provide: SubmodulesService, useClass: MockSubmodule },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BranchItemComponent);
    component = fixture.componentInstance;
    component.item = {};
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
