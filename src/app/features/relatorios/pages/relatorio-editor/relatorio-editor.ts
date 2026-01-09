// src/app/features/relatorios/pages/relatorio-editor/relatorio-editor.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EscalasService } from '../../../../core/services/escalas';
import { Anexo, Escala } from '../../../../core/models/escala.model';

@Component({
  selector: 'app-relatorio-editor',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="page" *ngIf="escala; else notFound">
      <div class="top">
        <div>
          <h2>Relatório da Escala</h2>
          <p class="muted">
            <strong>{{ escala.data }}</strong> • {{ escala.turno }} • {{ labelTipo(escala) }}
          </p>
          <p class="muted">Guarnição: {{ escala.guarnicao }}</p>
        </div>

        <div class="actionsTop">
          <button class="btn" (click)="voltar()">Voltar</button>
          <button class="btnPrimary" (click)="salvar()">Salvar relatório</button>
        </div>
      </div>

      <div *ngIf="msg" class="msg">{{ msg }}</div>

      <div class="grid">
        <div class="card">
          <h3>Texto do relatório</h3>
          <textarea rows="14" [(ngModel)]="relatorio"></textarea>
          <p class="hint">Dica: salve sempre que anexar arquivos ou concluir a redação.</p>
        </div>

        <div class="card">
          <h3>Anexos</h3>

          <input type="file" multiple (change)="onFiles($event)" />

          <div *ngIf="anexos.length === 0" class="empty">
            Nenhum anexo adicionado.
          </div>

          <div *ngFor="let a of anexos" class="fileRow">
            <div class="fileInfo">
              <strong>{{ a.name }}</strong>
              <span class="muted">{{ formatBytes(a.size) }}</span>
            </div>

            <div class="fileBtns">
              <a class="btnMini" [href]="a.dataUrl" [download]="a.name">Baixar</a>
              <button class="danger" (click)="removerAnexo(a.id)">Remover</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ng-template #notFound>
      <div class="card">
        <h2>Relatório</h2>
        <p class="muted">Escala não encontrada.</p>
        <button class="btnPrimary" (click)="router.navigate(['/escalas'])">Voltar</button>
      </div>
    </ng-template>
  `,
  styles: [`
    .page{display:grid;gap:14px;}
    .top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap;}
    h2{margin:0;font-size:20px;font-weight:900;}
    h3{margin:0 0 10px;font-size:14px;font-weight:900;}
    .muted{color:#64748b;margin:6px 0 0;}
    .actionsTop{display:flex;gap:10px;}
    .grid{display:grid;grid-template-columns:1.2fr .8fr;gap:14px;}
    .card{background:#fff;border:1px solid #e7e9ee;border-radius:14px;box-shadow:0 12px 34px rgba(2,6,23,.10);padding:14px;}
    textarea{width:100%;border:1px solid #e7e9ee;border-radius:12px;padding:12px;font-weight:700;outline:none;}
    textarea:focus{border-color:rgba(15,47,87,.45);box-shadow:0 0 0 4px rgba(15,47,87,.08);}
    input[type="file"]{margin:10px 0 12px;}
    .hint{color:#64748b;font-size:12px;margin:10px 0 0;}
    .empty{color:#64748b;padding:10px;border:1px dashed #e7e9ee;border-radius:12px;}
    .fileRow{display:flex;align-items:center;justify-content:space-between;gap:10px;border:1px solid #eef2f7;border-radius:12px;padding:10px;margin-top:10px;}
    .fileInfo{display:grid;gap:4px;}
    .fileBtns{display:flex;gap:8px;}
    .msg{padding:12px;border-radius:12px;border:1px solid #bbf7d0;background:#f0fdf4;color:#166534;font-weight:900;}
    .btn{padding:10px 12px;border-radius:12px;border:1px solid #e7e9ee;background:#fff;cursor:pointer;font-weight:900;}
    .btnPrimary{padding:10px 12px;border-radius:12px;border:0;cursor:pointer;font-weight:900;color:#fff;background:linear-gradient(180deg,#0f2f57,#0b1f3a);}
    .btnMini{padding:8px 10px;border-radius:12px;border:1px solid #e7e9ee;background:#fff;cursor:pointer;font-weight:900;font-size:12px;text-decoration:none;display:inline-flex;align-items:center;}
    .danger{padding:8px 10px;border-radius:12px;border:1px solid #fecdd3;background:#fff1f2;color:#9f1239;font-weight:900;cursor:pointer;font-size:12px;}
    @media (max-width: 980px){.grid{grid-template-columns:1fr;}}
  `]
})
export class RelatorioEditorComponent implements OnInit {
  escala: Escala | null = null;
  relatorio = '';
  anexos: Anexo[] = [];
  msg = '';

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private escalas: EscalasService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    const found = this.escalas.getById(id);
    this.escala = found;

    if (found) {
      this.relatorio = found.relatorio ?? '';
      this.anexos = found.anexos ?? [];
    }
  }

  voltar() {
    this.router.navigate(['/escalas/calendario'], { queryParams: { date: this.escala?.data } });
  }

  salvar() {
    if (!this.escala) return;

    this.escalas.atualizar(this.escala.id, {
      relatorio: (this.relatorio || '').trim(),
      anexos: this.anexos,
    });

    this.msg = 'Relatório salvo com sucesso.';
    setTimeout(() => (this.msg = ''), 2500);
  }

  onFiles(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (files.length === 0) return;

    // limpa o input pra permitir anexar o mesmo arquivo novamente
    input.value = '';

    for (const f of files) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = String(reader.result || '');
        const anexo: Anexo = {
          id: this.newId(),
          name: f.name,
          mime: f.type || 'application/octet-stream',
          size: f.size,
          dataUrl,
          createdAt: new Date().toISOString(),
        };
        this.anexos = [anexo, ...this.anexos];
      };
      reader.readAsDataURL(f);
    }
  }

  removerAnexo(id: string) {
    this.anexos = this.anexos.filter(a => a.id !== id);
  }

  labelTipo(e: Escala) {
    if (e.tipo === 'PMF') return 'PMF';
    if (e.tipo === 'ESCOLA_SEGURA') return 'Escola Segura';
    return `Extra • ${e.extraTipo ?? '—'}`;
  }

  formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  }

  private newId(): string {
    return (globalThis.crypto?.randomUUID?.() ??
      `${Date.now()}-${Math.random().toString(16).slice(2)}`);
  }
}
