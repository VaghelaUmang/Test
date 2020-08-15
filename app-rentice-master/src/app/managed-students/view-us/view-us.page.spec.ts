import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewUsPage } from './view-us.page';

describe('ViewUsPage', () => {
  let component: ViewUsPage;
  let fixture: ComponentFixture<ViewUsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewUsPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewUsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
