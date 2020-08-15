import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentMenuPage } from './student-menu.page';

describe('StudentMenuPage', () => {
  let component: StudentMenuPage;
  let fixture: ComponentFixture<StudentMenuPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentMenuPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentMenuPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
