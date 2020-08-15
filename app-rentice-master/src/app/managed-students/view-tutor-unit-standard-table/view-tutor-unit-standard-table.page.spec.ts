import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTutorUnitStandardTablePage } from './view-tutor-unit-standard-table.page';

describe('ViewTutorUnitStandardTablePage', () => {
  let component: ViewTutorUnitStandardTablePage;
  let fixture: ComponentFixture<ViewTutorUnitStandardTablePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewTutorUnitStandardTablePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewTutorUnitStandardTablePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
