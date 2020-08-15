import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ToDoListPage } from './to-do-list.page';

describe('ToDoListPage', () => {
  let component: ToDoListPage;
  let fixture: ComponentFixture<ToDoListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ToDoListPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToDoListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
