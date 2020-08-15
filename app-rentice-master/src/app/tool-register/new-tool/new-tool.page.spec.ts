import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewToolPage } from './new-tool.page';

describe('NewToolPage', () => {
  let component: NewToolPage;
  let fixture: ComponentFixture<NewToolPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewToolPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewToolPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
