import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EscalasService } from '../../../../core/services/escalas';
import { Escala } from '../../../../core/models/escala.model';
import { RelatoriosService, RelatorioAnexo } from '../../../../core/services/relatorios';
import { jsPDF } from 'jspdf';

/** PrimeNG v21 */
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TextareaModule } from 'primeng/textarea';

type UploadItem = {
  id: string;
  name: string;
  size: number;
  mime: string;
  progress: number; // 0..100 (visual)
  state: 'lendo' | 'pronto' | 'erro';
};

type TabKey = 'texto' | 'anexos';

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,

    DialogModule,
    ButtonModule,
    SelectButtonModule,
    TextareaModule,
  ],
  templateUrl: './relatorios.html',
  styleUrls: ['./relatorios.css'],
})
export class RelatoriosComponent implements OnInit {
  escalas: Escala[] = [];

  // Dialog
  modalOpen = false;
  selected: Escala | null = null;

  // Tabs
  tab: TabKey = 'texto';
  tabOptions = [
    { label: 'Texto', value: 'texto' as TabKey },
    { label: 'Anexos', value: 'anexos' as TabKey },
  ];

  // Draft
  draftText = '';
  draftAnexos: RelatorioAnexo[] = [];

  dragging = false;
  uploads: UploadItem[] = [];

  // Mensagens/erros de upload/salvamento
  uploadError = '';

  // Limites (localStorage não aguenta anexos grandes)
  private readonly MAX_FILE_BYTES = 2 * 1024 * 1024;   // 2MB por arquivo
  private readonly MAX_TOTAL_BYTES = 4 * 1024 * 1024;  // 4MB total do relatório

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
    this.uploadError = '';

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
    this.uploadError = '';
    this.cdr.detectChanges();
  }

  baixarAnexo(a: RelatorioAnexo) {
    globalThis.open(a.dataUrl, '_blank');
  }

  private totalDraftBytes(): number {
    return (this.draftAnexos ?? []).reduce((sum, a) => sum + (a.size || 0), 0);
  }

  // ---------- Upload ----------

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
    this.uploadError = '';

    // 1) bloqueia arquivo grande
    if (file.size > this.MAX_FILE_BYTES) {
      this.uploadError =
        `Arquivo muito grande (${this.formatSize(file.size)}). ` +
        `Máximo permitido: ${this.formatSize(this.MAX_FILE_BYTES)}.`;
      this.cdr.detectChanges();
      return;
    }

    // 2) bloqueia total
    const totalAfter = this.totalDraftBytes() + file.size;
    if (totalAfter > this.MAX_TOTAL_BYTES) {
      this.uploadError =
        `Limite total de anexos atingido. ` +
        `Total atual: ${this.formatSize(this.totalDraftBytes())}. ` +
        `Máximo: ${this.formatSize(this.MAX_TOTAL_BYTES)}.`;
      this.cdr.detectChanges();
      return;
    }

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
    this.cdr.detectChanges();

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

      const u = this.uploads.find(x => x.id === id);
      if (u) {
        u.progress = 100;
        u.state = 'pronto';
      }

      const anexo: RelatorioAnexo = {
        name: file.name,
        mime: file.type || 'application/octet-stream',
        size: file.size,
        dataUrl,
      };

      this.draftAnexos = [anexo, ...this.draftAnexos];

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
      this.uploadError = 'Erro ao ler arquivo.';
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

    try {
      this.relatorios.upsert(this.selected.id, this.draftText || '', this.draftAnexos || []);
      this.close();
    } catch {
      this.uploadError =
        'Não foi possível salvar (limite de armazenamento do navegador atingido). ' +
        'Remova anexos grandes e tente novamente.';
      this.cdr.detectChanges();
    }
  }

  async gerarPdf() {
    if (!this.selected) return;

    this.relatorios.upsert(this.selected.id, this.draftText || '', this.draftAnexos || []);

    const e = this.selected;

    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 15;

    const logo = await this.tryLoadLogo([
      '/assets/brasao-pmpa.png',
      '/brasao-pmpa.png',
    ]).catch(() => null);

    let y = margin;

    if (logo) doc.addImage(logo, 'PNG', margin, y, 18, 18);

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

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('RELATÓRIO DE ESCALA', pageW / 2, y, { align: 'center' });

    y += 10;

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

    y += 12;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('1. Texto do relatório', margin, y);

    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);

    const body = (this.draftText || '').trim() || '—';
    y = this.writeParagraph(doc, body, margin, y, pageW - margin * 2, 6, pageH);

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