import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewToDoListPage } from './view-to-do-list.page';

describe('ViewToDoListPage', () => {
  let component: ViewToDoListPage;
  let fixture: ComponentFixture<ViewToDoListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewToDoListPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewToDoListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
