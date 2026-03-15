import { ComponentFixture, TestBed } from "@angular/core/testing";

import { CommitDetailComponent } from "../commit-detail.component";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { CommitSelectionService } from "../../services/commit-selection.service";
import { MockCommitSelection } from "./mock-commit-selection";
import { CiIntegrationService } from "../../services/ci-integration.service";
import { MockCIIntegration } from "./mock-ci-integration";
import { JiraIntegrationService } from "../../../jira/services/jira-integration.service";
import { MockJira } from "./mock-jira";
import { LayoutService } from "../../services/layout.service";
import { MockLayout } from "./mock-layout";

describe("CommitDetailComponent", () => {
  let component: CommitDetailComponent;
  let fixture: ComponentFixture<CommitDetailComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [CommitDetailComponent],
      providers: [
        {
          provide: CommitSelectionService,
          useValue: new MockCommitSelection({}, {}, {}, {}),
        },
        { provide: CiIntegrationService, useValue: new MockCIIntegration() },
        { provide: JiraIntegrationService, useValue: new MockJira() },
        { provide: LayoutService, useValue: new MockLayout({}, {}) },
      ],
      imports: [NgbModule],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(CommitDetailComponent, {
        set: {
          template: "<div>Test</div>",
          styleUrls: [],
        },
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommitDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
  it("should untoggle panel and file panel when selected commit is null", () => {
    let commitSelection = TestBed.get(
      CommitSelectionService
    ) as MockCommitSelection;
    component.toggled = true;
    component.fileToggled = true;

    commitSelection.selectionChange.emit(null);
    fixture.detectChanges();

    expect(component.toggled).toBeFalsy();
    expect(component.fileToggled).toBeFalsy();
  });
});
