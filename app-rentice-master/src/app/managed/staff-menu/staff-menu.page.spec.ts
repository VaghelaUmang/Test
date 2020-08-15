import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffMenuPage } from './staff-menu.page';

describe('StaffMenuPage', () => {
  let component: StaffMenuPage;
  let fixture: ComponentFixture<StaffMenuPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StaffMenuPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaffMenuPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
