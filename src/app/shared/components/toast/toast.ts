import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  template: `
    <div class="fixed top-4 right-4 z-50 space-y-2">
      @for (toast of toastService.toasts$(); track toast.id) {
        <div 
          [class]="getToastClasses(toast.type)"
          class="min-w-80 max-w-md rounded-lg shadow-lg p-4 animate-slide-in"
        >
          <div class="flex items-start">
            <!-- Icon -->
            <div class="flex-shrink-0">
              @switch (toast.type) {
                @case ('success') {
                  <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                @case ('error') {
                  <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                @case ('warning') {
                  <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                }
                @case ('info') {
                  <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              }
            </div>

            <!-- Content -->
            <div class="ml-3 flex-1">
              <p class="text-sm font-medium" [class]="getTitleColor(toast.type)">
                {{ toast.title }}
              </p>
              <p class="mt-1 text-sm text-gray-600">
                {{ toast.message }}
              </p>
            </div>

            <!-- Close button -->
            <button
              type="button"
              (click)="toastService.remove(toast.id)"
              class="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes slide-in {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .animate-slide-in {
      animation: slide-in 0.3s ease-out;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Toast {
  protected readonly toastService = inject(ToastService);

  protected getToastClasses(type: string): string {
    const baseClasses = 'border-l-4';
    const typeClasses = {
      success: 'bg-green-50 border-green-500',
      error: 'bg-red-50 border-red-500',
      warning: 'bg-yellow-50 border-yellow-500',
      info: 'bg-blue-50 border-blue-500'
    };
    return `${baseClasses} ${typeClasses[type as keyof typeof typeClasses] || ''}`;
  }

  protected getTitleColor(type: string): string {
    const colors = {
      success: 'text-green-800',
      error: 'text-red-800',
      warning: 'text-yellow-800',
      info: 'text-blue-800'
    };
    return colors[type as keyof typeof colors] || 'text-gray-800';
  }
}