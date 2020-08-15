import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSlEntryPage } from './edit-sl-entry.page';

describe('EditSlEntryPage', () => {
  let component: EditSlEntryPage;
  let fixture: ComponentFixture<EditSlEntryPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditSlEntryPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditSlEntryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
