import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfolioListPage } from './portfolio-list.page';

describe('PortfolioListPage', () => {
  let component: PortfolioListPage;
  let fixture: ComponentFixture<PortfolioListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PortfolioListPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PortfolioListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
