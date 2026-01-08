import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EscalasService } from '../../../../core/services/escalas';
import { Escala, Turno } from '../../../../core/models/escala.model';

type Cell = { date?: string; day?: number; isToday?: boolean; count?: number };

@Component({
  selector: 'app-escalas-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="top">
        <div>
          <h2>Calendário de Escalas</h2>
          <p>Selecione um dia para ver/cadastrar escalas.</p>
        </div>

        <div class="controls">
          <button class="btn" (click)="prevMonth()">◀</button>
          <div class="month">{{ monthLabel }}</div>
          <button class="btn" (click)="nextMonth()">▶</button>

          <button class="btnPrimary" (click)="openModal(selectedDate)">
            + Nova escala
          </button>
        </div>
      </div>

      <div class="grid">
        <div class="card cal">
          <div class="weekdays">
            <div>Seg</div><div>Ter</div><div>Qua</div><div>Qui</div><div>Sex</div><div>Sáb</div><div>Dom</div>
          </div>

          <div class="cells">
            <button
              *ngFor="let c of cells"
              class="cell"
              [class.empty]="!c.date"
              [class.today]="c.isToday"
              [class.selected]="c.date === selectedDate"
              (click)="c.date && selectDate(c.date!)"
              type="button"
            >
              <div class="day">{{ c.day ?? '' }}</div>
              <div *ngIf="c.count && c.count > 0" class="badge">{{ c.count }}</div>
            </button>
          </div>
        </div>

        <div class="card side">
          <div class="sideHeader">
            <div>
              <h3>Escalas do dia</h3>
              <p class="muted">{{ selectedDate }}</p>
            </div>
            <button class="btnPrimary small" (click)="openModal(selectedDate)">Adicionar</button>
          </div>

          <div *ngIf="dayScales.length === 0" class="empty">
            Nenhuma escala neste dia.
          </div>

          <div *ngFor="let e of dayScales" class="item">
            <div class="itemMain">
              <strong>{{ e.turno }}</strong>
              <span class="muted">{{ e.local }}</span>
              <span class="muted">{{ e.guarnicao }}</span>
              <span *ngIf="e.observacao" class="muted">Obs: {{ e.observacao }}</span>
            </div>
            <button class="danger" (click)="remover(e.id)">Remover</button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL -->
    <div *ngIf="modalOpen" class="overlay" (click)="closeModal()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modalHeader">
          <div>
            <h3>Nova escala</h3>
            <p class="muted">Preencha os dados para {{ draft.data }}.</p>
          </div>
          <button class="x" type="button" (click)="closeModal()">✕</button>
        </div>

        <div *ngIf="formError" class="errorBox">{{ formError }}</div>

        <div class="form">
          <div class="row2">
            <div class="field">
              <label>Data</label>
              <input type="date" [(ngModel)]="draft.data" [ngModelOptions]="{standalone:true}" />
            </div>

            <div class="field">
              <label>Turno</label>
              <select [(ngModel)]="draft.turno" [ngModelOptions]="{standalone:true}">
                <option [ngValue]="'MANHÃ'">MANHÃ</option>
                <option [ngValue]="'TARDE'">TARDE</option>
                <option [ngValue]="'NOITE'">NOITE</option>
                <option [ngValue]="'MADRUGADA'">MADRUGADA</option>
              </select>
            </div>
          </div>

          <div class="field">
            <label>Local</label>
            <input type="text" placeholder="Ex: 10º BPM" [(ngModel)]="draft.local" [ngModelOptions]="{standalone:true}" />
          </div>

          <div class="field">
            <label>Guarnição</label>
            <input type="text" placeholder="Ex: CB João, SD Maria" [(ngModel)]="draft.guarnicao" [ngModelOptions]="{standalone:true}" />
          </div>

          <div class="field">
            <label>Observação (opcional)</label>
            <textarea rows="3" [(ngModel)]="draft.observacao" [ngModelOptions]="{standalone:true}"></textarea>
          </div>
        </div>

        <div class="actions">
          <button class="btn" type="button" (click)="closeModal()">Cancelar</button>
          <button class="btnPrimary" type="button" (click)="saveModal()">Salvar</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page{display:grid;gap:14px;}
    .top{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;flex-wrap:wrap;}
    h2{margin:0;font-size:22px;}
    p{margin:6px 0 0;color:#64748b;}
    .controls{display:flex;align-items:center;gap:10px;flex-wrap:wrap;}
    .month{min-width:190px;text-align:center;font-weight:900;color:#0f172a;}
    .grid{display:grid;grid-template-columns: 1.3fr .9fr;gap:14px;}
    .card{background:#fff;border:1px solid #e7e9ee;border-radius:14px;box-shadow:0 12px 34px rgba(2,6,23,.10);padding:14px;}
    .cal{padding:12px;}
    .weekdays{display:grid;grid-template-columns:repeat(7,1fr);gap:8px;margin-bottom:8px;color:#64748b;font-weight:800;font-size:12px;}
    .cells{display:grid;grid-template-columns:repeat(7,1fr);gap:8px;}
    .cell{border:1px solid #eef2f7;background:#fff;border-radius:12px;min-height:78px;padding:10px;text-align:left;cursor:pointer;position:relative;}
    .cell:hover{border-color:rgba(15,47,87,.35);box-shadow:0 0 0 4px rgba(15,47,87,.06);}
    .cell.empty{opacity:.35;cursor:default;}
    .cell.today{border-color:rgba(212,175,55,.8);box-shadow:0 0 0 4px rgba(212,175,55,.15);}
    .cell.selected{border-color:rgba(15,47,87,.8);box-shadow:0 0 0 4px rgba(15,47,87,.12);}
    .day{font-weight:900;color:#0f172a;}
    .badge{position:absolute;right:10px;top:10px;background:#0b1f3a;color:#fff;border-radius:999px;padding:2px 8px;font-size:12px;font-weight:900;}
    .side{display:grid;gap:10px;}
    .sideHeader{display:flex;align-items:center;justify-content:space-between;gap:10px;}
    h3{margin:0;font-size:16px;}
    .muted{color:#64748b;font-size:12px;}
    .item{border:1px solid #eef2f7;border-radius:12px;padding:12px;display:flex;justify-content:space-between;gap:10px;}
    .itemMain{display:grid;gap:4px;}
    .empty{color:#64748b;padding:10px;}
    .btn{padding:10px 12px;border-radius:12px;border:1px solid #e7e9ee;background:#fff;cursor:pointer;font-weight:900;}
    .btnPrimary{padding:10px 12px;border-radius:12px;border:0;cursor:pointer;font-weight:900;color:#fff;background:linear-gradient(180deg,#0f2f57,#0b1f3a);}
    .btnPrimary.small{padding:8px 10px;font-size:12px;}
    .danger{padding:8px 10px;border-radius:12px;border:1px solid #fecdd3;background:#fff1f2;color:#9f1239;font-weight:900;cursor:pointer;}
    .overlay{position:fixed;inset:0;background:rgba(2,6,23,.55);display:grid;place-items:center;padding:18px;z-index:999;}
    .modal{width:min(720px,100%);background:#fff;border-radius:16px;border:1px solid #e7e9ee;box-shadow:0 22px 60px rgba(2,6,23,.35);padding:14px;}
    .modalHeader{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;padding:4px 6px 10px;}
    .x{border:1px solid #e7e9ee;background:#fff;border-radius:12px;width:40px;height:40px;cursor:pointer;font-weight:900;}
    .form{display:grid;gap:12px;padding:8px 6px 12px;}
    .row2{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
    .field{display:grid;gap:6px;}
    label{font-weight:900;color:#0f172a;font-size:13px;}
    input, select, textarea{border:1px solid #e7e9ee;border-radius:12px;padding:12px;outline:none;font-weight:700;}
    input:focus, select:focus, textarea:focus{border-color:rgba(15,47,87,.45);box-shadow:0 0 0 4px rgba(15,47,87,.08);}
    .actions{display:flex;justify-content:flex-end;gap:10px;padding:0 6px 6px;}
    .errorBox{margin:6px;padding:12px;border-radius:12px;border:1px solid #fecdd3;background:#fff1f2;color:#9f1239;font-weight:900;}
    @media (max-width: 980px){.grid{grid-template-columns:1fr;}.row2{grid-template-columns:1fr;}}
  `],
})
export class EscalasCalendarComponent implements OnInit {
  current = new Date();
  selectedDate = this.toISO(new Date());
  monthLabel = '';
  cells: Cell[] = [];
  dayScales: Escala[] = [];
  private counts = new Map<string, number>();

  modalOpen = false;
  formError = '';

  // ✅ aqui é Turno, não string
  draft: { data: string; turno: Turno; local: string; guarnicao: string; observacao: string } = {
    data: this.selectedDate,
    turno: 'MANHÃ',
    local: '',
    guarnicao: '',
    observacao: '',
  };

  constructor(
    private escalas: EscalasService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((p) => {
      const d = p['date'];
      if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
        this.selectedDate = d;
        const [yy, mm] = d.split('-').map(Number);
        this.current = new Date(yy, mm - 1, 1);
      }
      this.build();
      this.loadDay();
    });
  }

  prevMonth() { this.current = new Date(this.current.getFullYear(), this.current.getMonth() - 1, 1); this.build(); }
  nextMonth() { this.current = new Date(this.current.getFullYear(), this.current.getMonth() + 1, 1); this.build(); }

  selectDate(date: string) {
    this.selectedDate = date;
    this.loadDay();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { date },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  openModal(date: string) {
    this.formError = '';
    this.modalOpen = true;
    this.draft = { data: date, turno: 'MANHÃ', local: '', guarnicao: '', observacao: '' };
  }

  closeModal() { this.modalOpen = false; }

  saveModal() {
    this.formError = '';

    const data = (this.draft.data || '').trim();
    const turno = this.draft.turno; // ✅ Turno
    const local = (this.draft.local || '').trim();
    const guarnicao = (this.draft.guarnicao || '').trim();
    const observacao = (this.draft.observacao || '').trim();

    if (!data || !turno || !local || !guarnicao) {
      this.formError = 'Preencha Data, Turno, Local e Guarnição.';
      return;
    }

    this.escalas.salvar({
      data,
      turno,
      local,
      guarnicao,
      observacao: observacao ? observacao : undefined,
    });

    this.modalOpen = false;
    this.selectedDate = data;

    const [yy, mm] = data.split('-').map(Number);
    this.current = new Date(yy, mm - 1, 1);

    this.build();
    this.loadDay();
  }

  remover(id: string) {
    this.escalas.remover(id);
    this.build();
    this.loadDay();
  }

  private build() {
    const y = this.current.getFullYear();
    const m = this.current.getMonth();

    this.monthLabel = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' })
      .format(new Date(y, m, 1))
      .replace(/^\w/, c => c.toUpperCase());

    const all = this.escalas.listar();
    const prefix = `${y}-${String(m + 1).padStart(2,'0')}-`;

    this.counts = new Map<string, number>();
    for (const e of all) {
      if (e.data.startsWith(prefix)) {
        this.counts.set(e.data, (this.counts.get(e.data) ?? 0) + 1);
      }
    }

    const first = new Date(y, m, 1);
    const start = this.mondayIndex(first.getDay());
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const todayISO = this.toISO(new Date());

    const temp: Cell[] = Array.from({ length: 42 }, () => ({}));
    for (let i = 0; i < daysInMonth; i++) {
      const day = i + 1;
      const dateISO = `${y}-${String(m + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
      const idx = start + i;

      temp[idx] = {
        date: dateISO,
        day,
        isToday: dateISO === todayISO,
        count: this.counts.get(dateISO) ?? 0,
      };
    }
    this.cells = temp;
  }

  private loadDay() {
    this.dayScales = this.escalas.listar(this.selectedDate);
  }

  private toISO(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2,'0');
    const day = String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
  }

  private mondayIndex(jsDay: number) {
    // JS: Dom=0 ... Sáb=6  -> queremos Seg=0 ... Dom=6
    return (jsDay + 6) % 7;
  }
}
