import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BadRouteComponent } from './bad-route.component';

describe('BadRouteComponent', () => {
  let component: BadRouteComponent;
  let fixture: ComponentFixture<BadRouteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BadRouteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BadRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
