import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagedPage } from './managed.page';

describe('ManagedPage', () => {
  let component: ManagedPage;
  let fixture: ComponentFixture<ManagedPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManagedPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManagedPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
