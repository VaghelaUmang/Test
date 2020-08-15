import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPortfolioPage } from './edit-portfolio.page';

describe('EditPortfolioPage', () => {
  let component: EditPortfolioPage;
  let fixture: ComponentFixture<EditPortfolioPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditPortfolioPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditPortfolioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
