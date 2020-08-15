import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTsEntryPage } from './edit-ts-entry.page';

describe('EditTsEntryPage', () => {
  let component: EditTsEntryPage;
  let fixture: ComponentFixture<EditTsEntryPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditTsEntryPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditTsEntryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
