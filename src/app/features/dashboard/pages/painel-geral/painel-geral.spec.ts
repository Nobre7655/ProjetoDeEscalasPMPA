import { TestBed } from '@angular/core/testing';
import { PainelGeralComponent } from './painel-geral';

describe('PainelGeralComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PainelGeralComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(PainelGeralComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});