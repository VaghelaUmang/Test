import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchByUSTablePage } from './search-by-us-table.page';

describe('SearchByUSTablePage', () => {
  let component: SearchByUSTablePage;
  let fixture: ComponentFixture<SearchByUSTablePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchByUSTablePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchByUSTablePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
