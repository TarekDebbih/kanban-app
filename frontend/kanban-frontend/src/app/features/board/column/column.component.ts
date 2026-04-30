import { ChangeDetectionStrategy, Component, ElementRef, computed, effect, inject, input, output, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KanbanColumn } from '../../../core/models/kanban-column';
import { Ticket } from '../../../core/models/ticket';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { TicketCardComponent } from '../ticket-card/ticket-card.component';
import { DndState } from '../dnd-state';

@Component({
  selector: 'app-column',
  standalone: true,
  imports: [FormsModule, TicketCardComponent, SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div draggable="true"
         (dragstart)="onColDragStart($event)"
         (dragend)="colDragEnd.emit()"
         (dragover)="onColDragOver($event)"
         (drop)="onColDrop($event)"
         class="flex-shrink-0 w-[272px] flex flex-col rounded-2xl border transition-all duration-150 select-none bg-slate-900/60"
         [class.opacity-30]="isGhost()"
         [class.border-indigo-500]="isColOver()"
         [class.shadow-lg]="isColOver()"
         [class.shadow-indigo-500/10]="isColOver()"
         [class.border-slate-800]="!isColOver()">

      <div class="flex items-center gap-2 px-3 py-3">
        @if (editingName()) {
          <input #nameInput [(ngModel)]="nameValue" name="colName"
                 (blur)="saveName()"
                 (keydown.enter)="saveName()"
                 (keydown.escape)="cancelEdit()"
                 (click)="$event.stopPropagation()"
                 class="flex-1 bg-transparent border-b border-indigo-500 text-sm font-semibold text-slate-200 focus:outline-none">
        } @else {
          <h3 (dblclick)="startEdit()"
              class="flex-1 text-[13px] font-semibold text-slate-300 cursor-default truncate">
            {{ column().name }}
          </h3>
        }
        <span class="text-[11px] text-slate-600 font-medium tabular-nums">{{ tickets().length }}</span>

        <div class="relative">
          <button type="button" (click)="toggleMenu($event)"
                  class="w-6 h-6 flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-400 hover:bg-slate-700/60 transition-colors text-sm leading-none">
            ···
          </button>
          @if (menuOpen()) {
            <div #menuEl class="absolute right-0 top-8 z-30 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-36 py-1 overflow-hidden">
              <button type="button" (click)="onRenameClick()"
                      class="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-700 transition-colors">
                Renommer
              </button>
              <button type="button" (click)="onDeleteClick()"
                      class="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-slate-700 transition-colors">
                Supprimer
              </button>
            </div>
          }
        </div>
      </div>

      <div class="flex-1 flex flex-col gap-2 px-2 pb-2 overflow-y-auto max-h-[calc(100vh-230px)] min-h-[60px] transition-colors rounded-b-xl"
           [class.bg-indigo-500/5]="isTicketDropZone() && tickets().length === 0"
           (dragover)="onListDragOver($event)"
           (drop)="onListDrop($event)">
        @for (ticket of tickets(); track ticket.id) {
          <app-ticket-card
            [ticket]="ticket"
            [dnd]="dnd()"
            (dragStart)="ticketDragStart.emit($event)"
            (dragEnd)="ticketDragEnd.emit()"
            (dragOverTicket)="ticketDragOverTicket.emit({ ticketId: $event, columnId: column().id })"
            (dropOnTicket)="ticketDropOnTicket.emit({ ticketId: $event })"
            (cardClick)="ticketClick.emit($event)" />
        }

        @if (tickets().length === 0 && !adding()) {
          <div class="flex items-center justify-center text-[11px] rounded-xl border-2 border-dashed min-h-[60px] transition-colors"
               [class.border-indigo-500/50]="isTicketDropZone()"
               [class.text-indigo-600]="isTicketDropZone()"
               [class.border-slate-800]="!isTicketDropZone()"
               [class.text-slate-700]="!isTicketDropZone()">
            Déposer ici
          </div>
        }

        @if (adding()) {
          <form (ngSubmit)="performAdd()" class="flex flex-col gap-2 px-0.5">
            <textarea autofocus rows="2"
                      [(ngModel)]="newTitle" name="newTitle"
                      placeholder="Titre du ticket…"
                      (keydown.escape)="cancelAdd()"
                      class="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none"></textarea>
            <div class="flex gap-2">
              <button type="submit" [disabled]="addBusy() || !newTitle.trim()"
                      class="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5">
                @if (addBusy()) { <app-spinner size="sm" /> }Ajouter
              </button>
              <button type="button" (click)="cancelAdd()"
                      class="flex-1 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-400 text-xs rounded-lg transition-colors">
                Annuler
              </button>
            </div>
          </form>
        }
      </div>

      @if (!adding()) {
        <button type="button" (click)="startAdd()"
                class="flex items-center gap-2 px-3 py-2.5 text-[12px] text-slate-600 hover:text-slate-400 hover:bg-slate-800/40 border-t border-slate-800/60 transition-colors rounded-b-2xl">
          <span class="text-base leading-none font-light">+</span>
          Ajouter un ticket
        </button>
      }
    </div>
  `,
})
export class ColumnComponent {
  readonly column = input.required<KanbanColumn>();
  readonly tickets = input.required<Ticket[]>();
  readonly dnd = input.required<DndState>();

  readonly colDragStart = output<{ event: DragEvent; columnId: number }>();
  readonly colDragEnd = output<void>();
  readonly colDragOver = output<number>();
  readonly colDrop = output<number>();

  readonly ticketDragStart = output<{ event: DragEvent; ticketId: number }>();
  readonly ticketDragEnd = output<void>();
  readonly ticketDragOverTicket = output<{ ticketId: number; columnId: number }>();
  readonly ticketDragOverList = output<number>();
  readonly ticketDropOnTicket = output<{ ticketId: number }>();
  readonly ticketDropOnList = output<number>();

  readonly ticketClick = output<Ticket>();
  readonly addTicket = output<{ title: string; columnId: number }>();
  readonly renameColumn = output<{ id: number; name: string }>();
  readonly deleteColumn = output<number>();

  protected readonly editingName = signal(false);
  protected nameValue = '';
  protected newTitle = '';
  protected readonly menuOpen = signal(false);
  protected readonly adding = signal(false);
  protected readonly addBusy = signal(false);

  protected readonly nameInput = viewChild<ElementRef<HTMLInputElement>>('nameInput');
  protected readonly menuEl = viewChild<ElementRef<HTMLElement>>('menuEl');

  private readonly host = inject(ElementRef);

  constructor() {
    effect(() => {
      this.nameValue = this.column().name;
    });
  }

  protected readonly isGhost = computed(() => {
    const d = this.dnd();
    return d.type === 'column' && d.id === this.column().id;
  });

  protected readonly isColOver = computed(() => {
    const d = this.dnd();
    return d.type === 'column' && d.overColId === this.column().id && d.id !== this.column().id;
  });

  protected readonly isTicketDropZone = computed(() => {
    const d = this.dnd();
    return d.type === 'ticket' && d.overColId === this.column().id;
  });

  startEdit(): void {
    this.nameValue = this.column().name;
    this.editingName.set(true);
    setTimeout(() => this.nameInput()?.nativeElement.focus(), 0);
  }

  cancelEdit(): void {
    this.nameValue = this.column().name;
    this.editingName.set(false);
  }

  saveName(): void {
    const trimmed = this.nameValue.trim();
    if (trimmed && trimmed !== this.column().name) {
      this.renameColumn.emit({ id: this.column().id, name: trimmed });
    }
    this.editingName.set(false);
  }

  toggleMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.menuOpen.update((v) => !v);
  }

  onRenameClick(): void {
    this.menuOpen.set(false);
    this.startEdit();
  }

  onDeleteClick(): void {
    this.menuOpen.set(false);
    this.deleteColumn.emit(this.column().id);
  }

  startAdd(): void {
    this.newTitle = '';
    this.adding.set(true);
  }

  cancelAdd(): void {
    this.newTitle = '';
    this.adding.set(false);
  }

  async performAdd(): Promise<void> {
    if (!this.newTitle.trim()) return;
    this.addBusy.set(true);
    this.addTicket.emit({ title: this.newTitle.trim(), columnId: this.column().id });
    this.newTitle = '';
    this.adding.set(false);
    this.addBusy.set(false);
  }

  onColDragStart(event: DragEvent): void {
    if (this.editingName() || this.adding()) {
      event.preventDefault();
      return;
    }
    event.stopPropagation();
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
    this.colDragStart.emit({ event, columnId: this.column().id });
  }

  onColDragOver(event: DragEvent): void {
    event.preventDefault();
    this.colDragOver.emit(this.column().id);
  }

  onColDrop(event: DragEvent): void {
    event.preventDefault();
    this.colDrop.emit(this.column().id);
  }

  onListDragOver(event: DragEvent): void {
    event.preventDefault();
    if (this.dnd().type === 'ticket') {
      this.ticketDragOverList.emit(this.column().id);
    }
  }

  onListDrop(event: DragEvent): void {
    event.preventDefault();
    if (this.dnd().type === 'ticket') {
      this.ticketDropOnList.emit(this.column().id);
    }
  }

  onDocumentMouseDown = (e: MouseEvent): void => {
    if (!this.menuOpen()) return;
    const menu = this.menuEl()?.nativeElement;
    if (menu && !menu.contains(e.target as Node)) this.menuOpen.set(false);
  };

  ngOnInit(): void {
    document.addEventListener('mousedown', this.onDocumentMouseDown);
  }

  ngOnDestroy(): void {
    document.removeEventListener('mousedown', this.onDocumentMouseDown);
  }
}
