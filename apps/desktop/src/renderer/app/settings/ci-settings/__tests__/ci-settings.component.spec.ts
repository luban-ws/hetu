import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { CiSettingsComponent } from "../ci-settings.component";
import { SettingsService } from "../../services/settings.service";
import { MockSettings } from "./mock-settings-service";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { DESKTOP_ADAPTER } from '@infrastructure/desktop-adapter';
import { MockDesktopAdapter } from '@infrastructure/mocks/mock-desktop-adapter';

describe("CiSettingsComponent", () => {
  let component: CiSettingsComponent;
  let fixture: ComponentFixture<CiSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CiSettingsComponent],
      providers: [
        { provide: SettingsService, useClass: MockSettings },
        { provide: DESKTOP_ADAPTER, useClass: MockDesktopAdapter },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CiSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
