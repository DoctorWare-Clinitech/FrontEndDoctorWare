import { Injectable, inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject } from 'rxjs';

export interface ConfirmationConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UiService {
  private readonly toastr = inject(ToastrService);
  private confirmationSubject = new Subject<boolean>();

  showSuccess(message: string, title: string = 'Éxito'): void {
    this.toastr.success(message, title);
  }

  showError(message: string, title: string = 'Error'): void {
    this.toastr.error(message, title);
  }

  showWarning(message: string, title: string = 'Advertencia'): void {
    this.toastr.warning(message, title);
  }

  showInfo(message: string, title: string = 'Información'): void {
    this.toastr.info(message, title);
  }

  // Placeholder for a generic confirmation modal
  // This would typically involve opening a modal component
  // and returning an Observable that emits true/false based on user action.
  openConfirmationModal(config: ConfirmationConfig): Observable<boolean> {
    // For now, we'll use a simple browser confirm.
    // In a real app, this would trigger a dedicated modal component.
    const result = confirm(config.message || '¿Estás seguro?');
    // In a real app, the modal component would emit to confirmationSubject
    // this.confirmationSubject.next(result);
    return new Observable(observer => {
      observer.next(result);
      observer.complete();
    });
  }
}
