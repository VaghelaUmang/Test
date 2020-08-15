import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewToDoListPage } from './new-to-do-list.page';

describe('NewToDoListPage', () => {
  let component: NewToDoListPage;
  let fixture: ComponentFixture<NewToDoListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewToDoListPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewToDoListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
