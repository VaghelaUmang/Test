import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentLogTablePage } from './student-log-table.page';

describe('StudentLogTablePage', () => {
  let component: StudentLogTablePage;
  let fixture: ComponentFixture<StudentLogTablePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentLogTablePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentLogTablePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
