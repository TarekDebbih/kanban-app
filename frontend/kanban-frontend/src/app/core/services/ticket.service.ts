import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateTicketDto, Ticket, UpdateTicketDto } from '../models/ticket';

@Injectable({ providedIn: 'root' })
export class TicketService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/Ticket`;

  listTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(this.base);
  }

  getById(id: number): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.base}/${id}`);
  }

  createTicket(dto: CreateTicketDto): Observable<Ticket> {
    return this.http.post<Ticket>(this.base, dto);
  }

  updateTicket(id: number, dto: UpdateTicketDto): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.base}/${id}`, dto);
  }

  deleteTicket(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
