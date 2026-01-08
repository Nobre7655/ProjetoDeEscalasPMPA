import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EscalasForm } from './escalas-form';

describe('EscalasForm', () => {
  let component: EscalasForm;
  let fixture: ComponentFixture<EscalasForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EscalasForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EscalasForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
