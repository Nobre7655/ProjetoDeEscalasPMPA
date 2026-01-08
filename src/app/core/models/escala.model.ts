export type Turno = 'MANHÃ' | 'TARDE' | 'NOITE' | 'MADRUGADA';

export interface Escala {
  id: string;
  data: string;       // YYYY-MM-DD
  turno: Turno;
  local: string;
  guarnicao: string;
  observacao?: string;
}
