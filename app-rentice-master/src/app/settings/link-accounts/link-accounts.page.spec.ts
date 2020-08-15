import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkAccountsPage } from './link-accounts.page';

describe('LinkAccountsPage', () => {
  let component: LinkAccountsPage;
  let fixture: ComponentFixture<LinkAccountsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LinkAccountsPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LinkAccountsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
