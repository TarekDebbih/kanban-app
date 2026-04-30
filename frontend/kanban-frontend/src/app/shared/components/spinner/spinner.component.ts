import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="inline-block border-current border-t-transparent rounded-full animate-spin opacity-60"
                    [class.w-3.5]="size() === 'sm'"
                    [class.h-3.5]="size() === 'sm'"
                    [class.border]="size() === 'sm'"
                    [class.w-5]="size() === 'md'"
                    [class.h-5]="size() === 'md'"
                    [class.w-7]="size() === 'lg'"
                    [class.h-7]="size() === 'lg'"
                    [class.border-2]="size() !== 'sm'"></span>`,
})
export class SpinnerComponent {
  readonly size = input<'sm' | 'md' | 'lg'>('md');
}
