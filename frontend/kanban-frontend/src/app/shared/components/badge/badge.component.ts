import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type BadgeVariant = 'default' | 'admin' | 'standard' | 'success' | 'hours';

@Component({
  selector: 'app-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium leading-tight"
                    [class]="classes()">
    <ng-content />
  </span>`,
})
export class BadgeComponent {
  readonly variant = input<BadgeVariant>('default');

  protected readonly classes = computed(() => {
    const map: Record<BadgeVariant, string> = {
      default:  'bg-slate-700/80 text-slate-400',
      admin:    'bg-indigo-600/20 text-indigo-400 border border-indigo-600/30',
      standard: 'bg-slate-700/50 text-slate-400',
      success:  'bg-emerald-600/20 text-emerald-400',
      hours:    'bg-slate-800 text-slate-500 border border-slate-700/60 font-mono',
    };
    return map[this.variant()] ?? map.default;
  });
}
