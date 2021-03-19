import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PowerIconComponent } from './power-icon.component';

describe('PowerIconComponent', () => {
  let component: PowerIconComponent;
  let fixture: ComponentFixture<PowerIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PowerIconComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PowerIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
