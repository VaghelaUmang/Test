import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTsEntryPage } from './view-ts-entry.page';

describe('ViewTsEntryPage', () => {
  let component: ViewTsEntryPage;
  let fixture: ComponentFixture<ViewTsEntryPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewTsEntryPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewTsEntryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
