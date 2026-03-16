import { TestBed, inject } from "@angular/core/testing";

import { HistoryService } from "../history.service";
import { DESKTOP_ADAPTER } from '@infrastructure/desktop-adapter';
import { MockDesktopAdapter } from '@infrastructure/mocks/mock-desktop-adapter';

describe("HistoryService", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        HistoryService,
        { provide: DESKTOP_ADAPTER, useClass: MockDesktopAdapter },
      ],
    });
  });

  it("should be created", inject(
    [HistoryService],
    (service: HistoryService) => {
      expect(service).toBeTruthy();
    }
  ));
});
