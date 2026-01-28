// src/app/core/services/escalas.ts

import { Injectable } from '@angular/core';
import { Escala } from '../models/escala.model';

type CreateEscala = Omit<Escala, 'id'> & { id?: string };

@Injectable({ providedIn: 'root' })
export class EscalasService {
  private readonly key = 'pmpa_escalas_v1';

  listar(date?: string): Escala[] {
    const all = this.read();

    const filtered = date ? all.filter(e => e.data === date) : all;

    // ordena por data e depois turno (opcional)
    return filtered.sort((a, b) => {
      if (a.data !== b.data) return a.data.localeCompare(b.data);
      return a.turno.localeCompare(b.turno);
    });
  }

  getById(id: string): Escala | undefined {
    return this.read().find(e => e.id === id);
  }

  // ✅ alguns lugares do projeto chamam "criar"
  criar(payload: CreateEscala): Escala {
    const all = this.read();

    const escala: Escala = {
      ...payload,
      id: payload.id ?? this.newId(),
      anexos: payload.anexos ?? [],
    };

    all.push(escala);
    this.write(all);
    return escala;
  }

  // ✅ outros lugares chamam "salvar"
  salvar(payload: CreateEscala): Escala {
    return this.criar(payload);
  }

  atualizar(id: string, patch: Partial<Escala>): void {
    const all = this.read();
    const idx = all.findIndex(e => e.id === id);
    if (idx < 0) return;

    all[idx] = { ...all[idx], ...patch };
    this.write(all);
  }

  remover(id: string): void {
    const all = this.read().filter(e => e.id !== id);
    this.write(all);
  }

  // ----------------------

  private read(): Escala[] {
    try {
      const raw = localStorage.getItem(this.key);
      return raw ? (JSON.parse(raw) as Escala[]) : [];
    } catch {
      return [];
    }
  }

  private write(all: Escala[]) {
    localStorage.setItem(this.key, JSON.stringify(all));
  }

  private newId(): string {
    return (globalThis.crypto?.randomUUID?.() ??
      `${Date.now()}-${Math.random().toString(16).slice(2)}`);
  }
}
