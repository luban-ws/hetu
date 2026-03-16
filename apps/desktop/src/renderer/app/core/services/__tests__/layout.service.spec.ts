import { TestBed, inject } from '@angular/core/testing';

import { LayoutService } from '../layout.service';
import { DESKTOP_ADAPTER } from '@infrastructure/desktop-adapter';
import { MockDesktopAdapter } from '@infrastructure/mocks/mock-desktop-adapter';
import { HotkeysService } from 'angular2-hotkeys';
import { MockHotkeys } from '../../infrastructure/mocks/mock-hotkeys-service';

describe('LayoutService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LayoutService,
        {provide: DESKTOP_ADAPTER, useClass: MockDesktopAdapter},
        {provide: HotkeysService, useClass: MockHotkeys}
      ]
    });
  });

  it('should be created', inject([LayoutService], (service: LayoutService) => {
    expect(service).toBeTruthy();
  }));
});
