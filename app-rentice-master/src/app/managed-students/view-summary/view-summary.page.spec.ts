import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TutorViewSummaryPage } from './view-summary.page';

describe('TutorViewSummaryPage', () => {
  let component: TutorViewSummaryPage;
  let fixture: ComponentFixture<TutorViewSummaryPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TutorViewSummaryPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TutorViewSummaryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
