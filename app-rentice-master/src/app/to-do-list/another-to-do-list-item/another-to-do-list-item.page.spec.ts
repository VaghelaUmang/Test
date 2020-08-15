import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnotherToDoListItemPage } from './another-to-do-list-item.page';

describe('AnotherToDoListItemPage', () => {
  let component: AnotherToDoListItemPage;
  let fixture: ComponentFixture<AnotherToDoListItemPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnotherToDoListItemPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnotherToDoListItemPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
