import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService, SessionUser } from '../core/services/auth';

/** PrimeNG */
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule],
  templateUrl: './layout.html',
  styleUrls: ['./layout.css'],
})
export class LayoutComponent {
  mobileOpen = false;

  constructor(private auth: AuthService, private router: Router) {}

  get user(): SessionUser | null {
    return this.auth.getCurrentUser();
  }

  toggleMobile() {
    this.mobileOpen = !this.mobileOpen;
  }

  closeMobile() {
    this.mobileOpen = false;
  }

  sair() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}