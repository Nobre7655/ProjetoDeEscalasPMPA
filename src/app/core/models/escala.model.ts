// src/app/core/models/escala.model.ts

export type Turno = 'MANHÃ' | 'TARDE' | 'NOITE' | 'MADRUGADA';

export type TipoEscala = 'PMF' | 'ESCOLA_SEGURA' | 'EXTRA';

// ✅ Inclui todos que você usou (corrige erro de comparação)
export type ExtraTipo = 'OPERACAO' | 'REFORCO' | 'EVENTO' | 'OUTRO';

// ✅ Agora tem id (corrige: "id não existe no tipo Anexo")
export interface Anexo {
  id: string;
  name: string;
  mime: string;
  size: number;
  dataUrl: string;     // base64 (DataURL)
  createdAt: string;   // ISO
}

export interface Escala {
  id: string;
  data: string;       // yyyy-MM-dd
  turno: Turno;

  tipo: TipoEscala;
  extraTipo?: ExtraTipo;

  guarnicao: string;
  observacao?: string;

  // ✅ Relatório e anexos
  relatorio?: string;
  anexos?: Anexo[];

  createdAt: string;
  updatedAt: string;

  // opcional para multi-usuário no futuro
  createdBy?: string;
}
