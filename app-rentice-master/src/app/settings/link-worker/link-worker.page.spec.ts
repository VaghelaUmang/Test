import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkWorkerPage } from './link-worker.page';

describe('LinkWorkerPage', () => {
  let component: LinkWorkerPage;
  let fixture: ComponentFixture<LinkWorkerPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LinkWorkerPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LinkWorkerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
