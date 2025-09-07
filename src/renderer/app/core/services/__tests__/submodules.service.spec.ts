import { TestBed, inject } from "@angular/core/testing";

import { SubmodulesService } from "../submodules.service";
import { ElectronService } from "../../../infrastructure/electron.service";
import { MockElectron } from "./mock-electron";

describe("SubmodulesService", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SubmodulesService,
        { provide: ElectronService, useValue: new MockElectron() },
      ],
    });
  });

  it("should be created", inject(
    [SubmodulesService],
    (service: SubmodulesService) => {
      expect(service).toBeTruthy();
    }
  ));
});
