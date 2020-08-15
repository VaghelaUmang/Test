import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewManagedEntryPage } from './view-managed-entry.page';

describe('ViewManagedEntryPage', () => {
  let component: ViewManagedEntryPage;
  let fixture: ComponentFixture<ViewManagedEntryPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewManagedEntryPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewManagedEntryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
