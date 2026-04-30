import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-register',
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
          <h1 class="text-lg font-semibold text-white mb-1">Créer un compte</h1>
          <p class="text-slate-500 text-sm mb-5">Commencez gratuitement — aucune carte requise.</p>

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
              <div class="flex items-baseline justify-between mb-1.5">
                <label class="text-xs font-medium text-slate-400">Mot de passe</label>
                <span class="text-[11px] text-slate-600">min. 6 caractères</span>
              </div>
              <input type="password" name="password" [(ngModel)]="password" required
                     placeholder="••••••••"
                     class="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all">
            </div>

            <div>
              <label class="block text-xs font-medium text-slate-400 mb-1.5">Confirmer le mot de passe</label>
              <input type="password" name="confirm" [(ngModel)]="confirm" required
                     placeholder="••••••••"
                     class="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all">
            </div>

            <button type="submit" [disabled]="loading()"
                    class="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-xl py-2.5 text-sm transition-colors">
              @if (loading()) { <app-spinner size="sm" /> }
              {{ loading() ? 'Création…' : 'Créer le compte' }}
            </button>
          </form>

          <p class="mt-4 text-center text-sm text-slate-500">
            J'ai déjà un compte.
            <a routerLink="/login" class="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Se connecter</a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  protected email = '';
  protected password = '';
  protected confirm = '';
  protected readonly loading = signal(false);
  protected readonly error = signal('');

  submit(): void {
    this.error.set('');
    if (this.password.length < 6) {
      this.error.set('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }
    if (this.password !== this.confirm) {
      this.error.set('Les mots de passe ne correspondent pas.');
      return;
    }
    this.loading.set(true);
    this.auth.register({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.loading.set(false);
        this.toast.success('Compte créé ! Vous pouvez vous connecter.');
        this.router.navigate(['/login']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        const msg = typeof err.error === 'string' && err.error
          ? err.error
          : err.status === 400 ? 'Données invalides ou email déjà utilisé.' : 'Une erreur est survenue';
        this.error.set(msg);
      },
    });
  }
}
