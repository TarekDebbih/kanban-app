import { ChangeDetectionStrategy, Component, output } from '@angular/core';

@Component({
  selector: 'app-modal-backdrop',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    (mousedown)="onMouseDown($event)">
    <ng-content />
  </div>`,
})
export class ModalBackdropComponent {
  readonly close = output<void>();

  onMouseDown(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }
}
