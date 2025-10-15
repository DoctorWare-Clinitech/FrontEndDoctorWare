import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'phoneFormat',
  standalone: true
})
export class PhoneFormatPipe implements PipeTransform {
  /**
   * Formatea un teléfono argentino
   * 
   * Ejemplos:
   * - {{ '541112345678' | phoneFormat }} → "+54 9 11 1234-5678"
   * - {{ '1112345678' | phoneFormat }} → "11 1234-5678"
   */
  transform(value: string | null | undefined): string {
    if (!value) return '';

    // Limpiar el número
    const cleaned = value.replace(/\D/g, '');

    // Formato internacional (54 + código área + número)
    if (cleaned.startsWith('54') && cleaned.length >= 12) {
      const country = cleaned.slice(0, 2);
      const mobile = cleaned.slice(2, 3);
      const area = cleaned.slice(3, 5);
      const first = cleaned.slice(5, 9);
      const second = cleaned.slice(9, 13);
      return `+${country} ${mobile} ${area} ${first}-${second}`;
    }

    // Formato local CABA/GBA (11 + número)
    if (cleaned.startsWith('11') && cleaned.length === 10) {
      const area = cleaned.slice(0, 2);
      const first = cleaned.slice(2, 6);
      const second = cleaned.slice(6, 10);
      return `${area} ${first}-${second}`;
    }

    // Formato con código de área genérico
    if (cleaned.length === 10) {
      const area = cleaned.slice(0, 3);
      const first = cleaned.slice(3, 6);
      const second = cleaned.slice(6, 10);
      return `(${area}) ${first}-${second}`;
    }

    return value;
  }
}