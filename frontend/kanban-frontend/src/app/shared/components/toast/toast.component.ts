import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      @for (t of toasts(); track t.id) {
        <div class="flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium pointer-events-auto transition-all duration-300 animate-slideIn"
             [class.bg-emerald-500]="t.type === 'success'"
             [class.bg-red-500]="t.type === 'error'"
             [class.bg-slate-700]="t.type === 'info'"
             [class.text-white]="t.type !== 'info'"
             [class.text-slate-200]="t.type === 'info'">
          <span class="text-base leading-none">
            @switch (t.type) {
              @case ('success') { ✓ }
              @case ('error')   { ✕ }
              @default          { ℹ }
            }
          </span>
          <span class="flex-1">{{ t.message }}</span>
          <button type="button" (click)="dismiss(t.id)"
                  class="opacity-60 hover:opacity-100 transition-opacity ml-1 text-base leading-none">×</button>
        </div>
      }
    </div>
  `,
})
export class ToastComponent {
  private readonly toastService = inject(ToastService);
  readonly toasts = this.toastService.toasts;

  dismiss(id: number): void {
    this.toastService.dismiss(id);
  }
}
