import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="wrap">
      <div class="card">
        <div class="header">
          <div class="badge">PMPA</div>
          <div>
            <h1>Projeto de Escalas</h1>
            <p>Faça login para acessar o sistema.</p>
          </div>
        </div>

        <form (ngSubmit)="entrar()" class="form">
          <label>
            Usuário
            <input [(ngModel)]="username" name="username" autocomplete="username" placeholder="admin ou operador" />
          </label>

          <label>
            Senha
            <input [(ngModel)]="password" name="password" type="password" autocomplete="current-password" placeholder="1234" />
          </label>

          <div *ngIf="error" class="error">{{ error }}</div>

          <button class="btn" type="submit" [disabled]="loading">
            {{ loading ? 'Entrando...' : 'Entrar' }}
          </button>

          <div class="hint">
            <strong>Teste:</strong> <code>admin</code>/<code>1234</code> ou <code>operador</code>/<code>1234</code>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .wrap{min-height:100vh;display:grid;place-items:center;padding:18px;background:linear-gradient(180deg,#0b1f3a 0%,#091a31 45%,#f6f7f9 45%,#f6f7f9 100%);font-family:system-ui,Segoe UI,Roboto,Arial;}
    .card{width:100%;max-width:460px;background:#fff;border:1px solid #e7e9ee;border-radius:16px;box-shadow:0 16px 40px rgba(2,6,23,.18);padding:18px;}
    .header{display:flex;gap:12px;align-items:center;margin-bottom:14px;}
    .badge{width:44px;height:44px;border-radius:14px;background:#d4af37;display:grid;place-items:center;font-weight:900;color:#111;letter-spacing:.5px;}
    h1{margin:0;font-size:18px;color:#0f172a;}
    p{margin:4px 0 0;color:#64748b;font-size:13px;}
    .form{display:grid;gap:12px;margin-top:10px;}
    label{display:grid;gap:6px;font-weight:800;color:#0f172a;font-size:13px;}
    input{padding:12px;border-radius:12px;border:1px solid #e7e9ee;outline:none;font-weight:600;}
    input:focus{border-color:rgba(15,47,87,.55);box-shadow:0 0 0 4px rgba(15,47,87,.10);}
    .error{padding:10px 12px;border-radius:12px;background:#fff1f2;border:1px solid #fecdd3;color:#9f1239;font-weight:700;font-size:13px;}
    .btn{padding:12px 14px;border:0;border-radius:12px;cursor:pointer;font-weight:900;color:#fff;background:linear-gradient(180deg,#0f2f57,#0b1f3a);}
    .btn:disabled{opacity:.7;cursor:not-allowed;}
    .hint{margin-top:6px;color:#64748b;font-size:12px;}
    code{background:#f1f5f9;padding:2px 6px;border-radius:8px;color:#0f172a;font-weight:800;}
  `],
})
export class LoginComponent {
  username = '';
  password = '';
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router, private route: ActivatedRoute) {}

  entrar() {
    this.error = '';
    const ok = this.auth.login(this.username, this.password);
    if (!ok) {
      this.error = 'Usuário ou senha inválidos.';
      return;
    }

    const redirect = this.route.snapshot.queryParamMap.get('redirect') || '/calendario';
    this.router.navigateByUrl(redirect);
  }
}
