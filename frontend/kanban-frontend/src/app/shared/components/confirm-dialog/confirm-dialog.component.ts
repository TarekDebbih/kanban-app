import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div class="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-80 shadow-2xl">
        <p class="text-slate-200 text-sm leading-relaxed mb-6">{{ message() }}</p>
        <div class="flex gap-2.5">
          <button type="button" (click)="cancel.emit()"
                  class="flex-1 px-4 py-2 text-sm rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors">
            Annuler
          </button>
          <button type="button" (click)="confirm.emit()"
                  class="flex-1 px-4 py-2 text-sm rounded-xl font-medium text-white transition-colors"
                  [class.bg-red-600]="danger()"
                  [class.hover:bg-red-700]="danger()"
                  [class.bg-indigo-600]="!danger()"
                  [class.hover:bg-indigo-700]="!danger()">
            {{ confirmLabel() }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ConfirmDialogComponent {
  readonly message = input.required<string>();
  readonly confirmLabel = input<string>('Supprimer');
  readonly danger = input<boolean>(true);

  readonly confirm = output<void>();
  readonly cancel = output<void>();
}
