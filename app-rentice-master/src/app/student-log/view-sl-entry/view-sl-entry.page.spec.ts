import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewSlEntryPage } from './view-sl-entry.page';

describe('ViewSlEntryPage', () => {
  let component: ViewSlEntryPage;
  let fixture: ComponentFixture<ViewSlEntryPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewSlEntryPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewSlEntryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
