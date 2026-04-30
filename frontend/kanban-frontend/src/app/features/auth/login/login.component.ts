import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';

interface DemoAccount { label: string; email: string; password: string; }

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div class="w-full max-w-sm">
        <div class="flex items-center gap-2.5 justify-center mb-8">
          <div class="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="white">
              <rect x="2" y="2" width="7" height="16" rx="2"/>
              <rect x="11" y="2" width="7" height="10" rx="2"/>
            </svg>
          </div>
          <span class="text-white font-bold text-lg tracking-tight">Kanban</span>
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <h1 class="text-lg font-semibold text-white mb-1">Connexion</h1>
          <p class="text-slate-500 text-sm mb-5">Entrez vos identifiants pour continuer.</p>

          @if (error()) {
            <div class="mb-4 px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
              {{ error() }}
            </div>
          }

          <form (ngSubmit)="submit()" class="space-y-4">
            <div>
              <label class="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
              <input type="email" name="email" [(ngModel)]="email" required
                     placeholder="vous&#64;exemple.com"
                     class="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all">
            </div>

            <div>
              <label class="block text-xs font-medium text-slate-400 mb-1.5">Mot de passe</label>
              <input type="password" name="password" [(ngModel)]="password" required
                     placeholder="••••••••"
                     class="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all">
            </div>

            <label class="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" name="remember" [(ngModel)]="rememberMe"
                     class="w-4 h-4 rounded bg-slate-700 border-slate-600 accent-indigo-500">
              <span class="text-sm text-slate-400">Se souvenir de moi</span>
            </label>

            <button type="submit" [disabled]="loading()"
                    class="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-xl py-2.5 text-sm transition-colors">
              @if (loading()) { <app-spinner size="sm" /> }
              {{ loading() ? 'Connexion…' : 'Se connecter' }}
            </button>
          </form>

          <p class="mt-4 text-center text-sm text-slate-500">
            Pas encore de compte ?
            <a routerLink="/register" class="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">S'inscrire</a>
          </p>

          <div class="mt-4 pt-4 border-t border-slate-800">
            <p class="text-[11px] text-slate-600 text-center mb-2">Compte de démo</p>
            <div class="flex gap-1.5 justify-center">
              @for (a of demoAccounts; track a.email) {
                <button type="button" (click)="fill(a)"
                        class="px-2.5 py-1 text-[11px] rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:border-indigo-500/50 hover:text-indigo-400 transition-colors">
                  {{ a.label }}
                </button>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  protected email = '';
  protected password = '';
  protected rememberMe = false;
  protected readonly loading = signal(false);
  protected readonly error = signal('');

  protected readonly demoAccounts: DemoAccount[] = [
    { label: 'Admin', email: 'admin@test.com', password: 'admin123' },
  ];

  fill(account: DemoAccount): void {
    this.email = account.email;
    this.password = account.password;
  }

  submit(): void {
    this.error.set('');
    this.loading.set(true);
    this.auth.login({ email: this.email, password: this.password, rememberMe: this.rememberMe })
      .subscribe({
        next: (response) => {
          this.loading.set(false);
          this.toast.success(`Bienvenue, ${response.email.split('@')[0]} !`);
          this.router.navigate(['/board']);
        },
        error: (err: HttpErrorResponse) => {
          this.loading.set(false);
          const msg = typeof err.error === 'string' && err.error
            ? err.error
            : err.status === 401 ? 'Email ou mot de passe invalide' : 'Une erreur est survenue';
          this.error.set(msg);
        },
      });
  }
}
