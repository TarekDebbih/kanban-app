import { Injectable, effect, signal } from '@angular/core';

const KEY = 'kanban_theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _darkMode = signal<boolean>(this.loadInitial());
  readonly darkMode = this._darkMode.asReadonly();

  constructor() {
    effect(() => {
      const dark = this._darkMode();
      document.documentElement.classList.toggle('dark', dark);
      localStorage.setItem(KEY, dark ? 'dark' : 'light');
    });
  }

  toggle(): void {
    this._darkMode.update((v) => !v);
  }

  private loadInitial(): boolean {
    const stored = localStorage.getItem(KEY);
    if (stored === 'light') return false;
    return true;
  }
}
