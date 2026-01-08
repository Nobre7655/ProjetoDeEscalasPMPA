import { Injectable } from '@angular/core';
import { Escala } from '../models/escala.model';

@Injectable({ providedIn: 'root' })
export class EscalasService {
  private readonly key = 'pmpa_escalas_v1';

  listar(date?: string): Escala[] {
    const all = this.read();
    return date ? all.filter(e => e.data === date) : all;
  }

  // ✅ novo: mantém compatibilidade com o escalas-form.ts
  criar(dto: Omit<Escala, 'id'>): Escala {
    return this.salvar(dto);
  }

  salvar(dto: Omit<Escala, 'id'>): Escala {
    const all = this.read();
    const item: Escala = { id: this.newId(), ...dto };
    all.push(item);
    this.write(all);
    return item;
  }

  remover(id: string) {
    const all = this.read().filter(e => e.id !== id);
    this.write(all);
  }

  private read(): Escala[] {
    try {
      const raw = localStorage.getItem(this.key);
      return raw ? (JSON.parse(raw) as Escala[]) : [];
    } catch {
      return [];
    }
  }

  private write(list: Escala[]) {
    localStorage.setItem(this.key, JSON.stringify(list));
  }

  private newId(): string {
    return (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`);
  }
}
