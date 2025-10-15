import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'initials',
  standalone: true
})
export class InitialsPipe implements PipeTransform {
  /**
   * Obtiene las iniciales de un nombre
   * 
   * Ejemplos:
   * - {{ 'Juan Pérez' | initials }} → "JP"
   * - {{ 'Dr. Juan Carlos Pérez' | initials }} → "JP"
   * - {{ 'María' | initials }} → "M"
   */
  transform(value: string | null | undefined, maxInitials: number = 2): string {
    if (!value) return '';

    const words = value
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0 && !word.match(/^(Dr|Dra|Sr|Sra|Lic)\.?$/i));

    const initials = words
      .slice(0, maxInitials)
      .map(word => word.charAt(0).toUpperCase())
      .join('');

    return initials;
  }
}