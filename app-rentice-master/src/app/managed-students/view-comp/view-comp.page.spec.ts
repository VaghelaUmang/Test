import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCompPage } from './view-comp.page';

describe('ViewCompPage', () => {
  let component: ViewCompPage;
  let fixture: ComponentFixture<ViewCompPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewCompPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewCompPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
