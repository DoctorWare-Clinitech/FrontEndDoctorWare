import { Component, ChangeDetectionStrategy, inject, signal, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';

import { ScheduleService } from '../../../../core/services/schedule.service';
import { AvailableSlot } from '../../../../core/models/schedule.model';
import { ToastService } from '../../../../shared/services/toast.service';
import { DateFormatPipe } from '../../../../shared/pipes';

@Component({
  selector: 'app-day-view',
  standalone: true,
  imports: [CommonModule, DateFormatPipe],
  templateUrl: './day-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DayViewComponent implements OnChanges {
  private readonly scheduleService = inject(ScheduleService);
  private readonly toastService = inject(ToastService);

  @Input({ required: true }) professionalId!: string;
  @Input({ required: true }) selectedDate!: Date;
  @Output() book = new EventEmitter<{ date: Date, time: string }>();

  protected readonly isLoading = signal(false);
  protected readonly slots = signal<AvailableSlot[]>([]);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedDate'] || changes['professionalId']) {
      this.loadAvailableSlots();
    }
  }

  private loadAvailableSlots(): void {
    if (!this.professionalId || !this.selectedDate) {
      return;
    }

    this.isLoading.set(true);
    this.scheduleService.getAvailableSlots(this.professionalId, this.selectedDate)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (slots) => {
          this.slots.set(slots);
        },
        error: (err) => {
          console.error('Error fetching available slots for day view:', err);
          this.toastService.error('Error', 'No se pudieron cargar los horarios del día.');
        }
      });
  }

  protected bookAppointment(slot: AvailableSlot): void {
    if (!slot.available) return;
    this.book.emit({ date: this.selectedDate, time: slot.time });
  }
}
