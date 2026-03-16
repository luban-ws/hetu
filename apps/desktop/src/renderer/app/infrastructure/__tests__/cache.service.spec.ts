import { TestBed, inject } from '@angular/core/testing';

import { CacheService } from './cache.service';
import { DESKTOP_ADAPTER } from '@infrastructure/desktop-adapter';
import { MockDesktopAdapter } from '@infrastructure/mocks/mock-desktop-adapter';
import { StatusBarService } from './status-bar.service';
import { MockStatusBar } from './mocks/mock-status-bar-service';

describe('CacheService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CacheService,
        {provide: DESKTOP_ADAPTER, useClass: MockDesktopAdapter},
        {provide: StatusBarService, useClass: MockStatusBar}
      ],
    });
  });

  it('should be created', inject([CacheService], (service: CacheService) => {
    expect(service).toBeTruthy();
  }));
});
