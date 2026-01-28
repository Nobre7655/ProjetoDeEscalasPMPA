// src/app/core/models/escala.model.ts

export type Turno = 'MANHÃ' | 'TARDE' | 'NOITE' | 'MADRUGADA';

export type TipoEscala = 'PMF' | 'ESCOLA_SEGURA' | 'EXTRA';

export type ExtraTipo = 'OPERACAO' | 'REFORCO' | 'EVENTO' | 'OUTRO';

export interface Anexo {
  id: string;
  name: string;
  size: number;
  mime: string;
  dataUrl: string; // base64 (data:)
  createdAt: string; // ISO
}

export interface Escala {
  id: string;
  data: string; // yyyy-MM-dd
  turno: Turno;

  tipo: TipoEscala;
  extraTipo?: ExtraTipo | null;

  guarnicao: string;
  observacao?: string;

  // Relatório/anexos (opcional)
  relatorio?: string;
  anexos?: Anexo[];
}
