import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTutorUnitStandardPage } from './view-tutor-unit-standard.page';

describe('ViewTutorUnitStandardPage', () => {
  let component: ViewTutorUnitStandardPage;
  let fixture: ComponentFixture<ViewTutorUnitStandardPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewTutorUnitStandardPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewTutorUnitStandardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
