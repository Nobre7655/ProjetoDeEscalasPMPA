// src/app/layout/layout.ts
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../core/services/auth';
import { SessionUser } from '../core/services/auth';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="shell">
      <aside class="sidebar">
        <!-- BRAND -->
        <div class="brandCard">
          <div class="brandLogo">
            <img src="/assets/brasao-pmpa.png" alt="Brasão PMPA" />
          </div>
          <div class="brandText">
            <div class="brandTitle">Escalas</div>
            <div class="brandSub">Sistema de Escalas</div>
          </div>
        </div>

        <!-- MENU -->
        <nav class="menu">
          <a class="menuItem" routerLink="/painel" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">
            <span class="dot"></span>
            <span class="label">Painel Geral</span>
          </a>

          <a class="menuItem" routerLink="/calendario" routerLinkActive="active">
            <span class="dot"></span>
            <span class="label">Calendário</span>
          </a>

          <a class="menuItem" routerLink="/escalas" routerLinkActive="active">
            <span class="dot"></span>
            <span class="label">Escalas</span>
          </a>

          <a class="menuItem" routerLink="/relatorios" routerLinkActive="active">
            <span class="dot"></span>
            <span class="label">Relatórios</span>
          </a>
        </nav>

        <!-- USER / FOOTER -->
        <div class="footer">
          <div class="userCard" *ngIf="user as u">
            <div class="avatar">{{ (u.displayName || 'U').slice(0,1).toUpperCase() }}</div>
            <div class="userText">
              <div class="userName">{{ u.displayName }}</div>
              <div class="userRole">{{ u.role.toUpperCase() }}</div>
            </div>
          </div>

          <button class="logout" type="button" (click)="sair()">Sair</button>
          <div class="version">
            <span class="dotOnline"></span> v0.1
          </div>
        </div>
      </aside>

      <main class="content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .shell{display:grid;grid-template-columns:320px 1fr;min-height:100vh;background:#f4f6fa;}
    .sidebar{
      padding:18px;
      background: radial-gradient(1200px 700px at 30% 0%, #2b4f78 0%, #0b1f3a 48%, #071a31 100%);
      color:#fff;
      display:flex;
      flex-direction:column;
      gap:18px;
      border-right:1px solid rgba(255,255,255,.08);
    }
    .brandCard{
      display:flex;gap:14px;align-items:center;
      padding:14px;border-radius:18px;
      background:rgba(255,255,255,.10);
      border:1px solid rgba(255,255,255,.10);
      box-shadow:0 18px 40px rgba(0,0,0,.22);
    }
    .brandLogo{
      width:62px;height:62px;border-radius:16px;
      display:grid;place-items:center;
      background:#fff;
      overflow:hidden;
    }
    .brandLogo img{width:56px;height:56px;object-fit:contain;}
    .brandTitle{font-weight:900;font-size:22px;line-height:1;}
    .brandSub{opacity:.85;margin-top:6px;font-weight:600;}

    .menu{display:grid;gap:14px;margin-top:6px;}
    .menuItem{
      display:flex;align-items:center;gap:12px;
      padding:16px 16px;border-radius:18px;
      text-decoration:none;color:#fff;
      background:rgba(255,255,255,.08);
      border:1px solid rgba(255,255,255,.10);
      box-shadow: inset 0 1px 0 rgba(255,255,255,.12);
      transition:.18s ease;
      font-weight:900;
      font-size:22px;
    }
    .menuItem:hover{transform:translateY(-1px);background:rgba(255,255,255,.12);}
    .menuItem .dot{
      width:12px;height:12px;border-radius:999px;
      background:rgba(255,255,255,.22);
      box-shadow:0 0 0 6px rgba(255,255,255,.06);
    }
    .menuItem.active{
      outline:1px solid rgba(212,175,55,.55);
      background:rgba(212,175,55,.10);
    }
    .menuItem.active .dot{background:#d4af37;box-shadow:0 0 0 6px rgba(212,175,55,.14);}

    .footer{margin-top:auto;display:grid;gap:14px;}
    .userCard{
      display:flex;gap:14px;align-items:center;
      padding:16px;border-radius:18px;
      background:rgba(255,255,255,.08);
      border:1px solid rgba(255,255,255,.10);
    }
    .avatar{
      width:54px;height:54px;border-radius:16px;
      background:#d4af37;color:#0b1f3a;
      display:grid;place-items:center;
      font-weight:1000;font-size:22px;
    }
    .userName{font-weight:1000;font-size:22px;line-height:1.1;}
    .userRole{opacity:.85;margin-top:4px;font-weight:900;letter-spacing:.04em;}
    .logout{
      padding:16px;border-radius:18px;
      border:1px solid rgba(255,255,255,.16);
      background:rgba(255,255,255,.06);
      color:#fff;font-weight:1000;font-size:20px;
      cursor:pointer;
    }
    .logout:hover{background:rgba(255,255,255,.10);}
    .version{opacity:.9;font-weight:900;display:flex;align-items:center;gap:10px;}
    .dotOnline{width:12px;height:12px;border-radius:999px;background:#22c55e;box-shadow:0 0 0 5px rgba(34,197,94,.18);}

    .content{padding:18px;}
    @media (max-width: 980px){
      .shell{grid-template-columns:1fr;}
      .sidebar{position:sticky;top:0;z-index:10;}
    }
  `]
})
export class LayoutComponent {
  constructor(private auth: AuthService, private router: Router) {}

  // ✅ getter evita "auth usado antes de inicializar"
  get user(): SessionUser | null {
    return this.auth.getCurrentUser();
  }

  sair() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
