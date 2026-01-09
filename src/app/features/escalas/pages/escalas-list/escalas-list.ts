// src/app/features/escalas/pages/escalas-list/escalas-list.ts
import { Component, OnInit } from '@angular/core';
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

        <div class="actions">
          <button class="btnPrimary" (click)="irParaHojeNoCalendario()">Ir para hoje</button>
        </div>
      </div>

      <div class="card">
        <div *ngIf="items.length === 0" class="empty">
          Nenhuma escala cadastrada ainda.
          <button class="link" (click)="irParaHojeNoCalendario()">Cadastrar pelo calendário</button>
        </div>

        <div *ngIf="items.length > 0" class="tableWrap">
          <table class="table">
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
              <tr *ngFor="let e of items">
                <td class="mono">{{ e.data }}</td>
                <td><strong>{{ e.turno }}</strong></td>
                <td>{{ labelTipo(e) }}</td>
                <td>{{ e.guarnicao }}</td>
                <td class="muted">{{ e.observacao || '—' }}</td>
                <td class="right">
                  <button class="btn" (click)="abrirNoCalendario(e.data)">Abrir</button>
                  <button class="danger" (click)="remover(e.id)">Remover</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .page{display:grid;gap:14px;}
    .top{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;flex-wrap:wrap;}
    h2{margin:0;font-size:22px;}
    .muted{color:#64748b;font-size:12px;margin:6px 0 0;}
    .actions{display:flex;gap:10px;align-items:center;flex-wrap:wrap;}

    .card{background:#fff;border:1px solid #e7e9ee;border-radius:14px;box-shadow:0 12px 34px rgba(2,6,23,.10);padding:14px;}
    .empty{color:#64748b;padding:18px;display:grid;gap:10px;}
    .link{border:0;background:transparent;color:#0b1f3a;font-weight:900;cursor:pointer;justify-self:start;padding:0;}

    .tableWrap{overflow:auto;border-radius:12px;border:1px solid #eef2f7;}
    .table{width:100%;border-collapse:collapse;min-width:860px;}
    th, td{padding:12px;border-bottom:1px solid #eef2f7;text-align:left;}
    th{background:#f8fafc;color:#334155;font-weight:900;font-size:12px;}
    tr:hover td{background:#fbfdff;}
    .right{text-align:right;white-space:nowrap;}
    .mono{font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;}

    .btn{padding:8px 10px;border-radius:12px;border:1px solid #e7e9ee;background:#fff;cursor:pointer;font-weight:900;margin-right:8px;}
    .btnPrimary{padding:10px 12px;border-radius:12px;border:0;cursor:pointer;font-weight:900;color:#fff;background:linear-gradient(180deg,#0f2f57,#0b1f3a);}
    .danger{padding:8px 10px;border-radius:12px;border:1px solid #fecdd3;background:#fff1f2;color:#9f1239;font-weight:900;cursor:pointer;}
  `],
})
export class EscalasListComponent implements OnInit {
  items: Escala[] = [];

  constructor(private escalas: EscalasService, private router: Router) {}

  ngOnInit(): void {
    this.carregar();
  }

  carregar() {
    this.items = this.escalas.listar();
  }

  remover(id: string) {
    this.escalas.remover(id);
    this.carregar();
  }

  abrirNoCalendario(date: string) {
    this.router.navigate(['/calendario'], { queryParams: { date } });
  }

  irParaHojeNoCalendario() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const iso = `${y}-${m}-${day}`;
    this.abrirNoCalendario(iso);
  }

  labelTipo(e: Escala) {
    if (e.tipo === 'PMF') return 'PMF';
    if (e.tipo === 'ESCOLA_SEGURA') return 'Escola Segura';
    // EXTRA
    return e.extraTipo ? `Extra • ${e.extraTipo}` : 'Extra';
  }
}
