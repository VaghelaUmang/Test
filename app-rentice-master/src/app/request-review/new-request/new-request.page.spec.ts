import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewRequestPage } from './new-request.page';

describe('NewRequestPage', () => {
  let component: NewRequestPage;
  let fixture: ComponentFixture<NewRequestPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewRequestPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewRequestPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
