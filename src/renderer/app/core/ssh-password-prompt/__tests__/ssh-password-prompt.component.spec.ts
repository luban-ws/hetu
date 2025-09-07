import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NO_ERRORS_SCHEMA } from "@angular/core";

import { SshPasswordPromptComponent } from "../ssh-password-prompt.component";
import { FormsModule } from "@angular/forms";

describe("SshPasswordPromptComponent", () => {
  let component: SshPasswordPromptComponent;
  let fixture: ComponentFixture<SshPasswordPromptComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [SshPasswordPromptComponent],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(SshPasswordPromptComponent, {
        set: {
          template: "<div>Test</div>",
          styleUrls: [],
        },
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SshPasswordPromptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
