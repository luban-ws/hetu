import { TestBed, inject } from '@angular/core/testing';

import { UpdaterService } from '../updater.service';
import { DESKTOP_ADAPTER } from '@infrastructure/desktop-adapter';
import { MockDesktopAdapter } from '@infrastructure/mocks/mock-desktop-adapter';
import { StatusBarService } from '../status-bar.service';
import { MockStatusBar } from './mocks/mock-status-bar-service';
import { SimpleNotificationsModule } from 'angular2-notifications';

describe('UpdaterService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SimpleNotificationsModule.forRoot()
      ],
      providers: [
        UpdaterService,
        {provide: DESKTOP_ADAPTER, useClass: MockDesktopAdapter},
        {provide: StatusBarService, useClass: MockStatusBar},
      ]
    });
  });

  it('should be created', inject([UpdaterService], (service: UpdaterService) => {
    expect(service).toBeTruthy();
  }));
});
