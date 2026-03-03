import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EscalasService } from '../../../../core/services/escalas';
import { Escala, ExtraTipo, TipoEscala, Turno } from '../../../../core/models/escala.model';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { DatePickerModule } from 'primeng/datepicker';

type Cell = { date?: string; day?: number; isToday?: boolean; count?: number };
type Opt<T> = { label: string; value: T };

@Component({
  selector: 'app-escalas-calendar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    DialogModule,
    SelectModule,
    InputTextModule,
    TextareaModule,
    DatePickerModule,
  ],
  templateUrl: './escalas-calendar.html',
  styleUrls: ['./escalas-calendar.css'],
})
export class EscalasCalendarComponent implements OnInit {
  current = new Date();
  selectedDate = this.toISO(new Date());
  monthLabel = '';
  cells: Cell[] = [];
  private counts = new Map<string, number>();

  modalOpen = false;
  formError = '';

  
  turnos: Opt<Turno>[] = [
    { label: 'MANHÃ', value: 'MANHÃ' },
    { label: 'TARDE', value: 'TARDE' },
    { label: 'NOITE', value: 'NOITE' },
    { label: 'MADRUGADA', value: 'MADRUGADA' },
  ];

  tipos: Opt<TipoEscala>[] = [
    { label: 'PMF', value: 'PMF' },
    { label: 'ESCOLA SEGURA', value: 'ESCOLA_SEGURA' },
    { label: 'EXTRA', value: 'EXTRA' },
  ];

  extras: Opt<ExtraTipo>[] = [
    { label: 'OPERAÇÃO', value: 'OPERACAO' },
    { label: 'REFORÇO', value: 'REFORCO' },
    { label: 'EVENTO', value: 'EVENTO' },
    { label: 'OUTRO', value: 'OUTRO' },
  ];

  draft: {
    data: string;
    turno: Turno;
    tipo: TipoEscala;
    extraTipo: ExtraTipo | null;
    guarnicao: string;
    observacao: string;
  } = {
      data: this.selectedDate,
      turno: 'MANHÃ',
      tipo: 'PMF',
      extraTipo: null,
      guarnicao: '',
      observacao: '',
    };

  draftDate: Date = this.fromISO(this.selectedDate);

  constructor(
    private escalas: EscalasService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe((p) => {
      const d = p['date'];
      if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
        this.selectedDate = d;
        const [yy, mm] = d.split('-').map(Number);
        this.current = new Date(yy, mm - 1, 1);
      }
      this.build();
    });
  }

  prevMonth() {
    this.current = new Date(this.current.getFullYear(), this.current.getMonth() - 1, 1);
    this.build();
  }

  nextMonth() {
    this.current = new Date(this.current.getFullYear(), this.current.getMonth() + 1, 1);
    this.build();
  }

  selectDate(date: string) {
    this.selectedDate = date;

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

    this.draft = {
      data: date,
      turno: 'MANHÃ',
      tipo: 'PMF',
      extraTipo: null,
      guarnicao: '',
      observacao: '',
    };

    this.draftDate = this.fromISO(date);
  }

  closeModal() {
    this.modalOpen = false;
  }

  onTipoChange(tipo: TipoEscala) {
    if (tipo !== 'EXTRA') this.draft.extraTipo = null;
  }

  saveModal() {
    this.formError = '';
    this.draft.data = this.toISO(this.draftDate ?? new Date());

    const data = (this.draft.data || '').trim();
    const turno = this.draft.turno;
    const tipo = this.draft.tipo;
    const extraTipo = this.draft.extraTipo;
    const guarnicao = (this.draft.guarnicao || '').trim();
    const observacao = (this.draft.observacao || '').trim();

    if (!data || !turno || !tipo || !guarnicao) {
      this.formError = 'Preencha Data, Turno, Tipo e Guarnição.';
      return;
    }

    if (tipo === 'EXTRA' && !extraTipo) {
      this.formError = 'Selecione o tipo do Extra (Operação, Reforço, Evento ou Outro).';
      return;
    }

    this.escalas.criar({
      data,
      turno,
      tipo,
      extraTipo: tipo === 'EXTRA' ? extraTipo : null,
      guarnicao,
      observacao: observacao ? observacao : undefined,
    });

    this.modalOpen = false;
    this.selectedDate = data;

    const [yy, mm] = data.split('-').map(Number);
    this.current = new Date(yy, mm - 1, 1);

    this.build();
  }

  private build() {
    const y = this.current.getFullYear();
    const m = this.current.getMonth();

    this.monthLabel = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' })
      .format(new Date(y, m, 1))
      .replace(/^\w/, (c) => c.toUpperCase());

    const all: Escala[] = this.escalas.listar();
    const prefix = `${y}-${String(m + 1).padStart(2, '0')}-`;

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
      const dateISO = `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
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

  private toISO(d: Date) {
    const safe = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0);
    const y = safe.getFullYear();
    const m = String(safe.getMonth() + 1).padStart(2, '0');
    const day = String(safe.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private fromISO(iso: string) {
    const [yy, mm, dd] = iso.split('-').map(Number);
    return new Date(yy, mm - 1, dd, 12, 0, 0);
  }

  private mondayIndex(jsDay: number) {
    return (jsDay + 6) % 7;
  }
}