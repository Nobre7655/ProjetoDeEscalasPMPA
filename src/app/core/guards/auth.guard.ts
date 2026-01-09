// src/app/core/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // AuthService tem isLoggedIn() (método)
  if (auth.isLoggedIn()) return true;

  // redireciona pro login se não estiver logado
  return router.parseUrl('/login');
};
