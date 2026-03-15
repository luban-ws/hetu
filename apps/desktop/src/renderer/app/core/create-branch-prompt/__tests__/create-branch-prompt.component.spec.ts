import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { CreateBranchPromptComponent } from '../create-branch-prompt.component';
import { FormsModule } from '@angular/forms';

describe('CreateBranchPromptComponent', () => {
  let component: CreateBranchPromptComponent;
  let fixture: ComponentFixture<CreateBranchPromptComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [ CreateBranchPromptComponent ],
      imports: [
        FormsModule
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(CreateBranchPromptComponent, {
      set: {
        template: '<div>Test</div>',
        styleUrls: []
      }
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateBranchPromptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
