import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewPortfolioPage } from './new-portfolio.page';

describe('NewPortfolioPage', () => {
  let component: NewPortfolioPage;
  let fixture: ComponentFixture<NewPortfolioPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewPortfolioPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewPortfolioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
