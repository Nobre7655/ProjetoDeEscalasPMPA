// src/app/core/services/escalas.ts
import { Injectable } from '@angular/core';
import { Anexo, Escala, ExtraTipo, TipoEscala, Turno } from '../models/escala.model';

type NovaEscalaInput = {
  data: string;
  turno: Turno;
  tipo: TipoEscala;
  extraTipo?: ExtraTipo | null;
  guarnicao: string;
  observacao?: string;
  createdBy?: string;
};

@Injectable({ providedIn: 'root' })
export class EscalasService {
  private readonly key = 'pmpa_escalas_v1';

  listar(data?: string): Escala[] {
    const all = this.read().sort((a, b) => (a.data < b.data ? 1 : -1));
    return data ? all.filter(e => e.data === data) : all;
  }

  getById(id: string): Escala | null {
    return this.read().find(e => e.id === id) ?? null;
  }

  // ✅ compatível com seu código atual (salvar)
  salvar(input: NovaEscalaInput): Escala {
    const all = this.read();
    const escala: Escala = {
      id: this.newId(),
      data: input.data,
      turno: input.turno,
      tipo: input.tipo,
      extraTipo: input.extraTipo ?? null,
      guarnicao: input.guarnicao,
      observacao: input.observacao,
      relatorio: '',
      anexos: [],
      createdAt: new Date().toISOString(),
      createdBy: input.createdBy,
    };
    all.push(escala);
    this.write(all);
    return escala;
  }

  // ✅ compatível com arquivos antigos que chamam "criar"
  criar(input: NovaEscalaInput): Escala {
    return this.salvar(input);
  }

  atualizar(id: string, patch: Partial<Escala>): Escala | null {
    const all = this.read();
    const idx = all.findIndex(e => e.id === id);
    if (idx === -1) return null;

    all[idx] = { ...all[idx], ...patch };
    this.write(all);
    return all[idx];
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

  private write(data: Escala[]) {
    localStorage.setItem(this.key, JSON.stringify(data));
  }

  private newId(): string {
    return (globalThis.crypto?.randomUUID?.() ??
      `${Date.now()}-${Math.random().toString(16).slice(2)}`);
  }
}
