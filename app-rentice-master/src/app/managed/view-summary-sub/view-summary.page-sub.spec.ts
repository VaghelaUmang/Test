import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffViewSummarySubPage } from './view-summary-sub.page';

describe('StaffViewSummarySubPage', () => {
  let component: StaffViewSummarySubPage;
  let fixture: ComponentFixture<StaffViewSummarySubPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StaffViewSummarySubPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaffViewSummarySubPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
