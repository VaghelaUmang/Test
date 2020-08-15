import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditToDoListItemPage } from './edit-to-do-list-item.page';

describe('EditToDoListItemPage', () => {
  let component: EditToDoListItemPage;
  let fixture: ComponentFixture<EditToDoListItemPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditToDoListItemPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditToDoListItemPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
