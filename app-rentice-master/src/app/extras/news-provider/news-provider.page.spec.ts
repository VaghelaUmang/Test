import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsProviderPage } from './news-provider.page';

describe('NewsProviderPage', () => {
  let component: NewsProviderPage;
  let fixture: ComponentFixture<NewsProviderPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewsProviderPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewsProviderPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
