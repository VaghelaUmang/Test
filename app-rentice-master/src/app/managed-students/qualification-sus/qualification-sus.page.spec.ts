import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QualificationSusPage } from './qualification-sus.page';

describe('QualificationSusPage', () => {
  let component: QualificationSusPage;
  let fixture: ComponentFixture<QualificationSusPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QualificationSusPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QualificationSusPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
