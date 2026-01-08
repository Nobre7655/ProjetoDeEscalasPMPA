import { Routes } from '@angular/router';

import { LayoutComponent } from './layout/layout';
import { LoginComponent } from './features/auth/login/login';
import { EscalasListComponent } from './features/escalas/pages/escalas-list/escalas-list';
import { EscalasFormComponent } from './features/escalas/pages/escalas-form/escalas-form';
import { EscalasCalendarComponent } from './features/escalas/pages/escalas-calendar/escalas-calendar';
import { NotFoundComponent } from './features/not-found/not-found';

import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // ✅ entra primeiro no login
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },

  // ✅ login
  { path: 'auth/login', component: LoginComponent },

  // ✅ tudo que precisa estar logado
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      // ✅ calendário (nova home depois do login)
      { path: 'calendario', component: EscalasCalendarComponent },

      // ✅ páginas antigas
      { path: 'escalas', component: EscalasListComponent },
      { path: 'escalas/nova', component: EscalasFormComponent },

      // ✅ se acessar raiz logado, manda pro calendário
      { path: '', redirectTo: 'calendario', pathMatch: 'full' },
    ],
  },

  // ✅ not found
  { path: '**', component: NotFoundComponent },
];
