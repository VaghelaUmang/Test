import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QualificationUsPage } from './qualification-us.page';

describe('QualificationUsPage', () => {
  let component: QualificationUsPage;
  let fixture: ComponentFixture<QualificationUsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QualificationUsPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QualificationUsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
