import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { ForcePushPromptComponent } from '../force-push-prompt.component';

describe('ForcePushPromptComponent', () => {
  let component: ForcePushPromptComponent;
  let fixture: ComponentFixture<ForcePushPromptComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [ ForcePushPromptComponent ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(ForcePushPromptComponent, {
      set: {
        template: '<div>Test</div>',
        styleUrls: []
      }
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ForcePushPromptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
