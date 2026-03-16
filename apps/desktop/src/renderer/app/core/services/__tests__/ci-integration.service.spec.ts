import { TestBed, inject } from '@angular/core/testing';

import { CiIntegrationService } from '../ci-integration.service';
import { DESKTOP_ADAPTER } from '@infrastructure/desktop-adapter';
import { StatusBarService } from '../../../infrastructure/status-bar.service';
import { RepoService } from '../repo.service';
import { MockDesktopAdapter } from '@infrastructure/mocks/mock-desktop-adapter';
import { MockRepo } from '../mocks/mock-repo-service';
import { MockStatusBar } from '../../infrastructure/mocks/mock-status-bar-service';

describe('CiIntegrationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CiIntegrationService,
        {provide: DESKTOP_ADAPTER, useClass: MockDesktopAdapter},
        {provide: StatusBarService, useClass: MockStatusBar},
        {provide: RepoService, useClass: MockRepo}
      ]
    });
  });

  it('should be created', inject([CiIntegrationService], (service: CiIntegrationService) => {
    expect(service).toBeTruthy();
  }));
});
