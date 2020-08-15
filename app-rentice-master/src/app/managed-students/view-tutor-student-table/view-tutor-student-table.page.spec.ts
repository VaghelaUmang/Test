import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTutorStudentTablePage } from './view-tutor-student-table.page';

describe('ViewTutorStudentTablePage', () => {
  let component: ViewTutorStudentTablePage;
  let fixture: ComponentFixture<ViewTutorStudentTablePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewTutorStudentTablePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewTutorStudentTablePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
