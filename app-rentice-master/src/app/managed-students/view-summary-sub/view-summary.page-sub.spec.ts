import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TutorViewSummarySubPage } from './view-summary-sub.page';

describe('TutorViewSummarySubPage', () => {
  let component: TutorViewSummarySubPage;
  let fixture: ComponentFixture<TutorViewSummarySubPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TutorViewSummarySubPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TutorViewSummarySubPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
