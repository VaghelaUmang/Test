import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestSummaryPage } from './request-summary.page';

describe('RequestSummaryPage', () => {
  let component: RequestSummaryPage;
  let fixture: ComponentFixture<RequestSummaryPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RequestSummaryPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestSummaryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
