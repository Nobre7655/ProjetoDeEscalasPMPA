// src/app/app.routes.ts
import { Routes } from '@angular/router';

import { LayoutComponent } from './layout/layout';
import { LoginComponent } from './features/auth/login/login';
import { NotFoundComponent } from './features/not-found/not-found';

import { PainelGeralComponent } from './features/dashboard/pages/painel-geral/painel-geral';
import { EscalasCalendarComponent } from './features/escalas/pages/escalas-calendar/escalas-calendar';
import { EscalasListComponent } from './features/escalas/pages/escalas-list/escalas-list';

import { RelatoriosComponent } from './features/relatorios/pages/relatorios/relatorios';
import { RelatorioEditorComponent } from './features/relatorios/pages/relatorio-editor/relatorio-editor';

import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },

  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'painel' },

      { path: 'painel', component: PainelGeralComponent },
      { path: 'calendario', component: EscalasCalendarComponent },
      { path: 'escalas', component: EscalasListComponent },

      { path: 'relatorios', component: RelatoriosComponent },
      { path: 'relatorios/:id', component: RelatorioEditorComponent },

      { path: '**', component: NotFoundComponent },
    ],
  },

  { path: '**', redirectTo: 'login' },
];
