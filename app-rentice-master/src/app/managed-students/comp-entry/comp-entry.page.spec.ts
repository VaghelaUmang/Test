import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompEntryPage } from './comp-entry.page';

describe('CompEntryPage', () => {
  let component: CompEntryPage;
  let fixture: ComponentFixture<CompEntryPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompEntryPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompEntryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
