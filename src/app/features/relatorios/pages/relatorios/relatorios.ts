// src/app/features/relatorios/pages/relatorios/relatorios.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { EscalasService } from '../../../../core/services/escalas';
import { Escala } from '../../../../core/models/escala.model';

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page">
      <div class="top">
        <div>
          <h2>Relatórios</h2>
          <p>Abra uma escala para escrever o relatório e anexar arquivos.</p>
        </div>
      </div>

      <div class="card">
        <table class="table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Turno</th>
              <th>Tipo</th>
              <th>Guarnição</th>
              <th>Relatório</th>
              <th style="text-align:right;">Ações</th>
            </tr>
          </thead>

          <tbody>
            <tr *ngFor="let e of escalas">
              <td>{{ e.data }}</td>
              <td><strong>{{ e.turno }}</strong></td>
              <td>{{ tipoLabel(e) }}</td>
              <td>{{ e.guarnicao }}</td>
              <td>
                <span class="pill ok" *ngIf="(e.relatorio || '').trim().length > 0">Feito</span>
                <span class="pill warn" *ngIf="(e.relatorio || '').trim().length === 0">Pendente</span>
              </td>
              <td style="text-align:right;">
                <button class="btn" (click)="abrir(e.id)">Abrir</button>
              </td>
            </tr>

            <tr *ngIf="escalas.length === 0">
              <td colspan="6" class="muted">Nenhuma escala cadastrada.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .page{display:grid;gap:14px;}
    .top{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;flex-wrap:wrap;}
    h2{margin:0;font-size:22px;}
    p{margin:6px 0 0;color:#64748b;}
    .card{background:#fff;border:1px solid #e7e9ee;border-radius:14px;box-shadow:0 12px 34px rgba(2,6,23,.10);padding:14px;}
    .table{width:100%;border-collapse:separate;border-spacing:0;}
    thead th{color:#64748b;font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:.06em;padding:12px;border-bottom:1px solid #eef2f7;text-align:left;}
    tbody td{padding:12px;border-bottom:1px solid #eef2f7;vertical-align:middle;}
    tbody tr:last-child td{border-bottom:0;}
    .btn{padding:10px 12px;border-radius:12px;border:1px solid #e7e9ee;background:#fff;cursor:pointer;font-weight:900;}
    .btn:hover{box-shadow:0 0 0 4px rgba(15,47,87,.08);border-color:rgba(15,47,87,.35);}
    .muted{color:#64748b;}
    .pill{display:inline-block;padding:4px 10px;border-radius:999px;font-weight:900;font-size:12px;}
    .ok{background:#dcfce7;color:#166534;border:1px solid #bbf7d0;}
    .warn{background:#fff7ed;color:#9a3412;border:1px solid #fed7aa;}
  `]
})
export class RelatoriosComponent implements OnInit {
  escalas: Escala[] = [];

  constructor(private escalasService: EscalasService, private router: Router) {}

  ngOnInit(): void {
    this.escalas = this.escalasService.listar();
  }

  abrir(id: string) {
    this.router.navigate(['/relatorios', id]);
  }

  tipoLabel(e: Escala) {
    if (e.tipo === 'EXTRA') return `Extra • ${e.extraTipo ?? '-'}`;
    if (e.tipo === 'ESCOLA_SEGURA') return 'Escola Segura';
    return 'PMF';
  }
}
