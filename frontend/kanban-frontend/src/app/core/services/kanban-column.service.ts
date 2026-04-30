import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateKanbanColumnDto, KanbanColumn, UpdateKanbanColumnDto } from '../models/kanban-column';

@Injectable({ providedIn: 'root' })
export class KanbanColumnService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/KanbanColumn`;

  listColumns(): Observable<KanbanColumn[]> {
    return this.http.get<KanbanColumn[]>(this.base);
  }

  getById(id: number): Observable<KanbanColumn> {
    return this.http.get<KanbanColumn>(`${this.base}/${id}`);
  }

  createColumn(dto: CreateKanbanColumnDto): Observable<KanbanColumn> {
    return this.http.post<KanbanColumn>(this.base, dto);
  }

  updateColumn(id: number, dto: UpdateKanbanColumnDto): Observable<KanbanColumn> {
    return this.http.put<KanbanColumn>(`${this.base}/${id}`, dto);
  }

  deleteColumn(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
