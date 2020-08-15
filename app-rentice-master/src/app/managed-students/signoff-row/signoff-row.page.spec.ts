import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SignoffRowPage } from './signoff-row.page';

describe('SignoffRowPage', () => {
  let component: SignoffRowPage;
  let fixture: ComponentFixture<SignoffRowPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SignoffRowPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignoffRowPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
