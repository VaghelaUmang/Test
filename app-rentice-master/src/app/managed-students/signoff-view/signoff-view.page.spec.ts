import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SignoffViewPage } from './signoff-view.page';

describe('SignoffViewPage', () => {
  let component: SignoffViewPage;
  let fixture: ComponentFixture<SignoffViewPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SignoffViewPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignoffViewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
