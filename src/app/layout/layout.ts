// src/app/layout/layout.ts
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService, SessionUser } from '../core/services/auth';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="shell">
      <aside class="sidebar">
        <!-- BRAND -->
        <div class="brand">
          <div class="brandLogo" aria-hidden="true">
            <img src="/assets/brasao-pmpa.png" alt="Brasão PMPA" />
          </div>

          <div class="brandText">
            <div class="brandTitle">Escalas DITEL</div>
            <div class="brandSub">Polícia Militar do Pará • Sistema de Escalas</div>
          </div>
        </div>

        <div class="divider"></div>

        <!-- MENU -->
        <nav class="menu" aria-label="Menu lateral">
          <a
            class="menuItem"
            routerLink="/painel"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }"
          >
            <span class="menuIcon" aria-hidden="true"></span>
            <span class="label">Painel Geral</span>
          </a>

          <a class="menuItem" routerLink="/calendario" routerLinkActive="active">
            <span class="menuIcon" aria-hidden="true"></span>
            <span class="label">Calendário</span>
          </a>

          <a class="menuItem" routerLink="/escalas" routerLinkActive="active">
            <span class="menuIcon" aria-hidden="true"></span>
            <span class="label">Escalas</span>
          </a>

          <a class="menuItem" routerLink="/relatorios" routerLinkActive="active">
            <span class="menuIcon" aria-hidden="true"></span>
            <span class="label">Relatórios</span>
          </a>
        </nav>

        <!-- FOOTER -->
        <div class="footer">
          <div class="userBox" *ngIf="user as u">
            <div class="avatar" aria-hidden="true">
              {{ (u.displayName || 'U').slice(0, 1).toUpperCase() }}
            </div>
            <div class="userText">
              <div class="userName">{{ u.displayName }}</div>
              <div class="userRole">{{ u.role.toUpperCase() }}</div>
            </div>
          </div>

          <button class="logout" type="button" (click)="sair()">
            Sair
          </button>

          <div class="version">
            <span class="status" aria-hidden="true"></span>
            v0.1
          </div>
        </div>
      </aside>

      <main class="content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    /* Layout geral */
    .shell{
      display:grid;
      grid-template-columns: 308px 1fr;
      min-height:100vh;
      background:#f4f6fa;
    }

    /* Sidebar institucional */
    .sidebar{
      background:#0b1f3a;
      color:#ffffff;
      padding:18px 16px;
      border-right: 1px solid rgba(255,255,255,.10);
      display:flex;
      flex-direction:column;
    }

    /* Brand topo */
    .brand{
      display:flex;
      align-items:center;
      gap:12px;
      padding:10px 8px;
    }
    .brandLogo{
      width:54px;
      height:54px;
      border-radius:10px;
      background:#ffffff;
      display:grid;
      place-items:center;
      overflow:hidden;
      border:1px solid rgba(11,31,58,.18);
    }
    .brandLogo img{
      width:46px;
      height:46px;
      object-fit:contain;
    }
    .brandText{min-width:0;}
    .brandTitle{
      font-size:18px;
      font-weight:900;
      letter-spacing:.2px;
      line-height:1.1;
    }
    .brandSub{
      margin-top:4px;
      font-size:12px;
      opacity:.85;
      font-weight:600;
      line-height:1.2;
    }

    .divider{
      height:1px;
      background: rgba(255,255,255,.12);
      margin: 10px 0 14px;
    }

    /* Menu */
    .menu{
      display:grid;
      gap:10px;
    }

    .menuItem{
      position:relative;
      display:flex;
      align-items:center;
      gap:10px;

      padding:12px 12px 12px 12px;
      border-radius:10px;

      text-decoration:none;
      color:#ffffff;

      background: rgba(255,255,255,.04);
      border: 1px solid rgba(255,255,255,.10);

      font-weight:800;
      font-size:14px;

      transition: background .15s ease, border-color .15s ease, transform .15s ease;
      outline:none;
    }

    .menuItem:hover{
      background: rgba(255,255,255,.08);
      border-color: rgba(255,255,255,.16);
      transform: translateY(-1px);
    }

    .menuItem:focus-visible{
      box-shadow: 0 0 0 3px rgba(212,175,55,.22);
      border-color: rgba(212,175,55,.55);
    }

    /* Ícone simples institucional */
    .menuIcon{
      width:10px;
      height:10px;
      border-radius:999px;
      background: rgba(255,255,255,.35);
      flex: 0 0 auto;
    }

    /* Ativo: barra dourada */
    .menuItem.active{
      background: rgba(255,255,255,.08);
      border-color: rgba(212,175,55,.40);
    }
    .menuItem.active::before{
      content:'';
      position:absolute;
      left:0;
      top:8px;
      bottom:8px;
      width:4px;
      background:#d4af37;
      border-radius:6px;
    }
    .menuItem.active .menuIcon{
      background:#d4af37;
    }

    /* Footer */
    .footer{
      margin-top:auto;
      display:grid;
      gap:12px;
      padding-top:14px;
    }

    .userBox{
      display:flex;
      align-items:center;
      gap:12px;

      padding:12px;
      border-radius:12px;
      background: rgba(255,255,255,.05);
      border: 1px solid rgba(255,255,255,.10);
    }

    .avatar{
      width:44px;
      height:44px;
      border-radius:10px;
      display:grid;
      place-items:center;
      background:#d4af37;
      color:#0b1f3a;
      font-weight:1000;
      font-size:16px;
      flex:0 0 auto;
    }

    .userName{
      font-size:14px;
      font-weight:1000;
      line-height:1.1;
    }
    .userRole{
      margin-top:4px;
      font-size:11px;
      font-weight:900;
      letter-spacing:.06em;
      opacity:.85;
    }

    .logout{
      padding:12px;
      border-radius:10px;
      border: 1px solid rgba(255,255,255,.16);
      background: rgba(255,255,255,.04);
      color:#ffffff;
      font-weight:900;
      font-size:14px;
      cursor:pointer;
      transition: background .15s ease, border-color .15s ease;
    }
    .logout:hover{
      background: rgba(255,255,255,.08);
      border-color: rgba(255,255,255,.22);
    }

    .version{
      display:flex;
      align-items:center;
      gap:10px;
      font-size:12px;
      font-weight:800;
      opacity:.9;
    }
    .status{
      width:10px;
      height:10px;
      border-radius:999px;
      background:#22c55e;
      box-shadow: 0 0 0 5px rgba(34,197,94,.16);
    }

    /* Conteúdo */
    .content{
      padding:18px;
    }

    @media (max-width: 980px){
      .shell{grid-template-columns: 1fr;}
      .sidebar{position:sticky;top:0;z-index:10;}
    }
  `]
})
export class LayoutComponent {
  constructor(private auth: AuthService, private router: Router) {}

  get user(): SessionUser | null {
    return this.auth.getCurrentUser();
  }

  sair() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
