import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TutorViewEntryPage } from './tutor-view-entry.page';

describe('TutorViewEntryPage', () => {
  let component: TutorViewEntryPage;
  let fixture: ComponentFixture<TutorViewEntryPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TutorViewEntryPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TutorViewEntryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
