import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SignoffQualPage } from './signoff-qual.page';

describe('SignoffQualPage', () => {
  let component: SignoffQualPage;
  let fixture: ComponentFixture<SignoffQualPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SignoffQualPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignoffQualPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
