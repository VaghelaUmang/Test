import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesheetPage } from './timesheet.page';

describe('TimesheetPage', () => {
  let component: TimesheetPage;
  let fixture: ComponentFixture<TimesheetPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimesheetPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimesheetPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
