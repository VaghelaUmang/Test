import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestViewSlEntryPage } from './view-sl-entry.page';

describe('RequestViewSlEntryPage', () => {
  let component: RequestViewSlEntryPage;
  let fixture: ComponentFixture<RequestViewSlEntryPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RequestViewSlEntryPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestViewSlEntryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
