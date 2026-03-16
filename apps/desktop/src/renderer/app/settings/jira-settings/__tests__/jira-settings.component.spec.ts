import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { JiraSettingsComponent } from "../jira-settings.component";
import { SettingsService } from "../../services/settings.service";
import { MockSettings } from "./mock-settings-service";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { DESKTOP_ADAPTER } from '@infrastructure/desktop-adapter';
import { MockDesktopAdapter } from '@infrastructure/mocks/mock-desktop-adapter';

describe("JiraSettingsComponent", () => {
  let component: JiraSettingsComponent;
  let fixture: ComponentFixture<JiraSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [JiraSettingsComponent],
      providers: [
        { provide: SettingsService, useClass: MockSettings },
        { provide: DESKTOP_ADAPTER, useClass: MockDesktopAdapter },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JiraSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
