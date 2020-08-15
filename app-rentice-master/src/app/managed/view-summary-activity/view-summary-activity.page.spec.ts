import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffViewSummaryActivityPage } from './view-summary-activity.page';

describe('StaffViewSummaryActivityPage', () => {
  let component: StaffViewSummaryActivityPage;
  let fixture: ComponentFixture<StaffViewSummaryActivityPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StaffViewSummaryActivityPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaffViewSummaryActivityPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
