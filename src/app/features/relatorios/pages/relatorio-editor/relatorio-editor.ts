import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { EscalasService } from '../../../../core/services/escalas';
import { Escala, Anexo } from '../../../../core/models/escala.model';

/** PrimeNG v21 */
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { SelectButtonModule } from 'primeng/selectbutton';

type UploadItem = {
  id: string;
  name: string;
  size: number;
  mime: string;
  progress: number;
  state: 'lendo' | 'pronto' | 'erro';
  error?: string;
};

type TabKey = 'texto' | 'anexos';

@Component({
  selector: 'app-relatorio-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,

    DialogModule,
    ButtonModule,
    TextareaModule,
    SelectButtonModule,
  ],
  templateUrl: './relatorio-editor.html',
  styleUrls: ['./relatorio-editor.css'],
})
export class RelatorioEditorComponent implements OnInit {
  escalaId = '';
  escala: Escala | null = null;
  loading = true;

  // dialog
  visible = true;

  // tabs
  tab: TabKey = 'texto';
  tabOptions = [
    { label: 'Texto', value: 'texto' as TabKey },
    { label: 'Anexos', value: 'anexos' as TabKey },
  ];

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
      this.loading = false;
      this.router.navigateByUrl('/relatorios');
      return;
    }

    this.escalaId = id;
    const found = this.escalas.getById(id);

    if (!found) {
      this.loading = false;
      this.escala = null;
      return;
    }

    this.escala = found;
    this.relatorioTexto = found.relatorio ?? '';
    this.anexos = [...(found.anexos ?? [])];
    this.loading = false;
  }

  close() {
    this.visible = false;
    setTimeout(() => this.router.navigateByUrl('/relatorios'), 0);
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

  // ---------- Drag & Drop / Upload ----------

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
    Array.from(files).forEach((file) => this.queueFile(file));
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

    const timer = setInterval(() => {
      const u = this.uploads.find((x) => x.id === id);
      if (!u) return clearInterval(timer);
      if (u.progress >= 90) return clearInterval(timer);
      u.progress += 6;
    }, 120);

    const reader = new FileReader();

    reader.onload = () => {
      clearInterval(timer);

      const dataUrl = String(reader.result || '');
      const u = this.uploads.find((x) => x.id === id);
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

      setTimeout(() => this.removeUpload(id), 600);
    };

    reader.onerror = () => {
      clearInterval(timer);
      const u = this.uploads.find((x) => x.id === id);
      if (u) {
        u.progress = 100;
        u.state = 'erro';
        u.error = 'Erro ao ler arquivo';
      }
    };

    reader.readAsDataURL(file);
  }

  removeUpload(id: string) {
    this.uploads = this.uploads.filter((u) => u.id !== id);
  }

  removeAnexoById(id: string) {
    this.anexos = this.anexos.filter((a) => a.id !== id);
  }

  downloadAnexo(a: Anexo) {
    const link = document.createElement('a');
    link.href = a.dataUrl;
    link.download = a.name;
    link.click();
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
    return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}