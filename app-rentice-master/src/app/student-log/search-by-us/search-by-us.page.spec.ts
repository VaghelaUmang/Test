import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchByUsPage } from './search-by-us.page';

describe('SearchByUsPage', () => {
  let component: SearchByUsPage;
  let fixture: ComponentFixture<SearchByUsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchByUsPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchByUsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
