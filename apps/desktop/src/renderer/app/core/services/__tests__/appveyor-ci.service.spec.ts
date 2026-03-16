import { TestBed, inject } from '@angular/core/testing';

import { AppveyorCiService } from '../appveyor-ci.service';
import { MockDesktopAdapter } from '@infrastructure/mocks/mock-desktop-adapter';
import { DESKTOP_ADAPTER } from '@infrastructure/desktop-adapter';
import { SimpleNotificationsModule } from 'angular2-notifications';
import { MockLoading } from '../../infrastructure/mocks/mock-loading-service';
import { LoadingService } from '../../../infrastructure/loading-service.service';

describe('AppveyorCiService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SimpleNotificationsModule.forRoot(),
      ],
      providers: [
        AppveyorCiService,
        { provide: DESKTOP_ADAPTER, useClass: MockDesktopAdapter },
        { provide: LoadingService, useClass: MockLoading },
      ]
    });
  });

  it('should be created', inject([AppveyorCiService], (service: AppveyorCiService) => {
    expect(service).toBeTruthy();
  }));
});
