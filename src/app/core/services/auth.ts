// Caminho: src/app/core/services/auth.ts

import { Injectable, signal, computed } from '@angular/core';

export type Role = 'admin' | 'user';

export interface AuthUser {
  id: string;
  username: string;
  password: string;
  displayName: string;
  role: Role;
}

export type SessionUser = Omit<AuthUser, 'password'>;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly usersKey = 'pmpa_users_v1';
  private readonly sessionKey = 'pmpa_session_v1';

  private _current = signal<SessionUser | null>(null);

  // ✅ para o Layout usar (ex.: this.auth.currentUser())
  readonly currentUser = computed(() => this._current());

  // ✅ para Guard usar (ex.: this.auth.loggedIn())
  readonly loggedIn = computed(() => !!this._current());

  constructor() {
    this.seedDefaultAdmin();
    this.restoreSession();
  }

  // ✅ usado pelo Guard (se você já tem guard pronto chamando método)
  isLoggedIn(): boolean {
    return !!this._current();
  }

  // ✅ usado pelo Layout/Menu (se você usa método)
  getCurrentUser(): SessionUser | null {
    return this._current();
  }

  login(username: string, password: string): boolean {
    // ✅ importante: depois de limpar localStorage, garante o admin novamente
    this.seedDefaultAdmin();

    const u = (username ?? '').trim();
    const p = (password ?? '').trim();

    const users = this.readUsers();
    const found = users.find(
      x => x.username.toLowerCase() === u.toLowerCase() && x.password === p
    );

    if (!found) return false;

    const session: SessionUser = {
      id: found.id,
      username: found.username,
      displayName: found.displayName,
      role: found.role,
    };

    localStorage.setItem(this.sessionKey, JSON.stringify(session));
    this._current.set(session);
    return true;
  }

  logout() {
    localStorage.removeItem(this.sessionKey);
    this._current.set(null);
  }

  private seedDefaultAdmin() {
    const users = this.readUsers();
    if (users.length > 0) return;

    const admin: AuthUser = {
      id: this.newId(),
      username: 'admin',
      password: '1234',
      displayName: 'Administrador',
      role: 'admin',
    };

    this.writeUsers([admin]);
  }

  private restoreSession() {
    try {
      const raw = localStorage.getItem(this.sessionKey);
      if (!raw) return;

      const session = JSON.parse(raw);
      if (session?.id && session?.username) this._current.set(session);
    } catch {}
  }

  private readUsers(): AuthUser[] {
    try {
      const raw = localStorage.getItem(this.usersKey);
      return raw ? (JSON.parse(raw) as AuthUser[]) : [];
    } catch {
      return [];
    }
  }

  private writeUsers(users: AuthUser[]) {
    localStorage.setItem(this.usersKey, JSON.stringify(users));
  }

  private newId(): string {
    return (
      globalThis.crypto?.randomUUID?.() ??
      `${Date.now()}-${Math.random().toString(16).slice(2)}`
    );
  }
}
