// src/app/features/escalas/pages/escalas-form/escalas-form.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { EscalasService } from '../../../../core/services/escalas';
import { Turno } from '../../../../core/models/escala.model';

@Component({
  selector: 'app-escalas-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h2>Nova Escala</h2>
          <p>Preencha os campos para cadastrar uma nova escala.</p>
        </div>
      </div>

      <div class="card form-card">
        <form class="form" (ngSubmit)="salvar()">
          <div class="grid">
            <label>
              Data
              <input type="date" [(ngModel)]="data" name="data" />
            </label>

            <label>
              Turno
              <select [(ngModel)]="turno" name="turno">
                <option *ngFor="let t of turnos" [value]="t">{{ t }}</option>
              </select>
            </label>
          </div>

          <label>
            Local
            <input placeholder="Ex: 10º BPM" [(ngModel)]="local" name="local" />
          </label>

          <label>
            Guarnição
            <input placeholder="Ex: CB João, SD Maria" [(ngModel)]="guarnicao" name="guarnicao" />
          </label>

          <label>
            Observação (opcional)
            <textarea rows="3" [(ngModel)]="observacao" name="observacao"></textarea>
          </label>

          <div class="actions">
            <button class="btn-primary" type="submit">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    :host{ display:block; }

    .page{ display:grid; gap:14px; }
    .page-header{ display:flex; align-items:flex-end; justify-content:space-between; gap:12px; }
    .page-header p{ margin-top:6px; color:#64748b; }

    .card{
      background:#fff;
      border:1px solid #e7e9ee;
      border-radius: 14px;
      box-shadow: 0 12px 34px rgba(2,6,23,.10);
    }

    .form-card{ padding: 18px; }
    .form{ display:grid; gap: 14px; }

    .grid{
      display:grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }

    label{
      display:grid;
      gap: 8px;
      font-weight: 700;
      color: #0f172a;
    }

    input, select, textarea{
      padding: 12px 12px;
      border-radius: 12px;
      border: 1px solid #e7e9ee;
      background: #fff;
      outline: none;
      font-weight: 500;
    }

    input:focus, select:focus, textarea:focus{
      border-color: rgba(15,47,87,.55);
      box-shadow: 0 0 0 4px rgba(15,47,87,.10);
    }

    .actions{ display:flex; justify-content:flex-end; margin-top: 6px; }

    .btn-primary{
      padding: 12px 16px;
      border-radius: 12px;
      border: 0;
      cursor: pointer;
      font-weight: 800;
      background: linear-gradient(180deg, #0f2f57, #0b1f3a);
      color:#fff;
    }

    .btn-primary:hover{ filter: brightness(1.05); }

    @media (max-width: 700px){
      .grid{ grid-template-columns: 1fr; }
      .actions{ justify-content: stretch; }
      .btn-primary{ width: 100%; }
    }
  `],
})
export class EscalasFormComponent {
  data = '';
  turno: Turno = 'MANHÃ';
  local = '';
  guarnicao = '';
  observacao = '';

  turnos: Turno[] = ['MANHÃ', 'TARDE', 'NOITE', 'MADRUGADA'];

  constructor(private escalasService: EscalasService, private router: Router) {}

  salvar() {
    if (!this.data || !this.local || !this.guarnicao) return;

    this.escalasService.criar({
      data: this.data,
      turno: this.turno,
      local: this.local,
      guarnicao: this.guarnicao,
      observacao: this.observacao || undefined,
    });

    this.router.navigateByUrl('/escalas');
  }
}
