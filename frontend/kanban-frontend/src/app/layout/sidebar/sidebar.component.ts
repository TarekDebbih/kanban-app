import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'w-[200px] flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col py-4 gap-1',
  },
  template: `
    <div class="flex items-center gap-2.5 px-4 mb-5">
      <div class="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-600/30 flex-shrink-0">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
          <rect x="1" y="1" width="6" height="14" rx="1.5"/>
          <rect x="9" y="1" width="6" height="9"  rx="1.5"/>
        </svg>
      </div>
      <span class="text-white font-bold text-[15px] tracking-tight">Kanban</span>
    </div>

    <nav class="flex-1 px-2 space-y-0.5">
      <a routerLink="/board" routerLinkActive="bg-slate-800 text-slate-100 font-medium"
         [routerLinkActiveOptions]="{exact: false}"
         class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] transition-all duration-100 text-slate-500 hover:text-slate-300 hover:bg-slate-800/50">
        <span class="text-base leading-none w-4 text-center">▦</span>
        Mon Board
      </a>
      @if (authService.isAdmin()) {
        <a routerLink="/admin" routerLinkActive="bg-slate-800 text-slate-100 font-medium"
           class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] transition-all duration-100 text-slate-500 hover:text-slate-300 hover:bg-slate-800/50">
          <span class="text-base leading-none w-4 text-center">⊙</span>
          Admin
        </a>
      }
    </nav>

    <div class="px-2 space-y-0.5 mt-2">
      <button type="button" (click)="logout()"
              class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
        <span class="text-base leading-none w-4 text-center">→</span>
        Déconnexion
      </button>
    </div>
  `,
})
export class SidebarComponent {
  protected readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  logout(): void {
    this.authService.logout();
    this.toast.info('Vous êtes déconnecté.');
    this.router.navigate(['/login']);
  }
}
