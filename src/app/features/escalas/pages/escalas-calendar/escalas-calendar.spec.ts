import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EscalasCalendar } from './escalas-calendar';

describe('EscalasCalendar', () => {
  let component: EscalasCalendar;
  let fixture: ComponentFixture<EscalasCalendar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EscalasCalendar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EscalasCalendar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
