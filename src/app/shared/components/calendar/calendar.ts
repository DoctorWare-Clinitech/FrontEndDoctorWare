import { Component, ChangeDetectionStrategy, signal, computed, input, output } from '@angular/core';
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths
} from 'date-fns';
import { es } from 'date-fns/locale';

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  hasEvents: boolean;
  eventCount: number;
}

export interface CalendarEvent {
  id: string;
  date: Date;
  title: string;
  color?: string;
}

@Component({
  selector: 'app-calendar',
  template: `
    <div class="bg-white rounded-lg shadow">
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">
          {{ currentMonthLabel() }}
        </h2>
        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="previousMonth()"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            (click)="goToToday()"
            class="px-3 py-1 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          >
            Hoy
          </button>
          <button
            type="button"
            (click)="nextMonth()"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Days of week -->
      <div class="grid grid-cols-7 border-b border-gray-200">
        @for (day of daysOfWeek; track day) {
          <div class="p-2 text-center text-sm font-medium text-gray-600">
            {{ day }}
          </div>
        }
      </div>

      <!-- Calendar grid -->
      <div class="grid grid-cols-7">
        @for (day of calendarDays(); track day.date.toISOString()) {
          <button
            type="button"
            (click)="selectDate(day.date)"
            [class.bg-gray-50]="!day.isCurrentMonth"
            [class.bg-primary-50]="day.isSelected && day.isCurrentMonth"
            [class.border-primary-500]="day.isSelected"
            class="relative min-h-24 p-2 border-r border-b border-gray-200 hover:bg-gray-50 transition-colors text-left"
          >
            <span 
              [class.text-gray-400]="!day.isCurrentMonth"
              [class.text-primary-600]="day.isSelected"
              [class.font-semibold]="day.isToday || day.isSelected"
              class="text-sm"
            >
              {{ day.date.getDate() }}
            </span>

            @if (day.isToday) {
              <div class="absolute top-2 right-2 w-2 h-2 bg-primary-600 rounded-full"></div>
            }

            @if (day.hasEvents && day.isCurrentMonth) {
              <div class="mt-1 space-y-1">
                @for (event of getEventsForDay(day.date); track event.id; let idx = $index) {
                  @if (idx < 2) {
                    <div 
                      [style.background-color]="event.color || '#3b82f6'"
                      class="text-white text-xs px-2 py-0.5 rounded truncate"
                      [title]="event.title"
                    >
                      {{ event.title }}
                    </div>
                  }
                }
                @if (day.eventCount > 2) {
                  <div class="text-xs text-gray-500 text-center">
                    +{{ day.eventCount - 2 }} más
                  </div>
                }
              </div>
            }
          </button>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Calendar {
  // Inputs
  selectedDate = input<Date>(new Date());
  events = input<CalendarEvent[]>([]);

  // Outputs
  dateSelected = output<Date>();
  monthChanged = output<Date>();

  // State
  protected readonly currentMonth = signal(new Date());
  protected readonly daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // Computed
  protected readonly currentMonthLabel = computed(() => {
    return format(this.currentMonth(), 'MMMM yyyy', { locale: es });
  });

  protected readonly calendarDays = computed(() => {
    const month = this.currentMonth();
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    const selected = this.selectedDate();
    const eventsMap = this.createEventsMap();

    return days.map(date => ({
      date,
      isCurrentMonth: isSameMonth(date, month),
      isToday: isToday(date),
      isSelected: isSameDay(date, selected),
      hasEvents: eventsMap.has(this.getDateKey(date)),
      eventCount: eventsMap.get(this.getDateKey(date))?.length || 0
    }));
  });

  protected selectDate(date: Date): void {
    this.dateSelected.emit(date);
  }

  protected previousMonth(): void {
    this.currentMonth.update(month => subMonths(month, 1));
    this.monthChanged.emit(this.currentMonth());
  }

  protected nextMonth(): void {
    this.currentMonth.update(month => addMonths(month, 1));
    this.monthChanged.emit(this.currentMonth());
  }

  protected goToToday(): void {
    const today = new Date();
    this.currentMonth.set(today);
    this.selectDate(today);
  }

  protected getEventsForDay(date: Date): CalendarEvent[] {
    const key = this.getDateKey(date);
    const eventsMap = this.createEventsMap();
    return eventsMap.get(key) || [];
  }

  private createEventsMap(): Map<string, CalendarEvent[]> {
    const map = new Map<string, CalendarEvent[]>();
    
    this.events().forEach(event => {
      const key = this.getDateKey(event.date);
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(event);
    });

    return map;
  }

  private getDateKey(date: Date): string {
    return format(date, 'yyyy-MM-dd');
  }
}
