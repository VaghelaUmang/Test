import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestReviewPage } from './request-review.page';

describe('RequestReviewPage', () => {
  let component: RequestReviewPage;
  let fixture: ComponentFixture<RequestReviewPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RequestReviewPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestReviewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
