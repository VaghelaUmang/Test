import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewProjectPage } from './view-project.page';

describe('ViewProjectPage', () => {
  let component: ViewProjectPage;
  let fixture: ComponentFixture<ViewProjectPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewProjectPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewProjectPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
