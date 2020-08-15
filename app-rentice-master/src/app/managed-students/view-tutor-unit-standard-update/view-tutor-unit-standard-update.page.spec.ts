import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTutorUnitStandardUpdatePage } from './view-tutor-unit-standard-update.page';

describe('ViewTutorUnitStandardUpdatePage', () => {
  let component: ViewTutorUnitStandardUpdatePage;
  let fixture: ComponentFixture<ViewTutorUnitStandardUpdatePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewTutorUnitStandardUpdatePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewTutorUnitStandardUpdatePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
