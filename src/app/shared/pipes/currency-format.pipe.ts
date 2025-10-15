import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyFormat',
  standalone: true
})
export class CurrencyFormatPipe implements PipeTransform {
  /**
   * Formatea un número como moneda argentina
   * 
   * Ejemplos:
   * - {{ 1500 | currencyFormat }} → "$ 1.500,00"
   * - {{ 1500 | currencyFormat:'USD' }} → "USD 1.500,00"
   * - {{ 1500 | currencyFormat:'ARS':0 }} → "$ 1.500"
   */
  transform(
    value: number | null | undefined, 
    currency: string = 'ARS',
    decimals: number = 2
  ): string {
    if (value === null || value === undefined) return '';

    const symbol = currency === 'ARS' ? '$' : currency;
    
    const formatted = value.toLocaleString('es-AR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });

    return `${symbol} ${formatted}`;
  }
}