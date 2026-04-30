import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts = signal<ToastMessage[]>([]);
  readonly toasts = this._toasts.asReadonly();

  show(message: string, type: ToastType = 'success'): void {
    const id = Date.now() + Math.random();
    const toast: ToastMessage = { id, message, type };
    this._toasts.update((arr) => [...arr, toast]);
    setTimeout(() => this.dismiss(id), 4000);
  }

  success(message: string): void { this.show(message, 'success'); }
  error(message: string): void   { this.show(message, 'error'); }
  info(message: string): void    { this.show(message, 'info'); }

  dismiss(id: number): void {
    this._toasts.update((arr) => arr.filter((t) => t.id !== id));
  }
}
