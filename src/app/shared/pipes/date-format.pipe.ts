import { Pipe, PipeTransform } from '@angular/core';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

@Pipe({
  name: 'dateFormat',
  standalone: true
})
export class DateFormatPipe implements PipeTransform {
  /**
   * Formatea una fecha según el formato especificado
   * 
   * @param value - Fecha a formatear (Date, string o number)
   * @param formatStr - Formato deseado (por defecto: 'dd/MM/yyyy')
   * 
   * Ejemplos:
   * - {{ date | dateFormat }} → "15/10/2024"
   * - {{ date | dateFormat:'dd MMMM yyyy' }} → "15 octubre 2024"
   * - {{ date | dateFormat:'EEEE, dd MMMM' }} → "martes, 15 octubre"
   */
  transform(value: Date | string | number | null | undefined, formatStr: string = 'dd/MM/yyyy'): string {
    if (!value) return '';

    try {
      const date = typeof value === 'string' ? parseISO(value) : new Date(value);
      return format(date, formatStr, { locale: es });
    } catch (error) {
      console.error('Error formatting date:', error);
      return String(value);
    }
  }
}