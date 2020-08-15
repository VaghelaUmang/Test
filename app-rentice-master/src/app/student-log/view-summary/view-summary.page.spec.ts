import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewSummaryPage } from './view-summary.page';

describe('ViewSummaryPage', () => {
  let component: ViewSummaryPage;
  let fixture: ComponentFixture<ViewSummaryPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewSummaryPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewSummaryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
