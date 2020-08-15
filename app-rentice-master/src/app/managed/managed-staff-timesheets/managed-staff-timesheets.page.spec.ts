import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagedStaffTimesheetsPage } from './managed-staff-timesheets.page';

describe('ManagedStaffTimesheetsPage', () => {
  let component: ManagedStaffTimesheetsPage;
  let fixture: ComponentFixture<ManagedStaffTimesheetsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManagedStaffTimesheetsPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManagedStaffTimesheetsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
