import { TestBed, inject } from '@angular/core/testing';

import { CommitSelectionService } from './commit-selection.service';
import { MockPromptInjector } from '../../infrastructure/mocks/mock-prompt-injector-service';
import { CredentialsService } from './credentials.service';
import { MockCredential } from '../mocks/mock-credential-service';
import { SimpleNotificationsModule } from '../../../../node_modules/angular2-notifications';
import { DESKTOP_ADAPTER } from '@infrastructure/desktop-adapter';
import { PromptInjectorService } from '../../infrastructure/prompt-injector.service';
import { MockDesktopAdapter } from '@infrastructure/mocks/mock-desktop-adapter';
import { IPC_EVENTS } from '@infrastructure/ipc-events';

describe('CommitSelectionService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SimpleNotificationsModule.forRoot()
      ],
      providers: [
        CommitSelectionService,
        {provide: DESKTOP_ADAPTER, useClass: MockDesktopAdapter},
        {provide: PromptInjectorService, useClass: MockPromptInjector},
        {provide: CredentialsService, useClass: MockCredential}
      ]
    });
  });

  it('should be created', inject([CommitSelectionService], (service: CommitSelectionService) => {
    expect(service).toBeTruthy();
  }));

  it('should set selectedCommit to null and emit changes on repo closed', inject([CommitSelectionService], (service: CommitSelectionService) => {
    let emit = false;
    let adapter = TestBed.get(DESKTOP_ADAPTER) as MockDesktopAdapter;
    service.selectionChange.subscribe(s => {
      emit = true;
    });
    adapter.receiveEvent(IPC_EVENTS.REPO.CLOSED, {});

    expect(service.selectedCommit).toBeNull();
    expect(emit).toBeTruthy();
  }));
  it('should set selectedCommit to null and emit changes on repo opened', inject([CommitSelectionService], (service: CommitSelectionService) => {
    let emit = false;
    let adapter = TestBed.get(DESKTOP_ADAPTER) as MockDesktopAdapter;
    service.selectionChange.subscribe(s => {
      emit = true;
    });
    adapter.receiveEvent(IPC_EVENTS.REPO.OPEN_SUCCESSFUL, {});

    expect(service.selectedCommit).toBeNull();
    expect(emit).toBeTruthy();
  }));
});
