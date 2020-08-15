import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditToolPage } from './edit-tool.page';

describe('EditToolPage', () => {
  let component: EditToolPage;
  let fixture: ComponentFixture<EditToolPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditToolPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditToolPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
