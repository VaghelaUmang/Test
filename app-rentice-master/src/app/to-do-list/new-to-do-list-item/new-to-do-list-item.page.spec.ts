import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewToDoListItemPage } from './new-to-do-list-item.page';

describe('NewToDoListItemPage', () => {
  let component: NewToDoListItemPage;
  let fixture: ComponentFixture<NewToDoListItemPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewToDoListItemPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewToDoListItemPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
