import { ComponentFixture, TestBed } from "@angular/core/testing";

import { PromptComponent } from "../prompt.component";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { PromptInjectorService } from "../../../infrastructure/prompt-injector.service";
import { MockPromptInjector } from "./mock-prompt-injector";
import { InfrastructureModule } from "../../../infrastructure/infrastructure.module";
import { PromptContainerDirective } from "../prompt-container.directive";
import { beforeEach, describe, expect, it } from "vitest";

describe("PromptComponent", () => {
  let component: PromptComponent;
  let fixture: ComponentFixture<PromptComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [PromptComponent, PromptContainerDirective],
      providers: [
        { provide: PromptInjectorService, useValue: new MockPromptInjector() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(PromptComponent, {
        set: {
          template: "<div>Test</div>",
          styleUrls: [],
        },
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PromptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
