// src/app/features/dashboard/pages/painel-geral/painel-geral.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { EscalasService } from '../../../../core/services/escalas';
import { Escala } from '../../../../core/models/escala.model';

@Component({
  selector: 'app-painel-geral',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page">
      <div class="top">
        <div>
          <h2>Painel Geral</h2>
          <p>Visão rápida do sistema de escalas.</p>
        </div>

        <div class="actions">
          <button class="btn" (click)="irHoje()">Ir para hoje</button>
          <button class="btnPrimary" (click)="irCalendario()">Abrir calendário</button>
        </div>
      </div>

      <div class="cards">
        <div class="card kpi">
          <div class="kpiTitle">Total de escalas</div>
          <div class="kpiValue">{{ total }}</div>
          <div class="kpiHint">Cadastradas no sistema</div>
        </div>

        <div class="card kpi">
          <div class="kpiTitle">Escalas hoje</div>
          <div class="kpiValue">{{ hoje }}</div>
          <div class="kpiHint">{{ todayISO }}</div>
        </div>

        <div class="card kpi">
          <div class="kpiTitle">Este mês</div>
          <div class="kpiValue">{{ mesAtual }}</div>
          <div class="kpiHint">{{ monthLabel }}</div>
        </div>
      </div>

      <div class="grid">
        <div class="card">
          <div class="sectionHeader">
            <h3>Próximas escalas (7 dias)</h3>
            <button class="btn small" (click)="router.navigate(['/escalas'])">Ver todas</button>
          </div>

          <div *ngIf="proximas.length === 0" class="empty">
            Nenhuma escala nos próximos 7 dias.
          </div>

          <div *ngFor="let e of proximas" class="row">
            <div class="left">
              <div class="date">{{ e.data }}</div>
              <div class="meta">
                <strong>{{ e.turno }}</strong>
                <span class="dot">•</span>
                <span>{{ tipoLabel(e) }}</span>
              </div>
              <div class="muted">{{ e.guarnicao }}</div>
              <div class="muted" *ngIf="e.observacao">Obs: {{ e.observacao }}</div>
            </div>

            <button class="btnPrimary small" (click)="abrirDia(e.data)">Abrir dia</button>
          </div>
        </div>

        <div class="card">
          <h3>Atalhos</h3>

          <div class="shortcuts">
            <button class="btnPrimary" (click)="irCalendario()">Criar escala</button>
            <button class="btn" (click)="router.navigate(['/escalas'])">Ver listagem</button>
          </div>

          <div class="hint">
            Dica: use o <b>Calendário</b> para criar escalas rapidamente por dia.
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page{display:grid;gap:14px;}
    .top{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;flex-wrap:wrap;}
    h2{margin:0;font-size:22px;}
    p{margin:6px 0 0;color:#64748b;}
    .actions{display:flex;gap:10px;flex-wrap:wrap;}

    .cards{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;}
    .grid{display:grid;grid-template-columns:1.6fr .9fr;gap:14px;}

    .card{background:#fff;border:1px solid #e7e9ee;border-radius:14px;box-shadow:0 12px 34px rgba(2,6,23,.10);padding:14px;}
    .kpiTitle{font-weight:900;color:#0f172a;}
    .kpiValue{font-size:34px;font-weight:1000;color:#0b1f3a;margin-top:6px;}
    .kpiHint{color:#64748b;font-size:12px;margin-top:2px;}

    .sectionHeader{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px;}
    h3{margin:0;font-size:16px;}
    .empty{color:#64748b;padding:10px;}

    .row{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;padding:12px;border:1px solid #eef2f7;border-radius:12px;margin-top:10px;}
    .left{display:grid;gap:4px;}
    .date{font-weight:900;color:#0f172a;}
    .meta{display:flex;align-items:center;gap:8px;color:#0f172a;}
    .dot{color:#94a3b8;}
    .muted{color:#64748b;font-size:12px;}

    .shortcuts{display:flex;gap:10px;flex-wrap:wrap;margin-top:10px;}
    .hint{margin-top:12px;color:#64748b;font-size:13px;line-height:1.4;}

    .btn{padding:10px 12px;border-radius:12px;border:1px solid #e7e9ee;background:#fff;cursor:pointer;font-weight:900;}
    .btnPrimary{padding:10px 12px;border-radius:12px;border:0;cursor:pointer;font-weight:900;color:#fff;background:linear-gradient(180deg,#0f2f57,#0b1f3a);}
    .btn.small,.btnPrimary.small{padding:8px 10px;font-size:12px;}

    @media (max-width: 980px){
      .cards{grid-template-columns:1fr;}
      .grid{grid-template-columns:1fr;}
    }
  `],
})
export class PainelGeralComponent {
  todayISO = this.toISO(new Date());
  monthLabel = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' })
    .format(new Date())
    .replace(/^\w/, c => c.toUpperCase());

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
    // adapte conforme seu model atual:
    // PMF / ESCOLA_SEGURA / EXTRA + extraTipo
    if ((e as any).tipo === 'EXTRA') return `Extra • ${(e as any).extraTipo ?? '—'}`;
    if ((e as any).tipo === 'PMF') return 'PMF';
    if ((e as any).tipo === 'ESCOLA_SEGURA') return 'Escola Segura';
    return (e as any).tipo ?? '—';
  }

  private recalc() {
    const all = this.escalas.listar();

    this.total = all.length;
    this.hoje = all.filter(e => e.data === this.todayISO).length;

    const y = new Date().getFullYear();
    const m = String(new Date().getMonth() + 1).padStart(2, '0');
    const prefix = `${y}-${m}-`;
    this.mesAtual = all.filter(e => e.data.startsWith(prefix)).length;

    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 7);

    this.proximas = all
      .filter(e => {
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
