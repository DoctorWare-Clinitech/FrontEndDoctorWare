import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  private loading = signal(false);
  private loadingCount = signal(0);
  
  readonly isLoading = this.loading.asReadonly();

  /**
   * Mostrar loader
   */
  show(): void {
    this.loadingCount.update(count => count + 1);
    this.loading.set(true);
  }

  /**
   * Ocultar loader
   */
  hide(): void {
    this.loadingCount.update(count => Math.max(0, count - 1));
    
    // Solo ocultar cuando no hay más requests pendientes
    if (this.loadingCount() === 0) {
      this.loading.set(false);
    }
  }

  /**
   * Forzar ocultar (limpiar todos)
   */
  forceHide(): void {
    this.loadingCount.set(0);
    this.loading.set(false);
  }
}