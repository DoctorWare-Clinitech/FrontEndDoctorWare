import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts = signal<Toast[]>([]);
  
  // Señal pública de solo lectura
  readonly toasts$ = this.toasts.asReadonly();

  /**
   * Mostrar toast de éxito
   */
  success(title: string, message: string, duration = 3000): void {
    this.show('success', title, message, duration);
  }

  /**
   * Mostrar toast de error
   */
  error(title: string, message: string, duration = 5000): void {
    this.show('error', title, message, duration);
  }

  /**
   * Mostrar toast de advertencia
   */
  warning(title: string, message: string, duration = 4000): void {
    this.show('warning', title, message, duration);
  }

  /**
   * Mostrar toast de información
   */
  info(title: string, message: string, duration = 3000): void {
    this.show('info', title, message, duration);
  }

  /**
   * Mostrar toast genérico
   */
  private show(type: ToastType, title: string, message: string, duration: number): void {
    const id = `toast-${Date.now()}-${Math.random()}`;
    
    const toast: Toast = { id, type, title, message, duration };
    
    // Agregar toast
    this.toasts.update(current => [...current, toast]);

    // Auto-remover después del duration
    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }
  }

  /**
   * Remover toast por ID
   */
  remove(id: string): void {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }

  /**
   * Limpiar todos los toasts
   */
  clear(): void {
    this.toasts.set([]);
  }
}