import { Component, ChangeDetectionStrategy, inject, signal, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, finalize } from 'rxjs';
import { startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

import { ScheduleService } from '../../../../core/services/schedule.service';
import { AvailableSlot } from '../../../../core/models/appointment/schedule.model';
import { ToastService } from '../../../../shared/services/toast.service';
import { DateFormatPipe } from '../../../../shared/pipes';

interface DayWithSlots {
  date: Date;
  slots: AvailableSlot[];
}

@Component({
  selector: 'app-week-view',
  standalone: true,
  imports: [CommonModule, DateFormatPipe],
  templateUrl: './week-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WeekViewComponent implements OnChanges {
  private readonly scheduleService = inject(ScheduleService);
  private readonly toastService = inject(ToastService);

  @Input({ required: true }) professionalId!: string;
  @Input({ required: true }) selectedDate!: Date;
  @Output() book = new EventEmitter<{ date: Date, time: string }>();

  protected readonly isLoading = signal(false);
  protected readonly weekDays = signal<DayWithSlots[]>([]);
  
  protected weekInterval: { start: Date, end: Date } | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedDate'] || changes['professionalId']) {
      this.setupWeek();
      this.loadWeekSlots();
    }
  }

  private setupWeek(): void {
    const weekStart = startOfWeek(this.selectedDate, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(this.selectedDate, { weekStartsOn: 1 });
    this.weekInterval = { start: weekStart, end: weekEnd };
    
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
    this.weekDays.set(days.map(d => ({ date: d, slots: [] })));
  }

  private loadWeekSlots(): void {
    if (!this.professionalId || !this.weekInterval) {
      return;
    }

    this.isLoading.set(true);
    
    const weekObservables = this.weekDays().map(day => 
      this.scheduleService.getAvailableSlots(this.professionalId, day.date)
    );

    forkJoin(weekObservables)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (weekResults) => {
          const daysWithSlots: DayWithSlots[] = this.weekDays().map((day, index) => ({
            ...day,
            slots: weekResults[index]
          }));
          this.weekDays.set(daysWithSlots);
        },
        error: (err) => {
          console.error('Error fetching week slots:', err);
          this.toastService.error('Error', 'No se pudieron cargar los horarios de la semana.');
        }
      });
  }

  protected bookAppointment(slot: AvailableSlot, date: Date): void {
    if (!slot.available) return;
    this.book.emit({ date, time: slot.time });
  }
}
