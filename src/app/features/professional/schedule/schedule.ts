import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Calendar, CalendarEvent } from '../../../shared/components/calendar/calendar';
import { Modal } from '../../../shared/components/modal/modal';
import { ToastService } from '../../../shared/services/toast.service';
import { ScheduleService } from '../../../core/services/schedule.service';
import { TimeSlot, BlockedSlot, UpdateScheduleConfigDto, AvailableSlot } from '../../../core/models/schedule.model';
import { Appointment, AppointmentStatus } from '../../../core/models/appointment.model';
import { AppointmentsService } from '../../../core/services/appointments.service';
import { AuthService } from '../../../core/services/auth.service';
import { DateFormatPipe } from '../../../shared/pipes';
import { format, parse, startOfDay, endOfDay, getDay, addMinutes, isBefore, isEqual, isAfter, addDays, addWeeks } from 'date-fns';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { forkJoin, finalize } from 'rxjs';
import { DayViewComponent } from './day-view/day-view.component';
import { WeekViewComponent } from './week-view/week-view.component';

type ViewMode = 'month' | 'week' | 'day';
type ModalType = 'schedule' | 'block' | 'dayDetail' | null;

// New interface for the detailed day view
export interface DaySlot {
  time: string;
  status: 'available' | 'busy' | 'blocked';
  details?: {
    type: 'appointment' | 'block';
    id: string;
    title: string; // Patient name or block reason
  };
}

@Component({
  selector: 'app-schedule',
  imports: [
    CommonModule,
    Calendar,
    Modal,
    DateFormatPipe,
    ReactiveFormsModule,
    DayViewComponent,
    WeekViewComponent
  ],
  templateUrl: './schedule.html',
  styleUrls: ['./schedule.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Schedule implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly scheduleService = inject(ScheduleService);
  private readonly appointmentsService = inject(AppointmentsService);
  private readonly authService = inject(AuthService);

  // State
  protected readonly isLoading = signal(true);
  protected readonly isSaving = signal(false);
  protected readonly viewMode = signal<ViewMode>('month');
  protected readonly selectedDate = signal(new Date());
  protected readonly showModal = signal(false);
  protected readonly modalType = signal<ModalType>(null);
  
  protected readonly timeSlots = signal<TimeSlot[]>([]);
  protected readonly blockedSlots = signal<BlockedSlot[]>([]);
  
  // For Day Detail Modal
  protected readonly dayDetailSlots = signal<DaySlot[]>([]);
  protected readonly isDayDetailLoading = signal(false);

  protected scheduleForm!: FormGroup;
  protected blockForm!: FormGroup;

  // Computed
  protected readonly professionalId = computed(() => this.authService.getCurrentUser()?.id || '');

  protected readonly calendarEvents = computed((): CalendarEvent[] => {
    // Combine appointments and blocked slots for the calendar view
    const appointments = this.appointmentsService.appointments;
    const blocks = this.blockedSlots();

    const appointmentEvents: CalendarEvent[] = appointments().map(apt => ({
      id: apt.id,
      date: new Date(apt.date),
      title: `${apt.startTime} ${apt.patientName}`,
      color: this.getStatusColor(apt.status as AppointmentStatus)
    }));

    const blockEvents: CalendarEvent[] = blocks.map(block => ({
      id: `block-${block.id}`,
      date: new Date(block.date),
      title: `Bloqueado: ${block.reason}`,
      color: '#A0AEC0' // gray-500
    }));

    return [...appointmentEvents, ...blockEvents];
  });

  protected readonly weekDays = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  protected readonly timeOptions = this.generateTimeOptions();
  protected readonly durationOptions = [15, 20, 30, 45, 60];

  ngOnInit(): void {
    this.initForms();
    this.loadScheduleData();
  }

  private initForms(): void {
    this.scheduleForm = this.fb.group({
      consultationDuration: [30, [Validators.required, Validators.min(15)]],
      timeSlots: this.fb.array([])
    });

    this.blockForm = this.fb.group({
      date: [format(new Date(), 'yyyy-MM-dd'), Validators.required],
      startTime: ['09:00', Validators.required],
      endTime: ['10:00', Validators.required],
      reason: ['', Validators.required]
    });
  }

  // --- FormArray Helpers ---
  get timeSlotsArray(): FormArray {
    return this.scheduleForm.get('timeSlots') as FormArray;
  }

  createTimeSlotGroup(slot: TimeSlot | null = null): FormGroup {
    return this.fb.group({
      id: [slot?.id || null],
      dayOfWeek: [slot?.dayOfWeek ?? 1, Validators.required],
      startTime: [slot?.startTime || '09:00', Validators.required],
      endTime: [slot?.endTime || '17:00', Validators.required],
      duration: [slot?.duration || 30, [Validators.required, Validators.min(15)]],
      isActive: [slot?.isActive ?? true, Validators.required]
    });
  }

  addTimeSlotToForm(): void {
    this.timeSlotsArray.push(this.createTimeSlotGroup());
  }

  removeTimeSlotFromForm(index: number): void {
    this.timeSlotsArray.removeAt(index);
  }
  // -------------------------

  private loadScheduleData(): void {
    this.isLoading.set(true);
    const profId = this.professionalId();

    if (!profId) {
      this.isLoading.set(false);
      this.toastService.error('Error de Autenticación', 'No se pudo identificar al profesional.');
      return;
    }

    // Load config and all appointments for the professional
    const initialData$ = {
      config: this.scheduleService.getConfig(profId),
      appointments: this.appointmentsService.loadAll({ professionalId: profId })
    };

    forkJoin(initialData$)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: ({ config }) => {
          this.timeSlots.set(config.timeSlots);
          this.blockedSlots.set(config.blockedSlots);
          this.scheduleForm.patchValue({ consultationDuration: config.consultationDuration });
        },
        error: (error) => {
          console.error('Error loading initial data:', error);
          this.toastService.error('Error al Cargar', 'No se pudo cargar la configuración de la agenda.');
        }
      });
  }

  protected onDateSelected(date: Date): void {
    // Set the selected date as the local date object from the calendar
    this.selectedDate.set(date);
    
    const dayOfWeek = getDay(date);
    const isActiveDay = this.timeSlots().some(slot => slot.isActive && slot.dayOfWeek === dayOfWeek);

    if (!isActiveDay) {
      this.toastService.info('Día no laborable', 'No tienes horarios de atención configurados para este día.');
      return;
    }

    this.openDayDetailModal(date);
  }

  protected openDayDetailModal(date: Date): void {
    const profId = this.professionalId();
    if (!profId) return;

    this.isDayDetailLoading.set(true);
    this.modalType.set('dayDetail');
    this.showModal.set(true);
    this.dayDetailSlots.set([]);

    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    const data$ = {
      config: this.scheduleService.getConfig(profId),
      appointments: this.appointmentsService.getAll({ professionalId: profId, startDate: dayStart, endDate: dayEnd }),
      blocks: this.scheduleService.getBlockedSlots(profId, dayStart, dayEnd)
    };

    forkJoin(data$)
      .pipe(finalize(() => this.isDayDetailLoading.set(false)))
      .subscribe({
        next: ({ config, appointments, blocks }) => {
          this.processDaySlots(date, config.timeSlots, config.consultationDuration, appointments, blocks);
        },
        error: (err) => {
          console.error('Error fetching day details:', err);
          this.toastService.error('Error', 'No se pudieron cargar los detalles del día.');
          this.closeModal();
        }
      });
  }

  private processDaySlots(
    date: Date,
    timeSlots: TimeSlot[],
    duration: number,
    appointments: Appointment[],
    blocks: BlockedSlot[]
  ): void {
    const dayOfWeek = getDay(date);
    const applicableTimeSlots = timeSlots.filter(ts => ts.isActive && ts.dayOfWeek === dayOfWeek);

    if (applicableTimeSlots.length === 0) {
      this.dayDetailSlots.set([]);
      return;
    }

    const allPossibleSlots: DaySlot[] = [];
    const appointmentMap = new Map(appointments.map(apt => [apt.startTime, apt]));
    
    applicableTimeSlots.forEach(ts => {
      let currentTime = parse(ts.startTime, 'HH:mm', date);
      const endTime = parse(ts.endTime, 'HH:mm', date);

      while (isBefore(currentTime, endTime)) {
        const timeStr = format(currentTime, 'HH:mm');
        
        const appointment = appointmentMap.get(timeStr);
        if (appointment) {
          allPossibleSlots.push({
            time: timeStr,
            status: 'busy',
            details: { type: 'appointment', id: appointment.id, title: appointment.patientName }
          });
          currentTime = addMinutes(currentTime, appointment.duration);
          continue;
        }

        const block = blocks.find(b => {
          const blockStart = parse(b.startTime, 'HH:mm', date);
          const blockEnd = parse(b.endTime, 'HH:mm', date);
          return (isEqual(currentTime, blockStart) || isAfter(currentTime, blockStart)) && isBefore(currentTime, blockEnd);
        });

        if (block) {
          allPossibleSlots.push({
            time: timeStr,
            status: 'blocked',
            details: { type: 'block', id: block.id, title: block.reason }
          });
          currentTime = addMinutes(currentTime, duration);
          continue;
        }

        allPossibleSlots.push({ time: timeStr, status: 'available' });
        currentTime = addMinutes(currentTime, duration);
      }
    });

    this.dayDetailSlots.set(allPossibleSlots);
  }

  protected setViewMode(mode: ViewMode): void {
    this.viewMode.set(mode);
  }

  protected openScheduleModal(): void {
    this.modalType.set('schedule');
    this.scheduleForm.patchValue({ consultationDuration: this.scheduleForm.value.consultationDuration });
    
    this.timeSlotsArray.clear();
    this.timeSlots().forEach(slot => {
      this.timeSlotsArray.push(this.createTimeSlotGroup(slot));
    });

    this.showModal.set(true);
  }

  protected openBlockModal(slot?: DaySlot): void {
    this.modalType.set('block');
    this.blockForm.reset({
      date: format(this.selectedDate(), 'yyyy-MM-dd'),
      startTime: slot?.time || '09:00',
      endTime: slot ? format(new Date(`1970-01-01T${slot.time}:00`).getTime() + 30 * 60000, 'HH:mm') : '10:00',
      reason: ''
    });
    this.showModal.set(true);
  }

  protected closeModal(): void {
    this.showModal.set(false);
    this.modalType.set(null);
  }

  protected saveSchedule(): void {
    if (this.scheduleForm.invalid) {
      this.scheduleForm.markAllAsTouched();
      return;
    }

    const profId = this.professionalId();
    if (!profId) return;

    this.isSaving.set(true);
    const formValue = this.scheduleForm.getRawValue() as UpdateScheduleConfigDto;

    this.scheduleService.updateConfig(profId, formValue)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: (updatedConfig) => {
          this.timeSlots.set(updatedConfig.timeSlots);
          this.toastService.success('Agenda guardada', 'Tus horarios se han actualizado correctamente.');
          this.closeModal();
        },
        error: (err) => {
          console.error('Error saving schedule:', err);
          this.toastService.error('Error', 'No se pudo guardar la agenda.');
        }
    });
  }

  protected saveBlock(): void {
    if (this.blockForm.invalid) {
      this.blockForm.markAllAsTouched();
      return;
    }
    
    const profId = this.professionalId();
    if (!profId) return;

    this.isSaving.set(true);
    const formValue = this.blockForm.value;

    const dateString = formValue.date; // "yyyy-MM-dd"
    const dateAsUTC = new Date(dateString + 'T00:00:00Z');

    const blockDto = {
      date: dateAsUTC,
      startTime: formValue.startTime,
      endTime: formValue.endTime,
      reason: formValue.reason
    };

    this.scheduleService.blockSlot(profId, blockDto as any)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: () => {
          this.loadScheduleData(); 
          this.toastService.success('Horario bloqueado', 'El horario se bloqueó correctamente');
          this.closeModal();
        },
        error: (err) => {
          console.error('Error saving block:', err);
          this.toastService.error('Error', 'No se pudo bloquear el horario.');
        }
    });
  }

  protected deleteBlock(blockId: string): void {
    if (!confirm('¿Estás seguro de desbloquear este horario?')) return;

    const profId = this.professionalId();
    if (!profId) return;

    this.isSaving.set(true);
    this.scheduleService.unblockSlot(profId, blockId)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: () => {
          this.loadScheduleData();
          this.toastService.success('Horario desbloqueado', 'El horario se desbloqueó correctamente');
          this.closeModal();
        },
        error: (err) => {
          console.error('Error deleting block:', err);
          this.toastService.error('Error', 'No se pudo desbloquear el horario.');
        }
    });
  }

  protected goToToday(): void {
    this.selectedDate.set(new Date());
  }

  protected changeDay(amount: number): void {
    this.selectedDate.update(current => addDays(current, amount));
  }

  protected changeWeek(amount: number): void {
    this.selectedDate.update(current => addWeeks(current, amount));
  }

  // --- Navigation ---
  onBookAppointment(event: { date: Date, time: string }): void {
    const date = format(event.date, 'yyyy-MM-dd');
    this.router.navigate(['/professional/appointments/new'], {
      queryParams: { date, time: event.time }
    });
    this.closeModal();
  }

  navigateToEditAppointment(id: string): void {
    this.router.navigate(['/professional/appointments', id, 'edit']);
    this.closeModal();
  }

  private getStatusColor(status: AppointmentStatus): string {
    const colors: Record<AppointmentStatus, string> = {
      [AppointmentStatus.SCHEDULED]: '#3b82f6',
      [AppointmentStatus.CONFIRMED]: '#10b981',
      [AppointmentStatus.COMPLETED]: '#6b7280',
      [AppointmentStatus.CANCELLED]: '#ef4444',
      [AppointmentStatus.IN_PROGRESS]: '#8b5cf6',
      [AppointmentStatus.NO_SHOW]: '#F59E0B'
    };
    return colors[status] || '#3b82f6';
  }

  private generateTimeOptions(): string[] {
    const options: string[] = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const h = hour.toString().padStart(2, '0');
        const m = minute.toString().padStart(2, '0');
        options.push(`${h}:${m}`);
      }
    }
    return options;
  }
}
