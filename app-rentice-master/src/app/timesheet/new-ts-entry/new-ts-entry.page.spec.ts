import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewTsEntryPage } from './new-ts-entry.page';

describe('NewTsEntryPage', () => {
  let component: NewTsEntryPage;
  let fixture: ComponentFixture<NewTsEntryPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewTsEntryPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewTsEntryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
