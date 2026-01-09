// src/app/core/services/relatorios.ts
import { Injectable } from '@angular/core';

export interface RelatorioAnexo {
  name: string;
  mime: string;
  size: number;
  dataUrl: string; // base64 (data:)
}

export interface RelatorioEscala {
  escalaId: string;
  texto: string;
  anexos: RelatorioAnexo[];
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class RelatoriosService {
  private readonly key = 'pmpa_relatorios_v1';

  getByEscalaId(escalaId: string): RelatorioEscala | null {
    return this.read().find(r => r.escalaId === escalaId) ?? null;
  }

  upsert(escalaId: string, texto: string, anexos: RelatorioAnexo[]) {
    const all = this.read();
    const idx = all.findIndex(r => r.escalaId === escalaId);

    const item: RelatorioEscala = {
      escalaId,
      texto,
      anexos,
      updatedAt: new Date().toISOString(),
    };

    if (idx >= 0) all[idx] = item;
    else all.push(item);

    this.write(all);
  }

  private read(): RelatorioEscala[] {
    try {
      const raw = localStorage.getItem(this.key);
      return raw ? (JSON.parse(raw) as RelatorioEscala[]) : [];
    } catch {
      return [];
    }
  }

  private write(items: RelatorioEscala[]) {
    localStorage.setItem(this.key, JSON.stringify(items));
  }
}
