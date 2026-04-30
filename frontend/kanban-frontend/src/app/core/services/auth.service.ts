import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, StoredAuth } from '../models/auth';
import { Role, User } from '../models/user';
import { TokenStorageService } from './token-storage.service';

interface JwtPayload {
  nameid?: string;
  sub?: string;
  email?: string;
  role?: string;
  exp?: number;
  [k: string]: unknown;
}

function decodeJwt(token: string): JwtPayload | null {
  try {
    const payload = token.split('.')[1];
    const padded = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(padded + '==='.slice((padded.length + 3) % 4));
    return JSON.parse(decodeURIComponent(escape(json))) as JwtPayload;
  } catch {
    try {
      return JSON.parse(atob(token.split('.')[1])) as JwtPayload;
    } catch {
      return null;
    }
  }
}

function extractUserId(payload: JwtPayload | null): number | null {
  if (!payload) return null;
  const nameId =
    payload['nameid'] ??
    payload['sub'] ??
    payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
  if (typeof nameId === 'string' || typeof nameId === 'number') {
    const n = Number(nameId);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(TokenStorageService);

  private readonly _currentUser = signal<User | null>(null);
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);
  readonly isAdmin = computed(() => this._currentUser()?.role === 'Admin');

  constructor() {
    this.restore();
  }

  private restore(): void {
    const stored = this.storage.read();
    if (!stored) return;
    if (stored.expiration && new Date(stored.expiration).getTime() < Date.now()) {
      this.storage.clear();
      return;
    }
    this._currentUser.set({
      id: stored.userId,
      email: stored.email,
      role: stored.role,
    });
  }

  token(): string | null {
    return this.storage.read()?.token ?? null;
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/Auth/login`, request)
      .pipe(
        tap((response) => {
          const userId = extractUserId(decodeJwt(response.token)) ?? 0;
          const stored: StoredAuth = { ...response, userId };
          this.storage.store(stored, request.rememberMe);
          this._currentUser.set({
            id: userId,
            email: response.email,
            role: response.role as Role,
          });
        }),
      );
  }

  register(request: RegisterRequest): Observable<unknown> {
    const body = { ...request, role: request.role ?? 'Standard' };
    return this.http.post(`${environment.apiUrl}/Users`, body);
  }

  logout(): void {
    this.storage.clear();
    this._currentUser.set(null);
  }
}
