import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { BadgeComponent } from '../../shared/components/badge/badge.component';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="h-12 flex items-center px-5 border-b border-slate-800 bg-slate-900/70 backdrop-blur-sm flex-shrink-0 gap-4">
      <h2 class="text-[13px] font-semibold text-slate-300 flex-1">{{ title() }}</h2>
      @if (user(); as u) {
        <div class="flex items-center gap-2.5">
          <app-badge [variant]="u.role === 'Admin' ? 'admin' : 'standard'">{{ u.role }}</app-badge>
          <span class="text-[13px] text-slate-400 max-w-[180px] truncate">{{ u.email }}</span>
          <div class="w-7 h-7 bg-slate-700 rounded-lg flex items-center justify-center text-xs font-bold text-slate-300 flex-shrink-0">
            {{ u.email[0].toUpperCase() }}
          </div>
        </div>
      }
    </header>
  `,
})
export class TopbarComponent {
  readonly title = input.required<string>();
  protected readonly authService = inject(AuthService);
  protected readonly user = this.authService.currentUser;
}
