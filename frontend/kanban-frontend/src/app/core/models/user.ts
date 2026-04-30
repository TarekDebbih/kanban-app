export type Role = 'Admin' | 'Standard';

export interface User {
  id: number;
  email: string;
  role: Role;
}
