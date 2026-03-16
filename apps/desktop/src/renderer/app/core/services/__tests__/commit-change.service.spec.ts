import { TestBed, inject } from '@angular/core/testing';

import { CommitChangeService } from './commit-change.service';
import { MockCommitSelection } from '../mocks/mock-commit-selection-service';
import { HotkeysService } from '../../../../node_modules/angular2-hotkeys';
import { MockHotkeys } from '../mocks/mock-hotkeys-service';
import { LoadingService } from '../../infrastructure/loading-service.service';
import { MockLoading } from '../../infrastructure/mocks/mock-loading-service';
import { CommitSelectionService } from './commit-selection.service';
import { CredentialsService } from './credentials.service';
import { DESKTOP_ADAPTER } from '@infrastructure/desktop-adapter';
import { MockDesktopAdapter } from '@infrastructure/mocks/mock-desktop-adapter';
import { MockCredential } from '../mocks/mock-credential-service';
import { SimpleNotificationsModule } from '../../../../node_modules/angular2-notifications';
import { RouterTestingModule } from '../../../../node_modules/@angular/router/testing';
import { IPC_EVENTS } from '@infrastructure/ipc-events';

describe('CommitChangeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SimpleNotificationsModule.forRoot(),
        RouterTestingModule,
      ],
      providers: [
        CommitChangeService,
        {provide: DESKTOP_ADAPTER, useClass: MockDesktopAdapter},
        {provide: CredentialsService, useClass: MockCredential},
        {provide: CommitSelectionService, useClass: MockCommitSelection},
        {provide: HotkeysService, useClass: MockHotkeys},
        {provide: LoadingService, useClass: MockLoading}
      ]
    });
  });

  it('should be created', inject([CommitChangeService], (service: CommitChangeService) => {
    expect(service).toBeTruthy();
  }));

  it('should emit popped when Repo-Popped', inject([CommitChangeService], (service: CommitChangeService)  => {
    let adapter = TestBed.get(DESKTOP_ADAPTER) as MockDesktopAdapter;
    let emit = false;
    service.popped.subscribe(() => {
      emit = true;
    });

    adapter.receiveEvent(IPC_EVENTS.REPO.POPPED, {});

    expect(emit).toBeTruthy();
  }));
});
