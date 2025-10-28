import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dniFormat',
  standalone: true
})
export class DniFormatPipe implements PipeTransform {
  /**
   * Formatea un DNI con separadores de miles
   * 
   * Ejemplos:
   * - {{ '12345678' | dniFormat }} → "12.345.678"
   * - {{ 12345678 | dniFormat }} → "12.345.678"
   */
  transform(value: string | number | null | undefined): string {
    if (!value) return '';

    const dni = String(value).replace(/\D/g, '');
    
    if (dni.length === 0) return '';

    return dni.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
}