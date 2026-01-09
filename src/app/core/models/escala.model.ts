// src/app/core/models/escala.model.ts

export type Turno = 'MANHÃ' | 'TARDE' | 'NOITE' | 'MADRUGADA';

export type TipoEscala = 'PMF' | 'ESCOLA_SEGURA' | 'EXTRA';

/**
 * ✅ Agora inclui EVENTO e OUTRO (pra bater com o que você usa no calendário)
 */
export type ExtraTipo = 'OPERACAO' | 'REFORCO' | 'EVENTO' | 'OUTRO';

export interface Anexo {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string; // base64
  createdAt: string;
}

export interface Escala {
  id: string;
  data: string; // yyyy-MM-dd
  turno: Turno;

  tipo: TipoEscala;
  extraTipo?: ExtraTipo | null;

  guarnicao: string;
  observacao?: string;

  relatorio?: string;
  anexos?: Anexo[];

  createdAt: string;
  createdBy?: string;
}
