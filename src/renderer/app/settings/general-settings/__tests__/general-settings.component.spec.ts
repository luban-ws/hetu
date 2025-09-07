import { ComponentFixture, TestBed } from "@angular/core/testing";

import { GeneralSettingsComponent } from "../general-settings.component";
import { FormsModule } from "@angular/forms";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { SettingsService } from "../../services/settings.service";
import { MockSettings } from "./mock-settings-service";
import { beforeEach, describe, expect, it } from "vitest";

// Mock ToastrService
class MockToastrService {
  success() {}
  error() {}
  warning() {}
  info() {}
}

describe("GeneralSettingsComponent", () => {
  let component: GeneralSettingsComponent;
  let fixture: ComponentFixture<GeneralSettingsComponent>;

  beforeEach(async () => {
    const mockSettingsService = new MockSettings();

    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [GeneralSettingsComponent],
      providers: [
        { provide: SettingsService, useValue: mockSettingsService },
        { provide: "ToastrService", useClass: MockToastrService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(GeneralSettingsComponent, {
        set: {
          template: "<div>Test Template</div>",
          styleUrls: [],
        },
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
