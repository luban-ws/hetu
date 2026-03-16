import { TestBed, inject } from "@angular/core/testing";

import { SettingsService } from "../settings.service";
import { DESKTOP_ADAPTER } from '@infrastructure/desktop-adapter';
import { MockDesktopAdapter } from '@infrastructure/mocks/mock-desktop-adapter';
import { beforeEach, describe, expect, it } from "vitest";

// Mock ToastrService
class MockToastrService {
  success() {}
  error() {}
  warning() {}
  info() {}
}

describe("SettingsService", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SettingsService,
        { provide: DESKTOP_ADAPTER, useClass: MockDesktopAdapter },
        { provide: "ToastrService", useClass: MockToastrService },
      ],
    });
  });

  it("should be created", inject(
    [SettingsService],
    (service: SettingsService) => {
      expect(service).toBeTruthy();
    }
  ));
});
