import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/Users`;

  listUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.base);
  }

  getUserByEmail(email: string): Observable<User> {
    return this.http.get<User>(`${this.base}/${encodeURIComponent(email)}`);
  }
}
