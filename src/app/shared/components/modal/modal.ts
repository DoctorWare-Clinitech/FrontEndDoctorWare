import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

@Component({
  selector: 'app-modal',
  template: `
    @if (isOpen()) {
      <div 
        class="fixed inset-0 z-50 overflow-y-auto"
        (click)="onBackdropClick($event)"
      >
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"></div>

        <!-- Modal Container -->
        <div class="flex min-h-full items-center justify-center p-4">
          <div 
            [class]="modalClasses()"
            class="relative bg-white rounded-lg shadow-xl transform transition-all animate-modal-in"
            (click)="$event.stopPropagation()"
          >
            <!-- Header -->
            @if (title() || showClose()) {
              <div class="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 class="text-xl font-semibold text-gray-900">
                  {{ title() }}
                </h3>
                @if (showClose()) {
                  <button
                    type="button"
                    (click)="handleClose()"
                    class="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                }
              </div>
            }

            <!-- Content -->
            <div [class]="contentClasses()">
              <ng-content />
            </div>

            <!-- Footer -->
            @if (showFooter()) {
              <div class="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                <ng-content select="[footer]" />
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    @keyframes modal-in {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    .animate-modal-in {
      animation: modal-in 0.2s ease-out;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Modal {
  // Inputs
  isOpen = input.required<boolean>();
  title = input<string>('');
  size = input<ModalSize>('md');
  showClose = input(true);
  showFooter = input(false);
  closeOnBackdrop = input(true);

  // Outputs
  closed = output<void>();

  // Computed
  protected modalClasses = computed(() => {
    const sizeClasses = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      full: 'max-w-full mx-4'
    };
    return `w-full ${sizeClasses[this.size()]}`;
  });

  protected contentClasses = computed(() => {
    return this.showFooter() ? 'p-6' : 'p-6 pb-6';
  });

  protected handleClose(): void {
    this.closed.emit();
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (this.closeOnBackdrop() && event.target === event.currentTarget) {
      this.handleClose();
    }
  }
}
