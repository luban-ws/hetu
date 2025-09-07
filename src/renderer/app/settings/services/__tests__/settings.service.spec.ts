import { TestBed, inject } from "@angular/core/testing";

import { SettingsService } from "../settings.service";
import { ElectronService } from "../../../infrastructure/electron.service";
import { MockElectron } from "../../../infrastructure/mocks/mock-electron-service";
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
        { provide: ElectronService, useClass: MockElectron },
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
