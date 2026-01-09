// src/app/features/relatorios/pages/relatorios/relatorios.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EscalasService } from '../../../../core/services/escalas';
import { Escala } from '../../../../core/models/escala.model';
import { RelatoriosService, RelatorioAnexo } from '../../../../core/services/relatorios';

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="top">
        <div>
          <h2>Relatórios</h2>
          <p>Escreva o relatório e anexe arquivos para cada escala finalizada.</p>
        </div>
      </div>

      <div class="card">
        <div class="tableWrap">
          <table class="tbl">
            <thead>
              <tr>
                <th>Data</th>
                <th>Turno</th>
                <th>Tipo</th>
                <th>Guarnição</th>
                <th>Status</th>
                <th style="text-align:right;">Ações</th>
              </tr>
            </thead>

            <tbody>
              <tr *ngFor="let e of escalas">
                <td class="mono">{{ e.data }}</td>
                <td><strong>{{ e.turno }}</strong></td>
                <td>{{ tipoLabel(e) }}</td>
                <td>{{ e.guarnicao }}</td>
                <td>
                  <span class="status" [class.ok]="hasReport(e.id)">
                    {{ hasReport(e.id) ? 'Preenchido' : 'Pendente' }}
                  </span>
                </td>
                <td style="text-align:right;">
                  <button class="btn" (click)="openReport(e)">Abrir</button>
                </td>
              </tr>

              <tr *ngIf="escalas.length === 0">
                <td colspan="6" class="empty">Nenhuma escala cadastrada.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- MODAL RELATÓRIO -->
    <div *ngIf="modalOpen" class="overlay" (click)="close()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modalHeader">
          <div>
            <h3>Relatório da Escala</h3>
            <p class="muted">
              {{ selected?.data }} • {{ selected?.turno }} • {{ selected ? tipoLabel(selected) : '' }}
            </p>
          </div>
          <button class="x" type="button" (click)="close()">✕</button>
        </div>

        <div class="form">
          <div class="field">
            <label>Texto do relatório</label>
            <textarea rows="7" [(ngModel)]="draftText" [ngModelOptions]="{standalone:true}"
              placeholder="Descreva a execução da escala, ocorrências, observações e conclusão..."></textarea>
          </div>

          <div class="field">
            <label>Anexos (opcional)</label>
            <input type="file" (change)="onFiles($event)" multiple />
            <div class="hint">Dica: evite anexos muito grandes (localStorage tem limite).</div>
          </div>

          <div *ngIf="draftAnexos.length > 0" class="anexos">
            <div class="anexo" *ngFor="let a of draftAnexos; let i = index">
              <div class="anexoMain">
                <strong>{{ a.name }}</strong>
                <span class="muted">{{ formatSize(a.size) }}</span>
              </div>

              <div class="anexoActions">
                <a class="link" [href]="a.dataUrl" [attr.download]="a.name">Baixar</a>
                <button class="danger" type="button" (click)="removeAnexo(i)">Remover</button>
              </div>
            </div>
          </div>
        </div>

        <div class="actions">
          <button class="btn" type="button" (click)="close()">Cancelar</button>
          <button class="btnPrimary" type="button" (click)="save()">Salvar relatório</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page{display:grid;gap:14px;}
    .top{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;flex-wrap:wrap;}
    h2{margin:0;font-size:22px;}
    p{margin:6px 0 0;color:#64748b;}
    .card{background:#fff;border:1px solid #e7e9ee;border-radius:14px;box-shadow:0 12px 34px rgba(2,6,23,.10);padding:14px;}
    .tableWrap{overflow:auto;}
    .tbl{width:100%;border-collapse:separate;border-spacing:0;}
    thead th{font-size:12px;color:#64748b;text-align:left;padding:12px 10px;border-bottom:1px solid #eef2f7;}
    tbody td{padding:12px 10px;border-bottom:1px solid #f1f5f9;}
    .mono{font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;}
    .empty{color:#64748b;padding:16px;text-align:center;}
    .btn{padding:9px 12px;border-radius:12px;border:1px solid #e7e9ee;background:#fff;cursor:pointer;font-weight:900;}
    .btnPrimary{padding:10px 12px;border-radius:12px;border:0;cursor:pointer;font-weight:900;color:#fff;background:linear-gradient(180deg,#0f2f57,#0b1f3a);}
    .status{display:inline-flex;align-items:center;gap:8px;font-weight:900;font-size:12px;color:#9f1239;background:#fff1f2;border:1px solid #fecdd3;padding:4px 10px;border-radius:999px;}
    .status.ok{color:#065f46;background:#ecfdf5;border-color:#a7f3d0;}

    .overlay{position:fixed;inset:0;background:rgba(2,6,23,.55);display:grid;place-items:center;padding:18px;z-index:999;}
    .modal{width:min(820px,100%);background:#fff;border-radius:16px;border:1px solid #e7e9ee;box-shadow:0 22px 60px rgba(2,6,23,.35);padding:14px;}
    .modalHeader{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;padding:4px 6px 10px;}
    .x{border:1px solid #e7e9ee;background:#fff;border-radius:12px;width:40px;height:40px;cursor:pointer;font-weight:900;}
    .muted{color:#64748b;font-size:12px;}
    .form{display:grid;gap:12px;padding:8px 6px 12px;}
    .field{display:grid;gap:6px;}
    label{font-weight:900;color:#0f172a;font-size:13px;}
    textarea,input[type="file"]{border:1px solid #e7e9ee;border-radius:12px;padding:12px;outline:none;font-weight:700;}
    textarea:focus{border-color:rgba(15,47,87,.45);box-shadow:0 0 0 4px rgba(15,47,87,.08);}
    .hint{font-size:12px;color:#64748b;}

    .anexos{display:grid;gap:10px;}
    .anexo{border:1px solid #eef2f7;border-radius:12px;padding:12px;display:flex;justify-content:space-between;gap:12px;align-items:center;}
    .anexoMain{display:grid;gap:4px;}
    .anexoActions{display:flex;gap:10px;align-items:center;}
    .link{font-weight:900;color:#0b1f3a;text-decoration:none;}
    .danger{padding:8px 10px;border-radius:12px;border:1px solid #fecdd3;background:#fff1f2;color:#9f1239;font-weight:900;cursor:pointer;}
    .actions{display:flex;justify-content:flex-end;gap:10px;padding:0 6px 6px;}
  `],
})
export class RelatoriosComponent implements OnInit {
  escalas: Escala[] = [];

  modalOpen = false;
  selected: Escala | null = null;

  draftText = '';
  draftAnexos: RelatorioAnexo[] = [];

  constructor(
    private escalasService: EscalasService,
    private relatorios: RelatoriosService
  ) {}

  ngOnInit(): void {
    this.reload();
  }

  reload() {
    this.escalas = this.escalasService.listar().slice().reverse();
  }

  tipoLabel(e: Escala): string {
    if (e.tipo === 'PMF') return 'PMF';
    if (e.tipo === 'ESCOLA_SEGURA') return 'Escola Segura';
    return `Extra • ${e.extraTipo ?? '—'}`;
  }

  hasReport(escalaId: string): boolean {
    const r = this.relatorios.getByEscalaId(escalaId);
    return !!(r && (r.texto?.trim() || r.anexos?.length));
  }

  openReport(e: Escala) {
    this.selected = e;
    const existing = this.relatorios.getByEscalaId(e.id);

    this.draftText = existing?.texto ?? '';
    this.draftAnexos = existing?.anexos ?? [];

    this.modalOpen = true;
  }

  close() {
    this.modalOpen = false;
    this.selected = null;
    this.draftText = '';
    this.draftAnexos = [];
  }

  async onFiles(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    if (!files.length) return;

    for (const f of files) {
      const dataUrl = await this.readAsDataUrl(f);
      this.draftAnexos.push({
        name: f.name,
        mime: f.type || 'application/octet-stream',
        size: f.size,
        dataUrl,
      });
    }

    input.value = '';
  }

  removeAnexo(i: number) {
    this.draftAnexos.splice(i, 1);
  }

  save() {
    if (!this.selected) return;

    this.relatorios.upsert(
      this.selected.id,
      this.draftText || '',
      this.draftAnexos || []
    );

    this.close();
  }

  formatSize(bytes: number): string {
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  }

  private readAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }
}
