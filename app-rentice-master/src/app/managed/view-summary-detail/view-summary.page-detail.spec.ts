import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffViewSummaryDetailPage } from './view-summary-detail.page';

describe('StaffViewSummaryDetailPage', () => {
  let component: StaffViewSummaryDetailPage;
  let fixture: ComponentFixture<StaffViewSummaryDetailPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StaffViewSummaryDetailPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaffViewSummaryDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
