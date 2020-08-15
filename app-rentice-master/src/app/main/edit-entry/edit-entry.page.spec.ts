import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditEntryPage } from './edit-entry.page';

describe('EditEntryPage', () => {
  let component: EditEntryPage;
  let fixture: ComponentFixture<EditEntryPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditEntryPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditEntryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
