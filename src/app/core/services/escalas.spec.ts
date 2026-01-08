import { TestBed } from '@angular/core/testing';

import { Escalas } from './escalas';

describe('Escalas', () => {
  let service: Escalas;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Escalas);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
