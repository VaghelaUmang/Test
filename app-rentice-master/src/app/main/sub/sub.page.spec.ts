import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubPage } from './sub.page';

describe('SubPage', () => {
  let component: SubPage;
  let fixture: ComponentFixture<SubPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
