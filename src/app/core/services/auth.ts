import { Injectable, signal } from '@angular/core';

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

  constructor() {
    this.seedDefaultAdmin();
    this.restoreSession();
  }

  // ✅ usado pelo Guard
  isLoggedIn(): boolean {
    return !!this._current();
  }

  // ✅ usado pelo Layout/Menu (se quiser mostrar nome/role)
  getCurrentUser(): SessionUser | null {
    return this._current();
  }

  login(username: string, password: string): boolean {
    this.seedDefaultAdmin();

    const users = this.readUsers();
    const found = users.find(
      u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
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
    return (globalThis.crypto?.randomUUID?.() ??
      `${Date.now()}-${Math.random().toString(16).slice(2)}`);
  }
}
