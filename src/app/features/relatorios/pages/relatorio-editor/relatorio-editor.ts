// src/app/features/relatorios/pages/relatorio-editor/relatorio-editor.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { EscalasService } from '../../../../core/services/escalas';
import { Escala, Anexo } from '../../../../core/models/escala.model';

type UploadItem = {
  id: string;
  name: string;
  size: number;
  mime: string;
  progress: number; // 0..100 (visual)
  state: 'lendo' | 'pronto' | 'erro';
};

@Component({
  selector: 'app-relatorio-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="overlay" (click)="close()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="header">
          <div>
            <h2>Relatório da Escala</h2>
            <div class="meta" *ngIf="escala">
              {{ escala.data }} • {{ escala.turno }} • {{ labelTipo(escala) }}
            </div>
          </div>
          <button class="x" type="button" (click)="close()">✕</button>
        </div>

        <div class="tabs">
          <button type="button" class="tab" [class.active]="tab==='texto'" (click)="tab='texto'">
            Texto
          </button>
          <button type="button" class="tab" [class.active]="tab==='anexos'" (click)="tab='anexos'">
            Anexos
            <span class="pill" *ngIf="anexos.length">{{ anexos.length }}</span>
          </button>
        </div>

        <!-- TAB TEXTO -->
        <div *ngIf="tab==='texto'" class="content">
          <label class="label">Texto do relatório</label>
          <textarea
            class="textarea"
            rows="10"
            [(ngModel)]="relatorioTexto"
            [ngModelOptions]="{standalone:true}"
            placeholder="Descreva a execução da escala, ocorrências, observações e conclusão..."
          ></textarea>
        </div>

        <!-- TAB ANEXOS -->
        <div *ngIf="tab==='anexos'" class="content">
          <div
            class="dropzone"
            (dragover)="onDragOver($event)"
            (dragleave)="onDragLeave($event)"
            (drop)="onDrop($event)"
            [class.dragging]="dragging"
          >
            <div class="dzTop">
              <div class="dzIcon">⬆</div>
              <div class="dzText">
                <strong>Arraste e solte arquivos aqui</strong>
                <span>ou clique para selecionar</span>
              </div>
            </div>

            <button class="btn" type="button" (click)="fileInput.click()">
              Selecionar arquivos
            </button>

            <input
              #fileInput
              type="file"
              multiple
              (change)="onFilesSelected($event)"
              style="display:none"
            />

            <div class="hint">
              Dica: evite anexos muito grandes (localStorage tem limite).
            </div>
          </div>

          <!-- UPLOADS EM ANDAMENTO -->
          <div *ngIf="uploads.length" class="list">
            <div class="listTitle">Carregando</div>

            <div *ngFor="let u of uploads" class="fileRow">
              <div class="fileMain">
                <div class="fileName">{{ u.name }}</div>
                <div class="fileSub">{{ formatBytes(u.size) }}</div>

                <div class="bar">
                  <div class="barFill" [style.width.%]="u.progress"></div>
                </div>

                <div class="fileSub" *ngIf="u.state==='lendo'">Lendo arquivo…</div>
                <div class="fileSub ok" *ngIf="u.state==='pronto'">Pronto</div>
                <div class="fileSub err" *ngIf="u.state==='erro'">Erro ao ler</div>
              </div>

              <button class="danger" type="button" (click)="removeUpload(u.id)">
                Remover
              </button>
            </div>
          </div>

          <!-- ANEXOS PRONTOS -->
          <div *ngIf="anexos.length" class="list">
            <div class="listTitle">Anexos</div>

            <div *ngFor="let a of anexos" class="fileRow">
              <div class="fileMain">
                <div class="fileName">{{ a.name }}</div>
                <div class="fileSub">{{ formatBytes(a.size) }}</div>
              </div>

              <div class="actionsRight">
                <a class="link" [href]="a.dataUrl" [download]="a.name">Baixar</a>
                <button class="danger" type="button" (click)="removeAnexo(a.id)">
                  Remover
                </button>
              </div>
            </div>
          </div>

          <div *ngIf="!uploads.length && !anexos.length" class="empty">
            Nenhum anexo ainda. Use a área de upload acima.
          </div>
        </div>

        <div class="footer">
          <button class="btn" type="button" (click)="close()">Cancelar</button>
          <button class="btnPrimary" type="button" (click)="save()">Salvar relatório</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .overlay{
      position:fixed; inset:0;
      background:rgba(2,6,23,.55);
      display:grid; place-items:center;
      padding:18px; z-index:999;
    }
    .modal{
      width:min(980px, 100%);
      background:#fff;
      border-radius:16px;
      border:1px solid #e7e9ee;
      box-shadow:0 22px 60px rgba(2,6,23,.35);
      padding:16px;
    }
    .header{
      display:flex; align-items:flex-start; justify-content:space-between;
      gap:12px; padding:4px 6px 8px;
    }
    h2{margin:0; font-size:20px; color:#0f172a;}
    .meta{margin-top:6px; color:#64748b; font-size:12px; font-weight:800;}
    .x{
      border:1px solid #e7e9ee; background:#fff;
      border-radius:12px; width:42px; height:42px;
      cursor:pointer; font-weight:900;
    }

    .tabs{
      display:flex; gap:8px;
      padding:8px 6px 10px;
      border-bottom:1px solid #eef2f7;
      margin-bottom:12px;
    }
    .tab{
      border:1px solid #e7e9ee;
      background:#fff;
      border-radius:999px;
      padding:10px 12px;
      font-weight:900;
      cursor:pointer;
      color:#0f172a;
      display:flex; gap:8px; align-items:center;
    }
    .tab.active{
      border-color:rgba(15,47,87,.55);
      box-shadow:0 0 0 4px rgba(15,47,87,.10);
    }
    .pill{
      background:#0b1f3a; color:#fff;
      border-radius:999px; padding:2px 8px;
      font-size:12px; font-weight:900;
    }

    .content{padding:0 6px 10px;}
    .label{display:block; font-weight:900; color:#0f172a; margin-bottom:8px;}
    .textarea{
      width:100%;
      border:1px solid #e7e9ee;
      border-radius:12px;
      padding:12px;
      outline:none;
      font-weight:700;
      resize:vertical;
    }
    .textarea:focus{
      border-color:rgba(15,47,87,.45);
      box-shadow:0 0 0 4px rgba(15,47,87,.08);
    }

    .dropzone{
      border:1px dashed rgba(15,47,87,.35);
      border-radius:14px;
      padding:14px;
      background:linear-gradient(180deg, rgba(15,47,87,.04), rgba(2,6,23,.00));
      display:grid; gap:12px;
    }
    .dropzone.dragging{
      border-color:rgba(212,175,55,.8);
      box-shadow:0 0 0 4px rgba(212,175,55,.15);
    }
    .dzTop{display:flex; gap:12px; align-items:center;}
    .dzIcon{
      width:44px; height:44px;
      border-radius:12px;
      display:grid; place-items:center;
      background:rgba(15,47,87,.08);
      font-weight:900;
    }
    .dzText{display:grid; gap:2px;}
    .dzText strong{color:#0f172a;}
    .dzText span{color:#64748b; font-weight:700; font-size:12px;}

    .hint{color:#64748b; font-size:12px; font-weight:700;}

    .list{margin-top:14px; display:grid; gap:10px;}
    .listTitle{font-weight:900; color:#0f172a; font-size:13px;}

    .fileRow{
      border:1px solid #eef2f7;
      border-radius:12px;
      padding:12px;
      display:flex;
      justify-content:space-between;
      gap:12px;
      align-items:center;
    }
    .fileMain{display:grid; gap:6px; min-width:0;}
    .fileName{font-weight:900; color:#0f172a; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:600px;}
    .fileSub{color:#64748b; font-size:12px; font-weight:800;}
    .ok{color:#16a34a;}
    .err{color:#9f1239;}

    .bar{
      height:10px;
      border-radius:999px;
      background:#eef2f7;
      overflow:hidden;
    }
    .barFill{
      height:100%;
      background:linear-gradient(180deg,#0f2f57,#0b1f3a);
      width:0%;
      transition:width .25s ease;
    }

    .actionsRight{display:flex; gap:12px; align-items:center;}
    .link{font-weight:900; color:#0b1f3a; text-decoration:none;}
    .link:hover{text-decoration:underline;}

    .btn{
      padding:10px 12px;
      border-radius:12px;
      border:1px solid #e7e9ee;
      background:#fff;
      cursor:pointer;
      font-weight:900;
    }
    .btnPrimary{
      padding:10px 12px;
      border-radius:12px;
      border:0;
      cursor:pointer;
      font-weight:900;
      color:#fff;
      background:linear-gradient(180deg,#0f2f57,#0b1f3a);
    }
    .danger{
      padding:8px 10px;
      border-radius:12px;
      border:1px solid #fecdd3;
      background:#fff1f2;
      color:#9f1239;
      font-weight:900;
      cursor:pointer;
      white-space:nowrap;
    }
    .footer{
      display:flex;
      justify-content:flex-end;
      gap:10px;
      padding:6px;
      border-top:1px solid #eef2f7;
      margin-top:10px;
    }
    .empty{color:#64748b; font-weight:800; padding:10px 0;}

    @media (max-width: 860px){
      .fileName{max-width:300px;}
    }
  `],
})
export class RelatorioEditorComponent implements OnInit {
  escalaId = '';
  escala: Escala | null = null;

  tab: 'texto' | 'anexos' = 'texto';

  relatorioTexto = '';
  anexos: Anexo[] = [];

  dragging = false;

  uploads: UploadItem[] = [];

  constructor(
    private escalas: EscalasService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id =
      this.route.snapshot.paramMap.get('id') ||
      this.route.snapshot.queryParamMap.get('id') ||
      this.route.snapshot.queryParamMap.get('escalaId');

    if (!id) {
      this.router.navigateByUrl('/relatorios');
      return;
    }

    this.escalaId = id;
    const found = this.escalas.getById(id);

    if (!found) {
      this.router.navigateByUrl('/relatorios');
      return;
    }

    this.escala = found;
    this.relatorioTexto = found.relatorio ?? '';
    this.anexos = [...(found.anexos ?? [])];
  }

  close() {
    this.router.navigateByUrl('/relatorios');
  }

  save() {
    const texto = (this.relatorioTexto || '').trim();

    this.escalas.atualizar(this.escalaId, {
      relatorio: texto ? texto : undefined,
      anexos: this.anexos,
    });

    this.close();
  }

  labelTipo(e: Escala): string {
    if (e.tipo !== 'EXTRA') return e.tipo === 'ESCOLA_SEGURA' ? 'Escola Segura' : 'PMF';
    return `Extra • ${e.extraTipo ?? 'OUTRO'}`;
  }

  // ---------- Upload UI ----------

  onDragOver(ev: DragEvent) {
    ev.preventDefault();
    this.dragging = true;
  }

  onDragLeave(ev: DragEvent) {
    ev.preventDefault();
    this.dragging = false;
  }

  onDrop(ev: DragEvent) {
    ev.preventDefault();
    this.dragging = false;

    const files = ev.dataTransfer?.files;
    if (!files || files.length === 0) return;

    this.addFiles(files);
    this.tab = 'anexos';
  }

  onFilesSelected(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const files = input.files;
    if (!files || files.length === 0) return;

    this.addFiles(files);
    input.value = '';
    this.tab = 'anexos';
  }

  private addFiles(files: FileList) {
    Array.from(files).forEach(file => this.queueFile(file));
  }

  private queueFile(file: File) {
    const id = this.newId();
    const item: UploadItem = {
      id,
      name: file.name,
      size: file.size,
      mime: file.type || 'application/octet-stream',
      progress: 0,
      state: 'lendo',
    };

    this.uploads = [item, ...this.uploads];

    // animação visual de progresso
    const timer = setInterval(() => {
      const u = this.uploads.find(x => x.id === id);
      if (!u) { clearInterval(timer); return; }
      if (u.progress >= 90) { clearInterval(timer); return; }
      u.progress += 6;
    }, 120);

    const reader = new FileReader();

    reader.onload = () => {
      clearInterval(timer);

      const dataUrl = String(reader.result || '');

      // finaliza visual
      const u = this.uploads.find(x => x.id === id);
      if (u) {
        u.progress = 100;
        u.state = 'pronto';
      }

      const anexo: Anexo = {
        id,
        name: file.name,
        size: file.size,
        mime: file.type || 'application/octet-stream',
        dataUrl,
        createdAt: new Date().toISOString(),
      };

      this.anexos = [anexo, ...this.anexos];

      // remove da fila depois de um tempinho (só visual)
      setTimeout(() => this.removeUpload(id), 600);
    };

    reader.onerror = () => {
      clearInterval(timer);
      const u = this.uploads.find(x => x.id === id);
      if (u) {
        u.progress = 100;
        u.state = 'erro';
      }
    };

    reader.readAsDataURL(file);
  }

  removeUpload(id: string) {
    this.uploads = this.uploads.filter(u => u.id !== id);
  }

  removeAnexo(id: string) {
    this.anexos = this.anexos.filter(a => a.id !== id);
  }

  formatBytes(bytes: number): string {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const v = bytes / Math.pow(k, i);
    return `${v.toFixed(v >= 10 || i === 0 ? 0 : 1)} ${sizes[i]}`;
  }

  private newId(): string {
    return (globalThis.crypto?.randomUUID?.() ??
      `${Date.now()}-${Math.random().toString(16).slice(2)}`);
  }
}
