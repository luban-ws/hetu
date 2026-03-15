import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AuthSettingsComponent } from "../auth-settings.component";
import { SettingsService } from "../../services/settings.service";
import { MockSettings } from "./mock-settings-service";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

describe("AuthSettingsComponent", () => {
  let component: AuthSettingsComponent;
  let fixture: ComponentFixture<AuthSettingsComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [NgbModule],
      declarations: [AuthSettingsComponent],
      providers: [{ provide: SettingsService, useClass: MockSettings }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
