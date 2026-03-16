import { TestBed, inject } from "@angular/core/testing";

import { CredentialsService } from "../credentials.service";
import { DESKTOP_ADAPTER } from '@infrastructure/desktop-adapter';
import { PromptInjectorService } from "../../../infrastructure/prompt-injector.service";
import { MockPromptInjector } from "../../../infrastructure/mocks/mock-prompt-injector-service";
import { SimpleNotificationsModule } from "angular2-notifications";
import { RouterTestingModule } from "@angular/router/testing";
import { MockDesktopAdapter } from '@infrastructure/mocks/mock-desktop-adapter';
import { ToastrService } from "ngx-toastr";

describe("CredentialsService", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SimpleNotificationsModule.forRoot(), RouterTestingModule],
      providers: [
        CredentialsService,
        { provide: DESKTOP_ADAPTER, useClass: MockDesktopAdapter },
        { provide: PromptInjectorService, useClass: MockPromptInjector },
        { provide: ToastrService, useValue: {} },
      ],
    });
  });

  it("should be created", inject(
    [CredentialsService],
    (service: CredentialsService) => {
      expect(service).toBeTruthy();
    }
  ));
});
