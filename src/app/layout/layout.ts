import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../core/services/auth';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="shell">
      <aside class="sidebar">
        <div class="brand">
          <div class="badge">PMPA</div>
          <div class="brandText">
            <div class="title">Escalas</div>
            <div class="sub">Sistema de Escalas</div>
          </div>
        </div>

        <nav class="nav">
          <a
            routerLink="/calendario"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }"
            class="item"
          >
            <span class="dot"></span>
            Calendário
          </a>

          <a
            routerLink="/escalas"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }"
            class="item"
          >
            <span class="dot"></span>
            Escalas
          </a>
        </nav>

        <div class="spacer"></div>

        <div class="footer">
          <div class="user">
            <div class="avatar">{{ initials() }}</div>
            <div class="userText">
              <div class="userName">{{ displayName() }}</div>
              <div class="userRole">{{ role() }}</div>
            </div>
          </div>

          <button class="logout" type="button" (click)="sair()">
            Sair
          </button>

          <div class="ver">
            <span class="status"></span>
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
    .shell{
      min-height: 100vh;
      display: grid;
      grid-template-columns: 280px 1fr;
      background: #f6f7f9;
      font-family: system-ui, Segoe UI, Roboto, Arial;
    }

    .sidebar{
      background: linear-gradient(180deg, #0f2f57 0%, #0b1f3a 100%);
      padding: 18px 16px;
      display: grid;
      grid-template-rows: auto auto 1fr auto;
      gap: 16px;
      box-shadow: 6px 0 18px rgba(2,6,23,.18);
    }

    .brand{
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border-radius: 16px;
      background: rgba(255,255,255,.08);
      border: 1px solid rgba(255,255,255,.10);
    }

    .badge{
      width: 44px;
      height: 44px;
      border-radius: 14px;
      background: #d4af37;
      color: #111;
      display: grid;
      place-items: center;
      font-weight: 900;
      letter-spacing: .5px;
      flex: 0 0 auto;
    }

    .brandText .title{
      color: #fff;
      font-weight: 900;
      font-size: 16px;
      line-height: 1.1;
    }
    .brandText .sub{
      color: rgba(255,255,255,.75);
      font-weight: 600;
      font-size: 12px;
      margin-top: 2px;
    }

    .nav{ display: grid; gap: 10px; }

    .item{
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 12px;
      border-radius: 14px;
      color: rgba(255,255,255,.92);
      text-decoration: none;
      font-weight: 800;
      background: rgba(255,255,255,.06);
      border: 1px solid rgba(255,255,255,.08);
      transition: .15s ease;
    }

    .item:hover{
      background: rgba(255,255,255,.10);
      border-color: rgba(212,175,55,.35);
      transform: translateY(-1px);
    }

    .dot{
      width: 10px;
      height: 10px;
      border-radius: 999px;
      background: rgba(255,255,255,.35);
      box-shadow: 0 0 0 4px rgba(255,255,255,.06);
    }

    .item.active{
      background: rgba(255,255,255,.12);
      border-color: rgba(212,175,55,.65);
      box-shadow: 0 0 0 4px rgba(212,175,55,.10);
    }
    .item.active .dot{
      background: #d4af37;
      box-shadow: 0 0 0 4px rgba(212,175,55,.18);
    }

    .spacer{ height: 1px; }

    .footer{
      display: grid;
      gap: 12px;
      padding: 12px;
      border-radius: 16px;
      background: rgba(255,255,255,.08);
      border: 1px solid rgba(255,255,255,.10);
    }

    .user{
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .avatar{
      width: 38px;
      height: 38px;
      border-radius: 14px;
      background: rgba(212,175,55,.18);
      border: 1px solid rgba(212,175,55,.35);
      color: #fff;
      display: grid;
      place-items: center;
      font-weight: 900;
    }

    .userName{
      color: #fff;
      font-weight: 900;
      font-size: 13px;
      line-height: 1.1;
    }
    .userRole{
      color: rgba(255,255,255,.72);
      font-weight: 700;
      font-size: 12px;
      margin-top: 2px;
    }

    .logout{
      padding: 10px 12px;
      border-radius: 14px;
      border: 1px solid rgba(254,205,211,.55);
      background: rgba(255,241,242,.12);
      color: #fff;
      font-weight: 900;
      cursor: pointer;
      transition: .15s ease;
    }
    .logout:hover{
      border-color: rgba(254,205,211,.85);
      background: rgba(255,241,242,.18);
      transform: translateY(-1px);
    }

    .ver{
      display: flex;
      align-items: center;
      gap: 8px;
      color: rgba(255,255,255,.7);
      font-weight: 700;
      font-size: 12px;
    }
    .status{
      width: 8px;
      height: 8px;
      border-radius: 999px;
      background: #22c55e;
    }

    .content{
      padding: 22px;
    }

    @media (max-width: 980px){
      .shell{ grid-template-columns: 1fr; }
      .sidebar{ position: sticky; top: 0; z-index: 10; }
      .content{ padding: 14px; }
    }
  `],
})
export class LayoutComponent {
  private user = computed(() => this.auth.getCurrentUser()
);

  constructor(private auth: AuthService, private router: Router) {}

  displayName = () => this.user()?.displayName ?? 'Usuário';
  role = () => (this.user()?.role ?? 'user').toUpperCase();

  initials(): string {
    const name = (this.user()?.displayName ?? 'U').trim();
    const parts = name.split(/\s+/).filter(Boolean);
    const a = parts[0]?.[0] ?? 'U';
    const b = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (a + b).toUpperCase();
  }

  sair() {
    this.auth.logout();
    this.router.navigateByUrl('/auth/login');
  }
}
