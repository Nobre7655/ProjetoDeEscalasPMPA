export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  username: string;      // login (único)
  password: string;      // por enquanto simples (depois hash no backend)
  displayName: string;   // nome que aparece no sistema
  role: UserRole;
}
