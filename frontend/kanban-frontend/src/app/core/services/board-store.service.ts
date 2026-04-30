import { Injectable, computed, inject, signal } from '@angular/core';
import { forkJoin, lastValueFrom } from 'rxjs';
import { KanbanColumn } from '../models/kanban-column';
import { Ticket } from '../models/ticket';
import { User } from '../models/user';
import { AuthService } from './auth.service';
import { KanbanColumnService } from './kanban-column.service';
import { TicketService } from './ticket.service';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class BoardStore {
  private readonly auth = inject(AuthService);
  private readonly columnsApi = inject(KanbanColumnService);
  private readonly ticketsApi = inject(TicketService);
  private readonly usersApi = inject(UserService);

  private readonly _columns = signal<KanbanColumn[]>([]);
  private readonly _tickets = signal<Ticket[]>([]);
  private readonly _users = signal<User[]>([]);
  private readonly _loading = signal(false);
  private readonly _loaded = signal(false);

  readonly columns = this._columns.asReadonly();
  readonly tickets = this._tickets.asReadonly();
  readonly users = this._users.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly loaded = this._loaded.asReadonly();

  columnsForUser(userId: number) {
    return computed(() =>
      this._columns()
        .filter((c) => c.userId === userId)
        .sort((a, b) => a.position - b.position),
    );
  }

  ticketsForColumn(columnId: number) {
    return computed(() =>
      this._tickets()
        .filter((t) => t.kanbanColumnId === columnId)
        .sort((a, b) => a.position - b.position),
    );
  }

  reset(): void {
    this._columns.set([]);
    this._tickets.set([]);
    this._users.set([]);
    this._loaded.set(false);
  }

  async load(): Promise<void> {
    this._loading.set(true);
    try {
      const isAdmin = this.auth.isAdmin();
      const result = await lastValueFrom(
        forkJoin({
          columns: this.columnsApi.listColumns(),
          tickets: this.ticketsApi.listTickets(),
          users: isAdmin ? this.usersApi.listUsers() : Promise.resolve([] as User[]),
        }),
      );
      this._columns.set(result.columns);
      this._tickets.set(result.tickets);
      this._users.set(result.users);
      this._loaded.set(true);
    } finally {
      this._loading.set(false);
    }
  }

  async createColumn(name: string, userId: number): Promise<KanbanColumn> {
    const existing = this._columns().filter((c) => c.userId === userId);
    const maxPos = existing.length ? Math.max(...existing.map((c) => c.position)) : 0;
    const created = await lastValueFrom(
      this.columnsApi.createColumn({ name, position: maxPos + 1, userId }),
    );
    this._columns.update((arr) => [...arr, created]);
    return created;
  }

  async renameColumn(columnId: number, name: string): Promise<void> {
    const column = this._columns().find((c) => c.id === columnId);
    if (!column) return;
    const updated = await lastValueFrom(
      this.columnsApi.updateColumn(columnId, {
        name,
        position: column.position,
        userId: column.userId,
      }),
    );
    this._columns.update((arr) => arr.map((c) => (c.id === columnId ? updated : c)));
  }

  async deleteColumn(columnId: number): Promise<void> {
    await lastValueFrom(this.columnsApi.deleteColumn(columnId));
    this._columns.update((arr) => arr.filter((c) => c.id !== columnId));
    this._tickets.update((arr) => arr.filter((t) => t.kanbanColumnId !== columnId));
  }

  async reorderColumns(boardUserId: number, draggedId: number, targetId: number): Promise<void> {
    const mine = this._columns()
      .filter((c) => c.userId === boardUserId)
      .sort((a, b) => a.position - b.position);
    const di = mine.findIndex((c) => c.id === draggedId);
    const ti = mine.findIndex((c) => c.id === targetId);
    if (di < 0 || ti < 0 || di === ti) return;
    const [dragged] = mine.splice(di, 1);
    mine.splice(ti, 0, dragged);
    const reindexed = mine.map((c, i) => ({ ...c, position: i + 1 }));

    this._columns.update((arr) => {
      const others = arr.filter((c) => c.userId !== boardUserId);
      return [...others, ...reindexed];
    });

    const changed = reindexed.filter((c) => {
      const original = this._columns().find((x) => x.id === c.id);
      return !original || original.position !== c.position;
    });
    await Promise.all(
      reindexed.map((c) =>
        lastValueFrom(
          this.columnsApi.updateColumn(c.id, {
            name: c.name,
            position: c.position,
            userId: c.userId,
          }),
        ),
      ),
    );
  }

  async createTicket(input: { title: string; kanbanColumnId: number }): Promise<Ticket> {
    const colTickets = this._tickets().filter((t) => t.kanbanColumnId === input.kanbanColumnId);
    const maxPos = colTickets.length ? Math.max(...colTickets.map((t) => t.position)) : 0;
    const created = await lastValueFrom(
      this.ticketsApi.createTicket({
        title: input.title,
        description: '',
        timeSpentHours: 0,
        position: maxPos + 1,
        kanbanColumnId: input.kanbanColumnId,
      }),
    );
    this._tickets.update((arr) => [...arr, created]);
    return created;
  }

  async updateTicket(
    ticketId: number,
    data: { title: string; description: string; timeSpentHours: number; kanbanColumnId: number },
  ): Promise<Ticket | null> {
    const ticket = this._tickets().find((t) => t.id === ticketId);
    if (!ticket) return null;

    const movingColumn = ticket.kanbanColumnId !== data.kanbanColumnId;
    let position = ticket.position;
    if (movingColumn) {
      const target = this._tickets().filter((t) => t.kanbanColumnId === data.kanbanColumnId);
      const maxPos = target.length ? Math.max(...target.map((t) => t.position)) : 0;
      position = maxPos + 1;
    }

    const updated = await lastValueFrom(
      this.ticketsApi.updateTicket(ticketId, {
        title: data.title,
        description: data.description,
        timeSpentHours: data.timeSpentHours,
        position,
        kanbanColumnId: data.kanbanColumnId,
      }),
    );
    this._tickets.update((arr) => arr.map((t) => (t.id === ticketId ? updated : t)));
    return updated;
  }

  async deleteTicket(ticketId: number): Promise<void> {
    await lastValueFrom(this.ticketsApi.deleteTicket(ticketId));
    this._tickets.update((arr) => arr.filter((t) => t.id !== ticketId));
  }

  async moveTicket(ticketId: number, targetColId: number, beforeTicketId: number | null): Promise<void> {
    const ticket = this._tickets().find((t) => t.id === ticketId);
    if (!ticket) return;

    const colTs = this._tickets()
      .filter((t) => t.kanbanColumnId === targetColId && t.id !== ticketId)
      .sort((a, b) => a.position - b.position);
    const moved: Ticket = { ...ticket, kanbanColumnId: targetColId };
    if (beforeTicketId) {
      const idx = colTs.findIndex((t) => t.id === beforeTicketId);
      colTs.splice(idx >= 0 ? idx : colTs.length, 0, moved);
    } else {
      colTs.push(moved);
    }
    const reindexed = colTs.map((t, i) => ({ ...t, position: i + 1 }));

    this._tickets.update((arr) =>
      arr.map((t) => {
        const r = reindexed.find((x) => x.id === t.id);
        return r ? r : t;
      }),
    );

    await Promise.all(
      reindexed.map((t) =>
        lastValueFrom(
          this.ticketsApi.updateTicket(t.id, {
            title: t.title,
            description: t.description,
            timeSpentHours: t.timeSpentHours,
            position: t.position,
            kanbanColumnId: t.kanbanColumnId,
          }),
        ),
      ),
    );
  }

  async refreshUsers(): Promise<void> {
    if (!this.auth.isAdmin()) return;
    const users = await lastValueFrom(this.usersApi.listUsers());
    this._users.set(users);
  }
}
