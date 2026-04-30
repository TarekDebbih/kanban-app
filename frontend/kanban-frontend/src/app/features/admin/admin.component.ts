import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { User } from '../../core/models/user';
import { AuthService } from '../../core/services/auth.service';
import { BoardStore } from '../../core/services/board-store.service';
import { ToastService } from '../../core/services/toast.service';
import { UserService } from '../../core/services/user.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { BoardComponent } from '../board/board.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [FormsModule, BoardComponent, EmptyStateComponent, SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex-1 flex flex-col min-h-0 overflow-hidden">
      <div class="flex items-center gap-3 px-6 py-2.5 bg-indigo-600/10 border-b border-indigo-600/20 flex-shrink-0">
        <span class="w-2 h-2 rounded-full bg-indigo-500 animate-pulse flex-shrink-0"></span>
        <span class="text-sm font-medium text-indigo-400">Mode Admin — accès complet à tous les boards</span>
        @if (selectedUser(); as u) {
          <span class="text-indigo-700 text-xs">·</span>
          <span class="text-xs text-indigo-500">
            Consultation : <strong class="text-indigo-300">{{ u.email }}</strong>
          </span>
        }
      </div>

      <div class="flex flex-1 min-h-0 overflow-hidden">
        <div class="w-60 flex-shrink-0 border-r border-slate-800 flex flex-col overflow-y-auto bg-slate-900/40">
          <div class="p-4 flex-1">
            <p class="text-[11px] font-semibold text-slate-600 uppercase tracking-widest mb-3">Utilisateurs</p>
            <div class="space-y-1">
              @for (u of users(); track u.id) {
                <button type="button" (click)="select(u.id)"
                        class="w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all flex items-center gap-2.5 border"
                        [class.bg-indigo-600/20]="selectedUserId() === u.id"
                        [class.border-indigo-600/30]="selectedUserId() === u.id"
                        [class.text-indigo-300]="selectedUserId() === u.id"
                        [class.text-slate-400]="selectedUserId() !== u.id"
                        [class.hover:bg-slate-800]="selectedUserId() !== u.id"
                        [class.hover:text-slate-300]="selectedUserId() !== u.id"
                        [class.border-transparent]="selectedUserId() !== u.id">
                  <div class="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                       [class.bg-indigo-600]="u.role === 'Admin'"
                       [class.text-white]="u.role === 'Admin'"
                       [class.bg-slate-700]="u.role !== 'Admin'"
                       [class.text-slate-300]="u.role !== 'Admin'">
                    {{ u.email[0].toUpperCase() }}
                  </div>
                  <div class="min-w-0">
                    <p class="text-[12px] font-medium truncate">{{ u.email.split('@')[0] }}</p>
                    <p class="text-[10px] text-slate-600 truncate">{{ u.email.split('@')[1] }}</p>
                  </div>
                  @if (u.role === 'Admin') {
                    <span class="ml-auto text-[10px] bg-indigo-600/20 text-indigo-400 px-1.5 py-0.5 rounded-md font-medium flex-shrink-0">Admin</span>
                  }
                </button>
              }
            </div>

            <div class="mt-5 pt-4 border-t border-slate-800">
              <p class="text-[11px] font-semibold text-slate-600 uppercase tracking-widest mb-2">Recherche par email</p>
              <form (ngSubmit)="search()" class="flex flex-col gap-2">
                <input [(ngModel)]="searchEmail" name="searchEmail"
                       placeholder="email&#64;exemple.com"
                       class="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors">
                <button type="submit" [disabled]="searching() || !searchEmail.trim()"
                        class="py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5">
                  @if (searching()) { <app-spinner size="sm" /> }
                  {{ searching() ? 'Recherche…' : 'Rechercher' }}
                </button>
              </form>

              @if (searchError()) {
                <p class="mt-2 text-[11px] text-red-400">{{ searchError() }}</p>
              }
              @if (searchResult(); as r) {
                <div class="mt-2 p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-300 space-y-0.5">
                  <p class="font-semibold text-slate-200">{{ r.email }}</p>
                  <p class="text-slate-500">{{ r.role }} · ID {{ r.id }}</p>
                </div>
              }
            </div>
          </div>
        </div>

        <div class="flex-1 flex flex-col min-h-0 overflow-hidden">
          @if (selectedUserId(); as id) {
            <app-board [boardUserId]="id" />
          } @else {
            <app-empty-state icon="👤" title="Aucun utilisateur sélectionné"
                             subtitle="Choisissez un utilisateur dans la liste pour consulter son board." />
          }
        </div>
      </div>
    </div>
  `,
})
export class AdminComponent implements OnInit {
  private readonly store = inject(BoardStore);
  private readonly auth = inject(AuthService);
  private readonly users$ = inject(UserService);
  private readonly toast = inject(ToastService);

  protected readonly users = this.store.users;
  protected readonly selectedUserId = signal<number | null>(null);

  protected searchEmail = '';
  protected readonly searchResult = signal<User | null>(null);
  protected readonly searchError = signal('');
  protected readonly searching = signal(false);

  protected readonly selectedUser = computed(() =>
    this.users().find((u) => u.id === this.selectedUserId()) ?? this.searchResult(),
  );

  ngOnInit(): void {
    if (!this.store.loaded() && !this.store.loading()) {
      this.store.load().catch((err) => this.toast.error(this.errorMessage(err)));
    } else if (this.users().length === 0) {
      this.store.refreshUsers().catch((err) => this.toast.error(this.errorMessage(err)));
    }
    if (this.selectedUserId() === null) {
      const me = this.auth.currentUser()?.id ?? null;
      this.selectedUserId.set(me);
    }
  }

  select(userId: number): void {
    this.selectedUserId.set(userId);
    this.searchResult.set(null);
  }

  async search(): Promise<void> {
    const email = this.searchEmail.trim();
    if (!email) return;
    this.searching.set(true);
    this.searchError.set('');
    this.searchResult.set(null);
    try {
      const user = await lastValueFrom(this.users$.getUserByEmail(email));
      this.searchResult.set(user);
      this.selectedUserId.set(user.id);
    } catch (err) {
      const httpErr = err as HttpErrorResponse;
      this.searchError.set(
        httpErr.status === 404 ? 'Utilisateur non trouvé' : this.errorMessage(err),
      );
    } finally {
      this.searching.set(false);
    }
  }

  private errorMessage(err: unknown): string {
    const e = err as { error?: unknown; message?: string };
    if (typeof e.error === 'string' && e.error) return e.error;
    if (e.message) return e.message;
    return 'Une erreur est survenue';
  }
}
