import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EscalasService } from '../../../../core/services/escalas';
import { ExtraTipo, TipoEscala, Turno } from '../../../../core/models/escala.model';

@Component({
  selector: 'app-escalas-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="wrap">
      <div class="card">
        <div class="head">
          <div>
            <h2>Nova escala</h2>
            <p class="muted">Cadastre uma escala e volte para o calendário.</p>
          </div>
          <button class="btn" type="button" (click)="cancelar()">Voltar</button>
        </div>

        <div *ngIf="erro" class="errorBox">{{ erro }}</div>

        <div class="form">
          <div class="row2">
            <div class="field">
              <label>Data</label>
              <input type="date" [(ngModel)]="draft.data" />
            </div>

            <div class="field">
              <label>Turno</label>
              <select [(ngModel)]="draft.turno">
                <option [ngValue]="'MANHÃ'">MANHÃ</option>
                <option [ngValue]="'TARDE'">TARDE</option>
                <option [ngValue]="'NOITE'">NOITE</option>
                <option [ngValue]="'MADRUGADA'">MADRUGADA</option>
              </select>
            </div>
          </div>

          <div class="row2">
            <div class="field">
              <label>Tipo</label>
              <select [(ngModel)]="draft.tipo">
                <option [ngValue]="'PMF'">PMF</option>
                <option [ngValue]="'ESCOLA_SEGURA'">Escola Segura</option>
                <option [ngValue]="'EXTRA'">Extra</option>
              </select>
            </div>

            <div class="field" *ngIf="draft.tipo === 'EXTRA'">
              <label>Extra</label>
              <select [(ngModel)]="draft.extraTipo">
                <option [ngValue]="null">Selecione...</option>
                <option [ngValue]="'REFORCO'">Reforço</option>
                <option [ngValue]="'EVENTO'">Evento</option>
                <option [ngValue]="'OPERACAO'">Operação</option>
                <option [ngValue]="'OUTRO'">Outro</option>
              </select>
            </div>
          </div>

          <div class="field">
            <label>Guarnição</label>
            <input type="text" placeholder="Ex: CB João, SD Maria" [(ngModel)]="draft.guarnicao" />
          </div>

          <div class="field">
            <label>Observação (opcional)</label>
            <textarea rows="3" [(ngModel)]="draft.observacao"></textarea>
          </div>

          <div class="actions">
            <button class="btn" type="button" (click)="cancelar()">Cancelar</button>
            <button class="btnPrimary" type="button" (click)="salvar()">Salvar</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .wrap{padding:18px;}
    .card{background:#fff;border:1px solid #e7e9ee;border-radius:14px;box-shadow:0 12px 34px rgba(2,6,23,.10);padding:14px;max-width:900px;margin:0 auto;}
    .head{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:10px;}
    h2{margin:0;font-size:22px;}
    .muted{color:#64748b;margin:6px 0 0;}
    .form{display:grid;gap:12px;margin-top:10px;}
    .row2{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
    .field{display:grid;gap:6px;}
    label{font-weight:900;color:#0f172a;font-size:13px;}
    input, select, textarea{border:1px solid #e7e9ee;border-radius:12px;padding:12px;outline:none;font-weight:700;}
    input:focus, select:focus, textarea:focus{border-color:rgba(15,47,87,.45);box-shadow:0 0 0 4px rgba(15,47,87,.08);}
    .actions{display:flex;justify-content:flex-end;gap:10px;margin-top:6px;}
    .btn{padding:10px 12px;border-radius:12px;border:1px solid #e7e9ee;background:#fff;cursor:pointer;font-weight:900;}
    .btnPrimary{padding:10px 12px;border-radius:12px;border:0;cursor:pointer;font-weight:900;color:#fff;background:linear-gradient(180deg,#0f2f57,#0b1f3a);}
    .errorBox{padding:12px;border-radius:12px;border:1px solid #fecdd3;background:#fff1f2;color:#9f1239;font-weight:900;}
    @media (max-width: 980px){.row2{grid-template-columns:1fr;}}
  `]
})
export class EscalasFormComponent implements OnInit {
  erro = '';

  draft: {
    data: string;
    turno: Turno;
    tipo: TipoEscala;
    extraTipo: ExtraTipo | null;
    guarnicao: string;
    observacao: string;
  } = {
    data: this.toISO(new Date()),
    turno: 'MANHÃ',
    tipo: 'PMF',
    extraTipo: null,
    guarnicao: '',
    observacao: '',
  };

  constructor(
    private escalasService: EscalasService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const qd = this.route.snapshot.queryParamMap.get('date');
    if (qd && /^\d{4}-\d{2}-\d{2}$/.test(qd)) {
      this.draft.data = qd;
    }
  }

  salvar(): void {
    this.erro = '';

    const data = (this.draft.data || '').trim();
    const turno = this.draft.turno;
    const tipo = this.draft.tipo;
    const extraTipo = this.draft.extraTipo;
    const guarnicao = (this.draft.guarnicao || '').trim();
    const observacao = (this.draft.observacao || '').trim();

    if (!data || !turno || !tipo || !guarnicao) {
      this.erro = 'Preencha Data, Turno, Tipo e Guarnição.';
      return;
    }
    if (tipo === 'EXTRA' && !extraTipo) {
      this.erro = 'Selecione o tipo de Extra.';
      return;
    }

    // pode ser salvar() ou criar() (agora ambos existem)
    this.escalasService.criar({
      data,
      turno,
      tipo,
      extraTipo: tipo === 'EXTRA' ? extraTipo : null,
      guarnicao,
      observacao: observacao ? observacao : undefined,
    });

    this.router.navigate(['/escalas'], { queryParams: { date: data } });
  }

  cancelar(): void {
    this.router.navigate(['/escalas'], { queryParams: { date: this.draft.data } });
  }

  private toISO(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
