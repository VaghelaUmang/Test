import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UsEntryPage } from './us-entry.page';

describe('UsEntryPage', () => {
  let component: UsEntryPage;
  let fixture: ComponentFixture<UsEntryPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UsEntryPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsEntryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
