import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewSignoffPage } from './new-signoff.page';

describe('NewSignoffPage', () => {
  let component: NewSignoffPage;
  let fixture: ComponentFixture<NewSignoffPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewSignoffPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewSignoffPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
