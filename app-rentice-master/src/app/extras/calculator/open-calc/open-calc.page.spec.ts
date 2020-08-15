import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenCalcPage } from './open-calc.page';

describe('OpenCalcPage', () => {
  let component: OpenCalcPage;
  let fixture: ComponentFixture<OpenCalcPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpenCalcPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenCalcPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
