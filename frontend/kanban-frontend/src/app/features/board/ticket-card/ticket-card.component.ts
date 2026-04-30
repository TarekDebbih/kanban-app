import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Ticket } from '../../../core/models/ticket';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { DndState } from '../dnd-state';

@Component({
  selector: 'app-ticket-card',
  standalone: true,
  imports: [BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div draggable="true"
         (dragstart)="onDragStart($event)"
         (dragend)="dragEnd.emit()"
         (dragover)="onDragOver($event)"
         (drop)="onDrop($event)"
         (click)="cardClick.emit(ticket())"
         class="group relative select-none cursor-pointer rounded-xl border p-3 transition-all duration-150 hover:shadow-lg hover:shadow-black/30"
         [class.opacity-30]="ghost()"
         [class.scale-95]="ghost()"
         [class.bg-slate-800/90]="!ghost()"
         [class.hover:bg-slate-800]="!ghost()"
         [class.border-t-2]="dropAbove()"
         [class.border-t-indigo-500]="dropAbove()"
         [class.border-slate-700]="dropAbove()"
         [class.border-slate-700/80]="!dropAbove()"
         [class.hover:border-slate-600]="!dropAbove()">
      <p class="text-[13px] font-medium text-slate-200 leading-snug mb-2 line-clamp-2">{{ ticket().title }}</p>
      @if (ticket().description) {
        <p class="text-[11px] text-slate-500 line-clamp-2 mb-2 leading-relaxed">{{ ticket().description }}</p>
      }
      <div class="flex items-center justify-between gap-2">
        <span class="text-[11px] text-slate-600">{{ formattedDate() }}</span>
        @if (ticket().timeSpentHours > 0) {
          <app-badge variant="hours">{{ ticket().timeSpentHours }}h</app-badge>
        }
      </div>
    </div>
  `,
})
export class TicketCardComponent {
  readonly ticket = input.required<Ticket>();
  readonly dnd = input.required<DndState>();

  readonly dragStart = output<{ event: DragEvent; ticketId: number }>();
  readonly dragEnd = output<void>();
  readonly dragOverTicket = output<number>();
  readonly dropOnTicket = output<number>();
  readonly cardClick = output<Ticket>();

  protected readonly ghost = computed(() => {
    const d = this.dnd();
    return d.type === 'ticket' && d.id === this.ticket().id;
  });

  protected readonly dropAbove = computed(() => {
    const d = this.dnd();
    return d.type === 'ticket' && d.overTicketId === this.ticket().id && d.id !== this.ticket().id;
  });

  protected readonly formattedDate = computed(() =>
    new Date(this.ticket().createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
  );

  onDragStart(event: DragEvent): void {
    event.stopPropagation();
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
    this.dragStart.emit({ event, ticketId: this.ticket().id });
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOverTicket.emit(this.ticket().id);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dropOnTicket.emit(this.ticket().id);
  }
}
