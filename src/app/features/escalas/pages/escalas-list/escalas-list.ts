// src/app/features/escalas/pages/escalas-list/escalas-list.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EscalasService } from '../../../../core/services/escalas';
import { Escala } from '../../../../core/models/escala.model';

@Component({
  selector: 'app-escalas-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <div class="top">
        <div>
          <h2>Escalas</h2>
          <p class="muted">Listagem completa de escalas cadastradas.</p>
        </div>

        <button class="btnPrimary" type="button" (click)="irParaHoje()">Ir para hoje</button>
      </div>

      <div class="card">
        <table class="tbl">
          <thead>
            <tr>
              <th>Data</th>
              <th>Turno</th>
              <th>Tipo</th>
              <th>Guarnição</th>
              <th>Observação</th>
              <th class="right">Ações</th>
            </tr>
          </thead>

          <tbody>
            <tr *ngFor="let e of escalas">
              <td>{{ e.data }}</td>
              <td><strong>{{ e.turno }}</strong></td>
              <td>{{ labelTipo(e) }}</td>
              <td>{{ e.guarnicao }}</td>
              <td>{{ e.observacao || '—' }}</td>
              <td class="right">
                <button class="btnMini" type="button" (click)="abrirNoCalendario(e.data)">Abrir</button>
                <button class="btnDanger" type="button" (click)="remover(e.id)">Remover</button>
              </td>
            </tr>

            <tr *ngIf="escalas.length === 0">
              <td colspan="6" class="empty">Nenhuma escala cadastrada.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .page{display:grid;gap:14px;}
    .top{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;flex-wrap:wrap;}
    h2{margin:0;font-size:20px;font-weight:900;}
    .muted{color:#64748b;margin:6px 0 0;}
    .card{background:#fff;border:1px solid #e7e9ee;border-radius:14px;box-shadow:0 12px 34px rgba(2,6,23,.10);padding:14px;}
    .tbl{width:100%;border-collapse:separate;border-spacing:0;}
    th,td{padding:12px 10px;border-bottom:1px solid #eef2f7;text-align:left;}
    th{font-size:12px;color:#64748b;font-weight:900;background:#f8fafc;}
    .right{text-align:right;}
    .empty{text-align:center;color:#64748b;padding:22px;}
    .btnMini{padding:8px 10px;border-radius:12px;border:1px solid #e7e9ee;background:#fff;cursor:pointer;font-weight:900;font-size:12px;}
    .btnDanger{padding:8px 10px;border-radius:12px;border:1px solid #fecdd3;background:#fff1f2;color:#9f1239;font-weight:900;cursor:pointer;font-size:12px;margin-left:8px;}
    .btnPrimary{padding:10px 12px;border-radius:12px;border:0;cursor:pointer;font-weight:900;color:#fff;background:linear-gradient(180deg,#0f2f57,#0b1f3a);}
  `],
})
export class EscalasListComponent {
  escalas: Escala[] = [];

  constructor(private service: EscalasService, private router: Router) {
    this.escalas = this.service.listar();
  }

  irParaHoje() {
    const hoje = new Date();
    const iso = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2,'0')}-${String(hoje.getDate()).padStart(2,'0')}`;
    this.abrirNoCalendario(iso);
  }

  abrirNoCalendario(date: string) {
    this.router.navigate(['/escalas/calendario'], { queryParams: { date } });
  }

  remover(id: string) {
    this.service.remover(id);
    this.escalas = this.service.listar();
  }

  labelTipo(e: Escala) {
    const anyE = e as any;

    if (anyE.tipo === 'PMF') return 'PMF';
    if (anyE.tipo === 'ESCOLA_SEGURA') return 'Escola Segura';
    if (anyE.tipo === 'EXTRA') return `Extra • ${anyE.extraTipo ?? '—'}`;

    return '—';
  }
}
