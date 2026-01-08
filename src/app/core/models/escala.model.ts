
export type Turno = 'MANHÃ' | 'TARDE' | 'NOITE' | '24H';

export interface Escala {
  id: string;
  data: string;      
  turno: Turno;
  local: string;
  guarnicao: string;  
  observacao?: string;
}
