import { TestBed, inject } from "@angular/core/testing";

import { SubmodulesService } from "../submodules.service";
import { DESKTOP_ADAPTER } from '@infrastructure/desktop-adapter';
import { MockDesktopAdapter } from '@infrastructure/mocks/mock-desktop-adapter';

describe("SubmodulesService", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SubmodulesService,
        { provide: DESKTOP_ADAPTER, useValue: new MockDesktopAdapter() },
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
