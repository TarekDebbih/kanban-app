import { Injectable } from '@angular/core';
import { StoredAuth } from '../models/auth';

const KEY = 'kanban_token';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  store(auth: StoredAuth, persistent: boolean): void {
    this.clear();
    const target = persistent ? localStorage : sessionStorage;
    target.setItem(KEY, JSON.stringify(auth));
  }

  read(): StoredAuth | null {
    const raw = localStorage.getItem(KEY) ?? sessionStorage.getItem(KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as StoredAuth;
    } catch {
      return null;
    }
  }

  clear(): void {
    localStorage.removeItem(KEY);
    sessionStorage.removeItem(KEY);
  }
}
