import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEntryPage } from './create-entry.page';

describe('CreateEntryPage', () => {
  let component: CreateEntryPage;
  let fixture: ComponentFixture<CreateEntryPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateEntryPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateEntryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
