import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { EscalasService } from '../../../../core/services/escalas';
import { Escala } from '../../../../core/models/escala.model';

/** PrimeNG */
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-painel-geral',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule],
  templateUrl: './painel-geral.html',
  styleUrls: ['./painel-geral.css'],
})
export class PainelGeralComponent {
  todayISO = this.toISO(new Date());
  monthLabel = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' })
    .format(new Date())
    .replace(/^\w/, (c) => c.toUpperCase());

  total = 0;
  hoje = 0;
  mesAtual = 0;
  proximas: Escala[] = [];

  constructor(
    private escalas: EscalasService,
    public router: Router
  ) {
    this.recalc();
  }

  irCalendario() {
    this.router.navigate(['/calendario'], { queryParams: { date: this.todayISO } });
  }

  irHoje() {
    this.router.navigate(['/calendario'], { queryParams: { date: this.todayISO } });
  }

  abrirDia(dateISO: string) {
    this.router.navigate(['/calendario'], { queryParams: { date: dateISO } });
  }

  tipoLabel(e: Escala) {
    if ((e as any).tipo === 'EXTRA') return `Extra • ${(e as any).extraTipo ?? '—'}`;
    if ((e as any).tipo === 'PMF') return 'PMF';
    if ((e as any).tipo === 'ESCOLA_SEGURA') return 'Escola Segura';
    return (e as any).tipo ?? '—';
  }

  private recalc() {
    const all = this.escalas.listar();

    this.total = all.length;
    this.hoje = all.filter((e) => e.data === this.todayISO).length;

    const y = new Date().getFullYear();
    const m = String(new Date().getMonth() + 1).padStart(2, '0');
    const prefix = `${y}-${m}-`;
    this.mesAtual = all.filter((e) => e.data.startsWith(prefix)).length;

    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 7);

    this.proximas = all
      .filter((e) => {
        const d = new Date(e.data + 'T00:00:00');
        return d >= new Date(start.toDateString()) && d <= end;
      })
      .slice(0, 10);
  }

  private toISO(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}