import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnotherEntryPage } from './another-entry.page';

describe('AnotherEntryPage', () => {
  let component: AnotherEntryPage;
  let fixture: ComponentFixture<AnotherEntryPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnotherEntryPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnotherEntryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
