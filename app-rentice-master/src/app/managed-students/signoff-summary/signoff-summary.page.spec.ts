import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SignoffSummaryPage } from './signoff-summary.page';

describe('SignoffSummaryPage', () => {
  let component: SignoffSummaryPage;
  let fixture: ComponentFixture<SignoffSummaryPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SignoffSummaryPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignoffSummaryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
