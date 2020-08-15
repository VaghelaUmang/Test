import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewPortfolioListPage } from './new-portfolio-list.page';

describe('NewPortfolioListPage', () => {
  let component: NewPortfolioListPage;
  let fixture: ComponentFixture<NewPortfolioListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewPortfolioListPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewPortfolioListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
