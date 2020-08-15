import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TutorViewSummaryDetailPage } from './view-summary-detail.page';

describe('TutorViewSummaryDetailPage', () => {
  let component: TutorViewSummaryDetailPage;
  let fixture: ComponentFixture<TutorViewSummaryDetailPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TutorViewSummaryDetailPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TutorViewSummaryDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
