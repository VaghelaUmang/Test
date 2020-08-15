import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditToDoListPage } from './edit-to-do-list.page';

describe('EditToDoListPage', () => {
  let component: EditToDoListPage;
  let fixture: ComponentFixture<EditToDoListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditToDoListPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditToDoListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
