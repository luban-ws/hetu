import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCommentPromptComponent } from '../add-comment-prompt.component';
import { JiraIntegrationService } from '../../services/jira-integration.service';
import { MockJira } from '../../../core/infrastructure/mocks/mock-jira-service';
import { FormsModule } from '@angular/forms';

describe('AddCommentPromptComponent', () => {
  let component: AddCommentPromptComponent;
  let fixture: ComponentFixture<AddCommentPromptComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule
      ],
      declarations: [ AddCommentPromptComponent ],
      providers: [
        {provide: JiraIntegrationService, useClass: MockJira}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCommentPromptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
