import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPortfolioListPage } from './edit-portfolio-list.page';

describe('EditPortfolioListPage', () => {
  let component: EditPortfolioListPage;
  let fixture: ComponentFixture<EditPortfolioListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditPortfolioListPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditPortfolioListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
