import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierPage } from './supplier.page';

describe('SupplierPage', () => {
  let component: SupplierPage;
  let fixture: ComponentFixture<SupplierPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SupplierPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SupplierPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
