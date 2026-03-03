import { TestBed } from '@angular/core/testing';
import { RelatoriosComponent } from './relatorios';

describe('RelatoriosComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelatoriosComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(RelatoriosComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});