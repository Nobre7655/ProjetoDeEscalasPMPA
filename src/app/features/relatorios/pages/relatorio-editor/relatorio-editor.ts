// src/app/features/relatorios/pages/relatorio-editor/relatorio-editor.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
            {{ escala.data }} • {{ escala.turno }} • {{ tipoLabel(escala) }}
          </p>
        </div>

        <div class="actionsTop">
          <button class="btn" (click)="voltar()">Voltar</button>
          <button class="btnPrimary" (click)="salvar()">Salvar</button>
        </div>
      </div>

      <div class="grid">
        <div class="card">
          <h3>Relatório</h3>
          <textarea
            rows="12"
            [(ngModel)]="relatorio"
            [ngModelOptions]="{standalone:true}"
            placeholder="Descreva a ocorrência, medidas adotadas, resultados e observações..."
          ></textarea>

          <div class="hint">
            Dica: escreva objetivo, resumo, ações, materiais usados e conclusão.
          </div>
        </div>

        <div class="card">
          <h3>Anexos</h3>

          <input class="file" type="file" multiple (change)="onFiles($event)" />

          <div class="list" *ngIf="anexos.length > 0; else empty">
            <div class="anexo" *ngFor="let a of anexos; let i = index">
              <div class="info">
                <strong>{{ a.name }}</strong>
                <span class="muted">{{ formatSize(a.size) }}</span>
              </div>

              <div class="btns">
                <a class="btn" [href]="a.dataUrl" [attr.download]="a.name">Baixar</a>
                <button class="danger" (click)="removerAnexo(i)">Remover</button>
              </div>
            </div>
          </div>

          <ng-template #empty>
            <div class="muted">Nenhum anexo adicionado.</div>
          </ng-template>
        </div>
      </div>
    </div>

    <ng-template #notFound>
      <div class="card">
        <h2>Escala não encontrada</h2>
        <p class="muted">Volte para Relatórios e selecione uma escala válida.</p>
        <button class="btn" (click)="router.navigate(['/relatorios'])">Voltar</button>
      </div>
    </ng-template>
  `,
  styles: [`
    .page{display:grid;gap:14px;}
    .top{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;flex-wrap:wrap;}
    h2{margin:0;font-size:22px;}
    h3{margin:0 0 10px;font-size:16px;}
    .muted{color:#64748b;}
    .actionsTop{display:flex;gap:10px;flex-wrap:wrap;}
    .grid{display:grid;grid-template-columns:1.2fr .8fr;gap:14px;}
    .card{background:#fff;border:1px solid #e7e9ee;border-radius:14px;box-shadow:0 12px 34px rgba(2,6,23,.10);padding:14px;}
    textarea{
      width:100%;
      border:1px solid #e7e9ee;border-radius:12px;padding:12px;
      outline:none;font-weight:700;resize:vertical;
      min-height:260px;
    }
    textarea:focus{border-color:rgba(15,47,87,.45);box-shadow:0 0 0 4px rgba(15,47,87,.08);}
    .hint{margin-top:10px;color:#64748b;font-size:12px;}
    .file{width:100%;padding:12px;border:1px dashed #cbd5e1;border-radius:12px;background:#f8fafc;}
    .list{display:grid;gap:10px;margin-top:12px;}
    .anexo{border:1px solid #eef2f7;border-radius:12px;padding:12px;display:flex;justify-content:space-between;gap:10px;align-items:center;}
    .info{display:grid;gap:4px;}
    .btns{display:flex;gap:10px;flex-wrap:wrap;}
    .btn{padding:10px 12px;border-radius:12px;border:1px solid #e7e9ee;background:#fff;cursor:pointer;font-weight:900;text-decoration:none;color:#0f172a;}
    .btnPrimary{padding:10px 12px;border-radius:12px;border:0;cursor:pointer;font-weight:900;color:#fff;background:linear-gradient(180deg,#0f2f57,#0b1f3a);}
    .danger{padding:10px 12px;border-radius:12px;border:1px solid #fecdd3;background:#fff1f2;color:#9f1239;font-weight:900;cursor:pointer;}
    @media (max-width: 980px){.grid{grid-template-columns:1fr;}}
  `]
})
export class RelatorioEditorComponent implements OnInit {
  escala: Escala | null = null;
  relatorio = '';
  anexos: Anexo[] = [];

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private escalasService: EscalasService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') || '';
    const e = this.escalasService.getById(id);

    if (!e) {
      this.escala = null;
      return;
    }

    this.escala = e;
    this.relatorio = e.relatorio ?? '';
    this.anexos = Array.isArray(e.anexos) ? [...e.anexos] : [];
  }

  voltar() {
    this.router.navigate(['/relatorios']);
  }

  salvar() {
    if (!this.escala) return;

    this.escalasService.atualizar(this.escala.id, {
      relatorio: this.relatorio,
      anexos: this.anexos
    });

    // recarrega para garantir consistência
    const updated = this.escalasService.getById(this.escala.id);
    if (updated) this.escala = updated;

    this.router.navigate(['/relatorios']);
  }

  async onFiles(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];

    for (const f of files) {
      const dataUrl = await this.fileToDataUrl(f);
      this.anexos.push({
        id: this.newId(),
        name: f.name,
        type: f.type || 'application/octet-stream',
        size: f.size,
        dataUrl,
        createdAt: new Date().toISOString()
      });
    }

    // limpa o input (permite anexar o mesmo arquivo novamente se quiser)
    input.value = '';
  }

  removerAnexo(index: number) {
    this.anexos.splice(index, 1);
  }

  tipoLabel(e: Escala) {
    if (e.tipo === 'EXTRA') return `Extra • ${e.extraTipo ?? '-'}`;
    if (e.tipo === 'ESCOLA_SEGURA') return 'Escola Segura';
    return 'PMF';
  }

  formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  }

  private fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject();
      reader.readAsDataURL(file);
    });
  }

  private newId(): string {
    return (globalThis.crypto?.randomUUID?.() ??
      `${Date.now()}-${Math.random().toString(16).slice(2)}`);
  }
}
