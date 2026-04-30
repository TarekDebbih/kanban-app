import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { Ticket } from '../../core/models/ticket';
import { AuthService } from '../../core/services/auth.service';
import { BoardStore } from '../../core/services/board-store.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ColumnComponent } from './column/column.component';
import { DndState, EMPTY_DND } from './dnd-state';
import { TicketModalComponent, TicketModalSavePayload } from './ticket-modal/ticket-modal.component';

interface ConfirmData {
  message: string;
  onConfirm: () => Promise<void> | void;
}

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [ColumnComponent, ConfirmDialogComponent, EmptyStateComponent, TicketModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loading() && !store.loaded()) {
      <div class="flex-1 flex items-center justify-center text-slate-500 text-sm">Chargement…</div>
    } @else if (userColumns().length === 0) {
      <app-empty-state icon="📋" title="Aucune colonne" subtitle="Créez votre première colonne pour commencer à organiser vos tickets.">
        <button type="button" (click)="addColumn()"
                class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-xl font-medium transition-colors">
          + Créer une colonne
        </button>
      </app-empty-state>
    } @else {
      <div class="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div class="flex-1 flex items-start gap-4 p-5 overflow-x-auto overflow-y-hidden"
             (dragover)="$event.preventDefault()">
          @for (col of userColumns(); track col.id) {
            <app-column
              [column]="col"
              [tickets]="ticketsFor(col.id)"
              [dnd]="dnd()"
              (colDragStart)="onColDragStart($event)"
              (colDragEnd)="onColDragEnd()"
              (colDragOver)="onColDragOver($event)"
              (colDrop)="onColDrop($event)"
              (ticketDragStart)="onTicketDragStart($event)"
              (ticketDragEnd)="onTicketDragEnd()"
              (ticketDragOverTicket)="onTicketDragOverTicket($event)"
              (ticketDragOverList)="onTicketDragOverList($event)"
              (ticketDropOnTicket)="onTicketDropOnTicket($event)"
              (ticketDropOnList)="onTicketDropOnList($event)"
              (ticketClick)="openTicket($event)"
              (addTicket)="onAddTicket($event)"
              (renameColumn)="onRenameColumn($event)"
              (deleteColumn)="onDeleteColumn($event)" />
          }

          <button type="button" (click)="addColumn()"
                  class="flex-shrink-0 w-[272px] h-14 flex items-center justify-center gap-2 border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-2xl text-sm text-slate-600 hover:text-slate-400 transition-colors">
            + Nouvelle colonne
          </button>
        </div>
      </div>
    }

    @if (selectedTicket(); as t) {
      <app-ticket-modal
        [ticket]="t"
        [columns]="userColumns()"
        (save)="onTicketSave($event)"
        (delete)="onTicketDelete($event)"
        (close)="selectedTicket.set(null)" />
    }

    @if (confirmData(); as c) {
      <app-confirm-dialog
        [message]="c.message"
        (confirm)="executeConfirm()"
        (cancel)="confirmData.set(null)" />
    }
  `,
})
export class BoardComponent implements OnInit {
  protected readonly store = inject(BoardStore);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly boardUserId = input<number | null>(null);

  protected readonly loading = this.store.loading;

  protected readonly resolvedUserId = computed(() => {
    const explicit = this.boardUserId();
    if (explicit !== null && explicit !== undefined) return explicit;
    return this.auth.currentUser()?.id ?? null;
  });

  protected readonly userColumns = computed(() => {
    const uid = this.resolvedUserId();
    if (uid === null) return [];
    return this.store
      .columns()
      .filter((c) => c.userId === uid)
      .sort((a, b) => a.position - b.position);
  });

  protected readonly dnd = signal<DndState>(EMPTY_DND);
  protected readonly selectedTicket = signal<Ticket | null>(null);
  protected readonly confirmData = signal<ConfirmData | null>(null);

  ngOnInit(): void {
    if (!this.store.loaded() && !this.store.loading()) {
      this.store.load().catch((err) => this.toast.error(this.errorMessage(err)));
    }
  }

  protected ticketsFor(columnId: number): Ticket[] {
    return this.store
      .tickets()
      .filter((t) => t.kanbanColumnId === columnId)
      .sort((a, b) => a.position - b.position);
  }

  async addColumn(): Promise<void> {
    const uid = this.resolvedUserId();
    if (uid === null) return;
    try {
      await this.store.createColumn('Nouvelle colonne', uid);
    } catch (err) {
      this.toast.error(this.errorMessage(err));
    }
  }

  async onRenameColumn(payload: { id: number; name: string }): Promise<void> {
    try {
      await this.store.renameColumn(payload.id, payload.name);
    } catch (err) {
      this.toast.error(this.errorMessage(err));
    }
  }

  onDeleteColumn(columnId: number): void {
    this.confirmData.set({
      message: 'Supprimer cette colonne et tous ses tickets ?',
      onConfirm: async () => {
        try {
          await this.store.deleteColumn(columnId);
          this.toast.success('Colonne supprimée');
        } catch (err) {
          this.toast.error(this.errorMessage(err));
        }
      },
    });
  }

  async executeConfirm(): Promise<void> {
    const c = this.confirmData();
    if (!c) return;
    this.confirmData.set(null);
    await c.onConfirm();
  }

  async onAddTicket(payload: { title: string; columnId: number }): Promise<void> {
    try {
      await this.store.createTicket({ title: payload.title, kanbanColumnId: payload.columnId });
      this.toast.success('Ticket créé');
    } catch (err) {
      this.toast.error(this.errorMessage(err));
    }
  }

  openTicket(ticket: Ticket): void {
    this.selectedTicket.set({ ...ticket });
  }

  async onTicketSave(payload: TicketModalSavePayload): Promise<void> {
    const current = this.selectedTicket();
    if (!current) return;
    try {
      const updated = await this.store.updateTicket(current.id, payload);
      if (updated) this.selectedTicket.set(updated);
      this.toast.success('Ticket mis à jour');
    } catch (err) {
      this.toast.error(this.errorMessage(err));
    }
  }

  async onTicketDelete(ticketId: number): Promise<void> {
    try {
      await this.store.deleteTicket(ticketId);
      this.selectedTicket.set(null);
      this.toast.success('Ticket supprimé');
    } catch (err) {
      this.toast.error(this.errorMessage(err));
    }
  }

  // ── DnD wiring ───────────────────────────────────────────────────────────
  onTicketDragStart(payload: { event: DragEvent; ticketId: number }): void {
    const t = this.store.tickets().find((x) => x.id === payload.ticketId);
    if (!t) return;
    this.dnd.set({
      type: 'ticket',
      id: payload.ticketId,
      fromColId: t.kanbanColumnId,
      overColId: t.kanbanColumnId,
      overTicketId: null,
    });
  }

  onTicketDragEnd(): void {
    this.dnd.set(EMPTY_DND);
  }

  onTicketDragOverTicket(p: { ticketId: number; columnId: number }): void {
    this.dnd.update((d) => ({ ...d, overTicketId: p.ticketId, overColId: p.columnId }));
  }

  onTicketDragOverList(columnId: number): void {
    this.dnd.update((d) => ({ ...d, overColId: columnId, overTicketId: null }));
  }

  async onTicketDropOnTicket(p: { ticketId: number }): Promise<void> {
    const d = this.dnd();
    if (d.type !== 'ticket' || d.id === null) return;
    const target = this.store.tickets().find((t) => t.id === p.ticketId);
    if (!target) return;
    const draggedId = d.id;
    this.dnd.set(EMPTY_DND);
    try {
      await this.store.moveTicket(draggedId, target.kanbanColumnId, p.ticketId);
    } catch (err) {
      this.toast.error(this.errorMessage(err));
    }
  }

  async onTicketDropOnList(columnId: number): Promise<void> {
    const d = this.dnd();
    if (d.type !== 'ticket' || d.id === null) return;
    const draggedId = d.id;
    this.dnd.set(EMPTY_DND);
    try {
      await this.store.moveTicket(draggedId, columnId, null);
    } catch (err) {
      this.toast.error(this.errorMessage(err));
    }
  }

  onColDragStart(payload: { event: DragEvent; columnId: number }): void {
    this.dnd.set({
      type: 'column',
      id: payload.columnId,
      fromColId: null,
      overColId: payload.columnId,
      overTicketId: null,
    });
  }

  onColDragEnd(): void {
    this.dnd.set(EMPTY_DND);
  }

  onColDragOver(columnId: number): void {
    this.dnd.update((d) => ({ ...d, overColId: columnId, overTicketId: null }));
  }

  async onColDrop(targetColumnId: number): Promise<void> {
    const d = this.dnd();
    if (d.type === 'column' && d.id !== null && d.id !== targetColumnId) {
      const draggedId = d.id;
      const uid = this.resolvedUserId();
      this.dnd.set(EMPTY_DND);
      if (uid === null) return;
      try {
        await this.store.reorderColumns(uid, draggedId, targetColumnId);
      } catch (err) {
        this.toast.error(this.errorMessage(err));
      }
      return;
    }
    if (d.type === 'ticket' && d.id !== null) {
      const draggedId = d.id;
      this.dnd.set(EMPTY_DND);
      try {
        await this.store.moveTicket(draggedId, targetColumnId, null);
      } catch (err) {
        this.toast.error(this.errorMessage(err));
      }
      return;
    }
    this.dnd.set(EMPTY_DND);
  }

  private errorMessage(err: unknown): string {
    const e = err as { error?: unknown; message?: string; status?: number };
    if (typeof e.error === 'string' && e.error) return e.error;
    if (e.message) return e.message;
    return 'Une erreur est survenue';
  }
}
