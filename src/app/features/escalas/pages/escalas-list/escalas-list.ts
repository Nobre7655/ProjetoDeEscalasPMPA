// src/app/features/escalas/pages/escalas-list/escalas-list.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { EscalasService } from '../../../../core/services/escalas';
import { Escala } from '../../../../core/models/escala.model';

@Component({
  selector: 'app-escalas-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './escalas-list.html',
  styleUrl: './escalas-list.css',
})
export class EscalasListComponent implements OnInit {
  escalas: Escala[] = [];

  constructor(private escalasService: EscalasService) {}

  ngOnInit(): void {
    this.escalas = this.escalasService.listar();
  }

  remover(id: string) {
    this.escalasService.remover(id);
    this.escalas = this.escalasService.listar();
  }
}
