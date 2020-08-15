import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewStaffUnitStandardPage } from './view-staff-unit-standard.page';

describe('ViewStaffUnitStandardPage', () => {
  let component: ViewStaffUnitStandardPage;
  let fixture: ComponentFixture<ViewStaffUnitStandardPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewStaffUnitStandardPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewStaffUnitStandardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
