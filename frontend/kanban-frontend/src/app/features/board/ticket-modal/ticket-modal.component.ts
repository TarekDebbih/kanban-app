import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KanbanColumn } from '../../../core/models/kanban-column';
import { Ticket } from '../../../core/models/ticket';
import { ModalBackdropComponent } from '../../../shared/components/modal-backdrop/modal-backdrop.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';

export interface TicketModalSavePayload {
  title: string;
  description: string;
  timeSpentHours: number;
  kanbanColumnId: number;
}

@Component({
  selector: 'app-ticket-modal',
  standalone: true,
  imports: [FormsModule, ModalBackdropComponent, SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'close.emit()',
  },
  template: `
    <app-modal-backdrop (close)="close.emit()">
      <div class="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[88vh]"
           (mousedown)="$event.stopPropagation()">
        <div class="flex items-center justify-between px-5 py-4 border-b border-slate-800 flex-shrink-0">
          <div class="flex items-center gap-2.5">
            <span class="text-slate-600 text-xs font-mono">#{{ ticket().id }}</span>
            <span class="text-slate-700 text-xs">·</span>
            <span class="text-slate-500 text-xs">{{ formattedDate() }}</span>
          </div>
          <button type="button" (click)="close.emit()"
                  class="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors text-xl leading-none">
            ×
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-5 space-y-4">
          <div>
            <label class="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Titre</label>
            <input [(ngModel)]="title" name="title" placeholder="Titre du ticket"
                   class="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all">
          </div>

          <div>
            <label class="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Description</label>
            <textarea [(ngModel)]="description" name="description" rows="5" placeholder="Ajouter une description…"
                      class="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all resize-none leading-relaxed"></textarea>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Temps passé (h)</label>
              <input type="number" step="0.25" min="0" [(ngModel)]="hoursStr" name="hours"
                     class="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all">
            </div>
            <div>
              <label class="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Colonne</label>
              <select [(ngModel)]="columnIdStr" name="column"
                      class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all">
                @for (c of columns(); track c.id) {
                  <option [value]="c.id">{{ c.name }}</option>
                }
              </select>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 px-5 py-4 border-t border-slate-800 flex-shrink-0">
          @if (confirmDelete()) {
            <span class="text-xs text-red-400 flex-1">Confirmer la suppression ?</span>
            <button type="button" (click)="performDelete()" [disabled]="deleting()"
                    class="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg font-medium transition-colors flex items-center gap-1.5">
              @if (deleting()) { <app-spinner size="sm" /> }Supprimer
            </button>
            <button type="button" (click)="confirmDelete.set(false)"
                    class="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-400 text-xs rounded-lg transition-colors">
              Annuler
            </button>
          } @else {
            <button type="button" (click)="confirmDelete.set(true)"
                    class="px-3 py-1.5 text-red-400 hover:text-red-300 text-xs rounded-lg hover:bg-red-500/10 transition-colors">
              Supprimer
            </button>
            <div class="flex-1"></div>
            <button type="button" (click)="close.emit()"
                    class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs rounded-lg transition-colors">
              Fermer
            </button>
            <button type="button" (click)="performSave()"
                    [disabled]="saving() || !canSave()"
                    class="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5">
              @if (saving()) { <app-spinner size="sm" /> }
              {{ dirty() ? 'Sauvegarder' : 'Sauvegardé' }}
            </button>
          }
        </div>
      </div>
    </app-modal-backdrop>
  `,
})
export class TicketModalComponent {
  readonly ticket = input.required<Ticket>();
  readonly columns = input.required<KanbanColumn[]>();

  readonly save = output<TicketModalSavePayload>();
  readonly delete = output<number>();
  readonly close = output<void>();

  protected title = '';
  protected description = '';
  protected hoursStr = '0';
  protected columnIdStr = '0';

  protected readonly saving = signal(false);
  protected readonly deleting = signal(false);
  protected readonly confirmDelete = signal(false);

  constructor() {
    effect(() => {
      const t = this.ticket();
      this.title = t.title;
      this.description = t.description ?? '';
      this.hoursStr = String(t.timeSpentHours ?? 0);
      this.columnIdStr = String(t.kanbanColumnId);
    });
  }

  protected readonly formattedDate = computed(() => {
    const t = this.ticket();
    return new Date(t.createdAt).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' });
  });

  protected canSave(): boolean {
    return this.title.trim().length > 0 && this.dirty();
  }

  protected dirty(): boolean {
    const t = this.ticket();
    return (
      this.title !== t.title ||
      this.description !== (t.description ?? '') ||
      parseFloat(this.hoursStr || '0') !== t.timeSpentHours ||
      Number(this.columnIdStr) !== t.kanbanColumnId
    );
  }

  protected async performSave(): Promise<void> {
    const trimmed = this.title.trim();
    if (!trimmed) return;
    this.saving.set(true);
    this.save.emit({
      title: trimmed,
      description: this.description,
      timeSpentHours: parseFloat(this.hoursStr || '0') || 0,
      kanbanColumnId: Number(this.columnIdStr),
    });
    setTimeout(() => this.saving.set(false), 0);
  }

  protected performDelete(): void {
    this.deleting.set(true);
    this.delete.emit(this.ticket().id);
  }
}
