import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';

const TITLES: Record<string, string> = {
  '/board': 'Mon Board',
  '/admin': 'Administration',
};

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex h-screen overflow-hidden bg-slate-950 text-slate-200">
      <app-sidebar />
      <div class="flex-1 flex flex-col min-h-0 min-w-0">
        <app-topbar [title]="title()" />
        <main class="flex-1 flex flex-col min-h-0 overflow-hidden">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class ShellComponent {
  private readonly router = inject(Router);

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  protected readonly title = computed(() => {
    const url = this.currentUrl() ?? '';
    const match = Object.keys(TITLES).find((k) => url.startsWith(k));
    return match ? TITLES[match] : '';
  });
}
