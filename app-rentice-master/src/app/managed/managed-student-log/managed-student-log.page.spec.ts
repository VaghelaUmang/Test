import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagedStudentLogPage } from './managed-student-log.page';

describe('ManagedStudentLogPage', () => {
  let component: ManagedStudentLogPage;
  let fixture: ComponentFixture<ManagedStudentLogPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManagedStudentLogPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManagedStudentLogPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
