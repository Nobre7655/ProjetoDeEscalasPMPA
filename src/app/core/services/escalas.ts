// src/app/core/services/escalas.ts

import { Injectable } from '@angular/core';
import { Anexo, Escala, ExtraTipo, TipoEscala, Turno } from '../models/escala.model';

export type EscalaCreateDTO = {
  data: string;
  turno: Turno;
  tipo: TipoEscala;
  extraTipo?: ExtraTipo | null;
  guarnicao: string;
  observacao?: string;
  createdBy?: string;
};

export type EscalaUpdatePatch = Partial<Pick<
  Escala,
  'data' | 'turno' | 'tipo' | 'extraTipo' | 'guarnicao' | 'observacao' | 'relatorio' | 'anexos'
>>;

@Injectable({ providedIn: 'root' })
export class EscalasService {
  private readonly key = 'pmpa_escalas_v2';

  listar(date?: string): Escala[] {
    const all = this.readAll();

    const filtered = date
      ? all.filter(e => e.data === date)
      : all;

    // ordena por data e turno
    return filtered.sort((a, b) => {
      if (a.data !== b.data) return a.data.localeCompare(b.data);
      return a.turno.localeCompare(b.turno);
    });
  }

  getById(id: string): Escala | null {
    const all = this.readAll();
    return all.find(e => e.id === id) ?? null;
  }

  // ✅ compatibilidade (você tinha "salvar" em alguns lugares)
  salvar(dto: EscalaCreateDTO): Escala {
    return this.criar(dto);
  }

  // ✅ compatibilidade (você tinha "criar" em outros lugares)
  criar(dto: EscalaCreateDTO): Escala {
    const now = new Date().toISOString();

    const escala: Escala = {
      id: this.newId(),
      data: dto.data,
      turno: dto.turno,
      tipo: dto.tipo,
      extraTipo: dto.tipo === 'EXTRA' ? (dto.extraTipo ?? undefined) : undefined,
      guarnicao: dto.guarnicao,
      observacao: dto.observacao?.trim() ? dto.observacao.trim() : undefined,
      relatorio: undefined,
      anexos: [],
      createdAt: now,
      updatedAt: now,
      createdBy: dto.createdBy,
    };

    const all = this.readAll();
    all.push(escala);
    this.writeAll(all);

    return escala;
  }

  // ✅ resolve: "A propriedade atualizar não existe"
  atualizar(id: string, patch: EscalaUpdatePatch): Escala | null {
    const all = this.readAll();
    const idx = all.findIndex(e => e.id === id);
    if (idx < 0) return null;

    const current = all[idx];
    const next: Escala = {
      ...current,
      ...patch,
      extraTipo: (patch.tipo ?? current.tipo) === 'EXTRA'
        ? (patch.extraTipo ?? current.extraTipo)
        : undefined,
      updatedAt: new Date().toISOString(),
    };

    all[idx] = next;
    this.writeAll(all);
    return next;
  }

  remover(id: string) {
    const all = this.readAll();
    this.writeAll(all.filter(e => e.id !== id));
  }

  // helpers
  private readAll(): Escala[] {
    try {
      const raw = localStorage.getItem(this.key);
      return raw ? (JSON.parse(raw) as Escala[]) : [];
    } catch {
      return [];
    }
  }

  private writeAll(all: Escala[]) {
    localStorage.setItem(this.key, JSON.stringify(all));
  }

  private newId(): string {
    return (globalThis.crypto?.randomUUID?.() ??
      `${Date.now()}-${Math.random().toString(16).slice(2)}`);
  }
}
