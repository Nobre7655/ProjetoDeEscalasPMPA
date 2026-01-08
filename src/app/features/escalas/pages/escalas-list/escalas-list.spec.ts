import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EscalasList } from './escalas-list';

describe('EscalasList', () => {
  let component: EscalasList;
  let fixture: ComponentFixture<EscalasList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EscalasList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EscalasList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
