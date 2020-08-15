import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SignoffViviewentryPage } from './signoff-viviewentry.page';

describe('SignoffViviewentryPage', () => {
  let component: SignoffViviewentryPage;
  let fixture: ComponentFixture<SignoffViviewentryPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SignoffViviewentryPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignoffViviewentryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
