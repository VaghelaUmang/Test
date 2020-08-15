import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkEmployerPage } from './link-employer.page';

describe('LinkEmployerPage', () => {
  let component: LinkEmployerPage;
  let fixture: ComponentFixture<LinkEmployerPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LinkEmployerPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LinkEmployerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
