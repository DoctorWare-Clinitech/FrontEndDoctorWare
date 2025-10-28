import { Pipe, PipeTransform } from '@angular/core';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

@Pipe({
  name: 'timeAgo',
  standalone: true
})
export class TimeAgoPipe implements PipeTransform {
  /**
   * Convierte una fecha en tiempo relativo
   * 
   * Ejemplos:
   * - {{ date | timeAgo }} → "hace 5 minutos"
   * - {{ date | timeAgo:true }} → "hace 5 minutos" (con sufijo)
   */
  transform(value: Date | string | number | null | undefined, addSuffix: boolean = true): string {
    if (!value) return '';

    try {
      const date = typeof value === 'string' ? parseISO(value) : new Date(value);
      return formatDistanceToNow(date, { 
        addSuffix,
        locale: es 
      });
    } catch (error) {
      console.error('Error formatting time ago:', error);
      return String(value);
    }
  }
}