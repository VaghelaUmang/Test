import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscountsPage } from './discounts.page';

describe('DiscountsPage', () => {
  let component: DiscountsPage;
  let fixture: ComponentFixture<DiscountsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiscountsPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiscountsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
