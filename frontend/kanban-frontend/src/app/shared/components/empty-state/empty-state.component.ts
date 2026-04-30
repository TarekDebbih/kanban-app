import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center justify-center gap-4 py-16 px-8 text-center">
      <div class="w-14 h-14 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center text-2xl">
        {{ icon() }}
      </div>
      <div>
        <p class="text-slate-300 font-medium text-sm">{{ title() }}</p>
        @if (subtitle()) {
          <p class="text-slate-600 text-xs mt-1">{{ subtitle() }}</p>
        }
      </div>
      <ng-content />
    </div>
  `,
})
export class EmptyStateComponent {
  readonly icon = input<string>('📋');
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
}
