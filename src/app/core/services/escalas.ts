// src/app/core/services/escalas.ts
import { Injectable } from '@angular/core';
import { Escala } from '../models/escala.model';

const STORAGE_KEY = 'pmpa_escalas_v1';

@Injectable({ providedIn: 'root' })
export class EscalasService {
  listar(): Escala[] {
    return this.read();
  }

  criar(nova: Omit<Escala, 'id'>): Escala {
    const escalas = this.read();
    const escala: Escala = { id: crypto.randomUUID(), ...nova };
    escalas.unshift(escala);
    this.write(escalas);
    return escala;
  }

  remover(id: string): void {
    const escalas = this.read().filter(e => e.id !== id);
    this.write(escalas);
  }

  private read(): Escala[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as Escala[];
    } catch {
      return [];
    }
  }

  private write(data: Escala[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}
