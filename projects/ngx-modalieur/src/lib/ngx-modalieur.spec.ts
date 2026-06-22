import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxModalieur } from './ngx-modalieur';

describe('NgxModalieur', () => {
  let component: NgxModalieur;
  let fixture: ComponentFixture<NgxModalieur>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxModalieur],
    }).compileComponents();

    fixture = TestBed.createComponent(NgxModalieur);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
