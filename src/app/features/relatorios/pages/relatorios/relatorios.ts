// src/app/features/relatorios/pages/relatorios/relatorios.ts
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EscalasService } from '../../../../core/services/escalas';
import { Escala } from '../../../../core/models/escala.model';
import { RelatoriosService, RelatorioAnexo } from '../../../../core/services/relatorios';
import { jsPDF } from 'jspdf';

type UploadItem = {
  id: string;
  name: string;
  size: number;
  mime: string;
  progress: number; // 0..100 (visual)
  state: 'lendo' | 'pronto' | 'erro';
};

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

        <!-- ABAS -->
        <div class="tabs">
          <button type="button" class="tab" [class.active]="tab==='texto'" (click)="tab='texto'">
            Texto
          </button>

          <button type="button" class="tab" [class.active]="tab==='anexos'" (click)="tab='anexos'">
            Anexos
            <span class="pill" *ngIf="draftAnexos.length">{{ draftAnexos.length }}</span>
          </button>
        </div>

        <!-- TEXTO -->
        <div class="form" *ngIf="tab==='texto'">
          <div class="field">
            <label>Texto do relatório</label>
            <textarea
              rows="9"
              [(ngModel)]="draftText"
              [ngModelOptions]="{standalone:true}"
              placeholder="Descreva a execução da escala, ocorrências, observações e conclusão..."
            ></textarea>
          </div>
        </div>

        <!-- ANEXOS -->
        <div class="form" *ngIf="tab==='anexos'">
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
              (change)="onFiles($event)"
              style="display:none"
            />

            <div class="hint">Dica: evite anexos muito grandes (localStorage tem limite).</div>
          </div>

          <!-- CARREGANDO -->
          <div *ngIf="uploads.length" class="list">
            <div class="listTitle">Carregando</div>

            <div *ngFor="let u of uploads" class="fileRow">
              <div class="fileMain">
                <div class="fileName">{{ u.name }}</div>
                <div class="fileSub">{{ formatSize(u.size) }}</div>

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

          <!-- LISTA DE ANEXOS -->
          <div *ngIf="draftAnexos.length" class="list">
            <div class="listTitle">Anexos</div>

            <div class="fileRow" *ngFor="let a of draftAnexos; let i = index">
              <div class="fileMain">
                <div class="fileName">{{ a.name }}</div>
                <div class="fileSub">{{ formatSize(a.size) }}</div>
              </div>

              <div class="actionsRight">
                <a class="link" [href]="a.dataUrl" [attr.download]="a.name">Baixar</a>
                <button class="danger" type="button" (click)="removeAnexo(i)">Remover</button>
              </div>
            </div>
          </div>

          <div *ngIf="!uploads.length && !draftAnexos.length" class="emptyNote">
            Nenhum anexo ainda. Use a área de upload acima.
          </div>
        </div>

        <div class="actions">
          <button class="btn" type="button" (click)="close()">Cancelar</button>

          <!-- ✅ PDF institucional (gera com o rascunho atual e salva também) -->
          <button class="btn" type="button" (click)="gerarPdf()">
            Gerar PDF
          </button>

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
    .modal{width:min(900px,100%);background:#fff;border-radius:16px;border:1px solid #e7e9ee;box-shadow:0 22px 60px rgba(2,6,23,.35);padding:14px;}
    .modalHeader{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;padding:4px 6px 10px;}
    .x{border:1px solid #e7e9ee;background:#fff;border-radius:12px;width:40px;height:40px;cursor:pointer;font-weight:900;}
    .muted{color:#64748b;font-size:12px;}

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

    .form{display:grid;gap:12px;padding:8px 6px 12px;}
    .field{display:grid;gap:6px;}
    label{font-weight:900;color:#0f172a;font-size:13px;}
    textarea{border:1px solid #e7e9ee;border-radius:12px;padding:12px;outline:none;font-weight:700;}
    textarea:focus{border-color:rgba(15,47,87,.45);box-shadow:0 0 0 4px rgba(15,47,87,.08);}

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
    .hint{font-size:12px;color:#64748b;font-weight:700;}

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
    .fileName{font-weight:900; color:#0f172a; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:540px;}
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
    .link{font-weight:900;color:#0b1f3a;text-decoration:none;}
    .link:hover{text-decoration:underline;}
    .danger{padding:8px 10px;border-radius:12px;border:1px solid #fecdd3;background:#fff1f2;color:#9f1239;font-weight:900;cursor:pointer;white-space:nowrap;}

    .actions{display:flex;justify-content:flex-end;gap:10px;padding:0 6px 6px;}
    .emptyNote{color:#64748b;font-weight:800;padding:6px 0;}
  `],
})
export class RelatoriosComponent implements OnInit {
  escalas: Escala[] = [];

  modalOpen = false;
  selected: Escala | null = null;

  tab: 'texto' | 'anexos' = 'texto';

  draftText = '';
  draftAnexos: RelatorioAnexo[] = [];

  dragging = false;
  uploads: UploadItem[] = [];

  constructor(
    private escalasService: EscalasService,
    private relatorios: RelatoriosService,
    private cdr: ChangeDetectorRef
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
    this.draftAnexos = existing?.anexos ? [...existing.anexos] : [];
    this.uploads = [];
    this.tab = 'texto';

    this.modalOpen = true;
    this.cdr.detectChanges();
  }

  close() {
    this.modalOpen = false;
    this.selected = null;
    this.draftText = '';
    this.draftAnexos = [];
    this.uploads = [];
    this.tab = 'texto';
    this.cdr.detectChanges();
  }

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

    this.addFiles(Array.from(files));
    this.tab = 'anexos';
    this.cdr.detectChanges();
  }

  onFiles(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    if (!files.length) return;

    this.addFiles(files);
    input.value = '';
    this.tab = 'anexos';
    this.cdr.detectChanges();
  }

  private addFiles(files: File[]) {
    for (const f of files) this.queueFile(f);
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

    // aparece IMEDIATO
    this.uploads = [item, ...this.uploads];
    this.cdr.detectChanges();

    // progresso VISUAL
    const timer = setInterval(() => {
      const u = this.uploads.find(x => x.id === id);
      if (!u) { clearInterval(timer); return; }
      if (u.progress >= 90) { clearInterval(timer); return; }
      u.progress += 6;
      this.cdr.detectChanges();
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

      // salva no draft
      const anexo: RelatorioAnexo = {
        name: file.name,
        mime: file.type || 'application/octet-stream',
        size: file.size,
        dataUrl,
      };

      this.draftAnexos = [anexo, ...this.draftAnexos];

      // remove da fila (visual)
      setTimeout(() => this.removeUpload(id), 600);

      this.cdr.detectChanges();
    };

    reader.onerror = () => {
      clearInterval(timer);
      const u = this.uploads.find(x => x.id === id);
      if (u) {
        u.progress = 100;
        u.state = 'erro';
      }
      this.cdr.detectChanges();
    };

    reader.readAsDataURL(file);
  }

  removeUpload(id: string) {
    this.uploads = this.uploads.filter(u => u.id !== id);
    this.cdr.detectChanges();
  }

  removeAnexo(i: number) {
    this.draftAnexos.splice(i, 1);
    this.cdr.detectChanges();
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

  // ✅ PDF institucional (gera com o rascunho atual e também salva)
  async gerarPdf() {
    if (!this.selected) return;

    // salva antes de gerar (pra não perder)
    this.relatorios.upsert(
      this.selected.id,
      this.draftText || '',
      this.draftAnexos || []
    );

    const e = this.selected;

    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 15;

    // tenta logo em: /assets/brasao-pmpa.png e /brasao-pmpa.png
    const logo = await this.tryLoadLogo([
      '/assets/brasao-pmpa.png',
      '/brasao-pmpa.png',
    ]).catch(() => null);

    let y = margin;

    // Cabeçalho institucional
    if (logo) {
      doc.addImage(logo, 'PNG', margin, y, 18, 18);
    }

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('POLÍCIA MILITAR DO PARÁ', logo ? margin + 22 : margin, y + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('DITEL • Sistema de Escalas', logo ? margin + 22 : margin, y + 13);

    y += 22;
    doc.setDrawColor(180, 190, 205);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageW - margin, y);

    y += 12;

    // Título
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('RELATÓRIO DE ESCALA', pageW / 2, y, { align: 'center' });

    y += 10;

    // Dados da escala
    const data = this.formatISOToPtBR(e.data);
    const turno = String(e.turno);
    const tipo = this.tipoLabel(e);
    const guarnicao = e.guarnicao || '—';
    const emissao = this.formatNowPtBR();

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Data:', margin, y);
    doc.text('Turno:', margin + 70, y);
    y += 6;
    doc.text('Tipo:', margin, y);
    doc.text('Guarnição:', margin + 70, y);
    y += 6;
    doc.text('Emissão:', margin, y);

    doc.setFont('helvetica', 'normal');
    doc.text(data, margin + 14, y - 12);
    doc.text(turno, margin + 84, y - 12);
    doc.text(tipo, margin + 14, y - 6);
    doc.text(guarnicao, margin + 92, y - 6);
    doc.text(emissao, margin + 18, y);

    // Texto do relatório
    y += 12;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('1. Texto do relatório', margin, y);

    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);

    const body = (this.draftText || '').trim() || '—';
    y = this.writeParagraph(doc, body, margin, y, pageW - margin * 2, 6, pageH);

    // Anexos (lista)
    y += 8;
    y = this.ensureSpace(doc, y, 20, pageH);

    doc.setFont('helvetica', 'bold');
    doc.text('2. Anexos', margin, y);

    y += 7;
    doc.setFont('helvetica', 'normal');

    if (!this.draftAnexos.length) {
      doc.text('—', margin, y);
      y += 6;
    } else {
      for (const a of this.draftAnexos) {
        y = this.ensureSpace(doc, y, 10, pageH);
        const line = `• ${a.name} (${this.formatSize(a.size)})`;
        const lines = doc.splitTextToSize(line, pageW - margin * 2);
        doc.text(lines, margin, y);
        y += lines.length * 6;
      }
    }

    // Rodapé
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(9);
      doc.text('PMPA • DITEL • Sistema de Escalas', margin, pageH - 10);
      doc.text(`Página ${i} de ${totalPages}`, pageW - margin, pageH - 10, { align: 'right' });
    }

    const fileName = `relatorio_${e.data}_${turno}`.replace(/\s+/g, '_') + '.pdf';
    doc.save(fileName);
  }

  formatSize(bytes: number): string {
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

  private formatISOToPtBR(iso: string): string {
    const [yy, mm, dd] = iso.split('-').map(Number);
    const dt = new Date(yy, (mm || 1) - 1, dd || 1);
    return new Intl.DateTimeFormat('pt-BR').format(dt);
  }

  private formatNowPtBR(): string {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date());
  }

  private ensureSpace(doc: jsPDF, y: number, needed: number, pageH: number): number {
    if (y + needed <= pageH - 18) return y;
    doc.addPage();
    return 20;
  }

  private writeParagraph(
    doc: jsPDF,
    text: string,
    x: number,
    y: number,
    width: number,
    lineH: number,
    pageH: number
  ): number {
    const lines = doc.splitTextToSize(text, width);
    for (const ln of lines) {
      y = this.ensureSpace(doc, y, lineH + 2, pageH);
      doc.text(ln, x, y);
      y += lineH;
    }
    return y;
  }

  private async tryLoadLogo(urls: string[]): Promise<string> {
    for (const u of urls) {
      try {
        return await this.fetchAsDataUrl(u);
      } catch {}
    }
    throw new Error('logo not found');
  }

  private async fetchAsDataUrl(url: string): Promise<string> {
    const res = await fetch(url);
    if (!res.ok) throw new Error('fetch failed');
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = () => reject(new Error('file reader failed'));
      r.readAsDataURL(blob);
    });
  }
}
