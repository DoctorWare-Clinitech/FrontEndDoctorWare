import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { Calendar, CalendarEvent } from '../../../shared/components/calendar/calendar';
import { Modal } from '../../../shared/components/modal/modal';
import { ToastService } from '../../../shared/services/toast.service';
import { ScheduleService, TimeSlot, BlockedSlot } from '../../../core/services/schedule.service';
import { AppointmentsService } from '../../../core/services/appointments.service';
import { AuthService } from '../../../core/services/auth.service';
import { DateFormatPipe } from '../../../shared/pipes';
import { format, parse, addMinutes } from 'date-fns';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

type ViewMode = 'month' | 'week' | 'day';
type ModalType = 'timeSlot' | 'block' | 'config' | null;

@Component({
  selector: 'app-schedule',
  imports: [
    Calendar,
    Modal,
    DateFormatPipe,
    ReactiveFormsModule
  ],
  templateUrl: './schedule.html',
  styleUrls: ['./schedule.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Schedule implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly toastService = inject(ToastService);
  private readonly scheduleService = inject(ScheduleService);
  private readonly appointmentsService = inject(AppointmentsService);
  private readonly authService = inject(AuthService);

  // State
  protected readonly isLoading = signal(true);
  protected readonly viewMode = signal<ViewMode>('month');
  protected readonly selectedDate = signal(new Date());
  protected readonly showModal = signal(false);
  protected readonly modalType = signal<ModalType>(null);
  
  protected readonly timeSlots = signal<TimeSlot[]>([]);
  protected readonly blockedSlots = signal<BlockedSlot[]>([]);
  protected readonly dayAppointments = signal<any[]>([]);

  protected timeSlotForm!: FormGroup;
  protected blockForm!: FormGroup;
  protected configForm!: FormGroup;

  // Computed
  protected readonly currentUser = signal<any>(this.authService.currentUser$);
  protected readonly professionalId = computed(() => this.currentUser()?.id || '');

  protected readonly calendarEvents = computed((): CalendarEvent[] => {
    const appointments = this.dayAppointments();
    return appointments.map(apt => ({
      id: apt.id,
      date: new Date(apt.date),
      title: `${apt.startTime} - ${apt.patientName}`,
      color: this.getStatusColor(apt.status)
    }));
  });

  protected readonly weekDays = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  protected readonly timeOptions = this.generateTimeOptions();
  protected readonly durationOptions = [15, 20, 30, 45, 60];

  ngOnInit(): void {
    this.initForms();
    this.loadScheduleData();
  }

  private initForms(): void {
    this.timeSlotForm = this.fb.group({
      dayOfWeek: [1, Validators.required],
      startTime: ['09:00', Validators.required],
      endTime: ['17:00', Validators.required],
      duration: [30, [Validators.required, Validators.min(15)]],
      isActive: [true]
    });

    this.blockForm = this.fb.group({
      date: [format(new Date(), 'yyyy-MM-dd'), Validators.required],
      startTime: ['09:00', Validators.required],
      endTime: ['10:00', Validators.required],
      reason: ['', Validators.required]
    });

    this.configForm = this.fb.group({
      consultationDuration: [30, [Validators.required, Validators.min(15)]]
    });
  }

  private loadScheduleData(): void {
    this.isLoading.set(true);
    const profId = this.professionalId();

    if (!profId) {
      this.isLoading.set(false);
      return;
    }

    // Cargar configuración de agenda (mock data por ahora)
    this.timeSlots.set([
      { id: '1', dayOfWeek: 1, startTime: '09:00', endTime: '13:00', duration: 30, isActive: true },
      { id: '2', dayOfWeek: 1, startTime: '14:00', endTime: '18:00', duration: 30, isActive: true },
      { id: '3', dayOfWeek: 2, startTime: '09:00', endTime: '13:00', duration: 30, isActive: true },
      { id: '4', dayOfWeek: 3, startTime: '09:00', endTime: '13:00', duration: 30, isActive: true },
      { id: '5', dayOfWeek: 4, startTime: '09:00', endTime: '13:00', duration: 30, isActive: true },
      { id: '6', dayOfWeek: 5, startTime: '09:00', endTime: '13:00', duration: 30, isActive: true }
    ]);

    // Cargar turnos del mes actual
    this.loadMonthAppointments();

    this.isLoading.set(false);
  }

  private loadMonthAppointments(): void {
    this.appointmentsService.getAll().subscribe({
      next: (appointments) => {
        this.dayAppointments.set(appointments);
      },
      error: (error) => {
        console.error('Error loading appointments:', error);
        this.toastService.error('Error', 'No se pudieron cargar los turnos');
      }
    });
  }

  protected onDateSelected(date: Date): void {
    this.selectedDate.set(date);
    // Cargar turnos del día seleccionado
    this.loadDayAppointments(date);
  }

  private loadDayAppointments(date: Date): void {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    this.appointmentsService.getAll({
      startDate: dayStart,
      endDate: dayEnd,
      professionalId: this.professionalId()
    }).subscribe({
      next: (appointments) => {
        console.log('Day appointments:', appointments);
      },
      error: (error) => {
        console.error('Error loading day appointments:', error);
      }
    });
  }

  protected setViewMode(mode: ViewMode): void {
    this.viewMode.set(mode);
  }

  protected openTimeSlotModal(): void {
    this.modalType.set('timeSlot');
    this.timeSlotForm.reset({
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '17:00',
      duration: 30,
      isActive: true
    });
    this.showModal.set(true);
  }

  protected openBlockModal(): void {
    this.modalType.set('block');
    this.blockForm.reset({
      date: format(this.selectedDate(), 'yyyy-MM-dd'),
      startTime: '09:00',
      endTime: '10:00',
      reason: ''
    });
    this.showModal.set(true);
  }

  protected openConfigModal(): void {
    this.modalType.set('config');
    this.configForm.reset({
      consultationDuration: 30
    });
    this.showModal.set(true);
  }

  protected closeModal(): void {
    this.showModal.set(false);
    this.modalType.set(null);
  }

  protected saveTimeSlot(): void {
    if (this.timeSlotForm.invalid) {
      this.timeSlotForm.markAllAsTouched();
      return;
    }

    const newSlot: TimeSlot = {
      id: Date.now().toString(),
      ...this.timeSlotForm.value
    };

    this.timeSlots.update(slots => [...slots, newSlot]);
    this.toastService.success('Horario agregado', 'El horario se agregó correctamente');
    this.closeModal();
  }

  protected saveBlock(): void {
    if (this.blockForm.invalid) {
      this.blockForm.markAllAsTouched();
      return;
    }

    const formValue = this.blockForm.value;
    const newBlock: BlockedSlot = {
      id: Date.now().toString(),
      date: parse(formValue.date, 'yyyy-MM-dd', new Date()),
      startTime: formValue.startTime,
      endTime: formValue.endTime,
      reason: formValue.reason,
      createdAt: new Date()
    };

    this.blockedSlots.update(blocks => [...blocks, newBlock]);
    this.toastService.success('Horario bloqueado', 'El horario se bloqueó correctamente');
    this.closeModal();
  }

  protected saveConfig(): void {
    if (this.configForm.invalid) {
      this.configForm.markAllAsTouched();
      return;
    }

    this.toastService.success('Configuración guardada', 'La configuración se actualizó correctamente');
    this.closeModal();
  }

  protected deleteTimeSlot(slotId: string): void {
    if (confirm('¿Estás seguro de eliminar este horario?')) {
      this.timeSlots.update(slots => slots.filter(s => s.id !== slotId));
      this.toastService.success('Horario eliminado', 'El horario se eliminó correctamente');
    }
  }

  protected toggleTimeSlotStatus(slot: TimeSlot): void {
    this.timeSlots.update(slots =>
      slots.map(s => s.id === slot.id ? { ...s, isActive: !s.isActive } : s)
    );
    this.toastService.info(
      slot.isActive ? 'Horario desactivado' : 'Horario activado',
      'El estado del horario se actualizó'
    );
  }

  protected deleteBlock(blockId: string): void {
    if (confirm('¿Estás seguro de desbloquear este horario?')) {
      this.blockedSlots.update(blocks => blocks.filter(b => b.id !== blockId));
      this.toastService.success('Horario desbloqueado', 'El horario se desbloqueó correctamente');
    }
  }

  private getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      scheduled: '#3b82f6',
      confirmed: '#10b981',
      completed: '#6b7280',
      cancelled: '#ef4444',
      in_progress: '#8b5cf6'
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