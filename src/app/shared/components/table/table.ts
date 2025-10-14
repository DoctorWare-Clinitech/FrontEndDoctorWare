import { Component, ChangeDetectionStrategy, input, output, computed, signal } from '@angular/core';

export interface TableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => string;
  class?: string;
}

export interface TableConfig {
  showPagination?: boolean;
  pageSize?: number;
  showSearch?: boolean;
  searchPlaceholder?: string;
}

@Component({
  selector: 'app-table',
  template: `
    <div class="bg-white rounded-lg shadow">
      
      <!-- Header con búsqueda -->
      @if (config().showSearch) {
        <div class="p-4 border-b border-gray-200">
          <div class="relative">
            <input
              type="text"
              [value]="searchTerm()"
              (input)="onSearchChange($event)"
              [placeholder]="config().searchPlaceholder || 'Buscar...'"
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <svg class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      }

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              @for (column of columns(); track column.key) {
                <th 
                  [class]="column.class || ''"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  @if (column.sortable) {
                    <button
                      type="button"
                      (click)="onSort(column.key)"
                      class="flex items-center space-x-1 hover:text-gray-700"
                    >
                      <span>{{ column.label }}</span>
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        @if (sortColumn() === column.key) {
                          @if (sortDirection() === 'asc') {
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                          } @else {
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                          }
                        } @else {
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        }
                      </svg>
                    </button>
                  } @else {
                    {{ column.label }}
                  }
                </th>
              }
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            @if (paginatedData().length === 0) {
              <tr>
                <td [colSpan]="columns().length" class="px-6 py-12 text-center text-gray-500">
                  <div class="flex flex-col items-center">
                    <svg class="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p class="text-lg font-medium">No hay datos disponibles</p>
                  </div>
                </td>
              </tr>
            }
            @for (row of paginatedData(); track $index) {
              <tr 
                class="hover:bg-gray-50 transition-colors cursor-pointer"
                (click)="onRowClick(row)"
              >
                @for (column of columns(); track column.key) {
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    @if (column.render) {
                      <span [innerHTML]="column.render(row)"></span>
                    } @else {
                      {{ getNestedValue(row, column.key) }}
                    }
                  </td>
                }
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      @if (config().showPagination && filteredData().length > config().pageSize!) {
        <div class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div class="text-sm text-gray-700">
            Mostrando 
            <span class="font-medium">{{ startIndex() + 1 }}</span>
            a
            <span class="font-medium">{{ endIndex() }}</span>
            de
            <span class="font-medium">{{ filteredData().length }}</span>
            resultados
          </div>
          
          <div class="flex items-center space-x-2">
            <button
              type="button"
              [disabled]="currentPage() === 1"
              (click)="previousPage()"
              class="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            
            @for (page of pages(); track page) {
              <button
                type="button"
                (click)="goToPage(page)"
                [class.bg-primary-600]="currentPage() === page"
                [class.text-white]="currentPage() === page"
                [class.hover:bg-primary-700]="currentPage() === page"
                class="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {{ page }}
              </button>
            }
            
            <button
              type="button"
              [disabled]="currentPage() === totalPages()"
              (click)="nextPage()"
              class="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Table<T = any> {
  // Inputs
  data = input.required<T[]>();
  columns = input.required<TableColumn<T>[]>();
  config = input<TableConfig>({
    showPagination: true,
    pageSize: 10,
    showSearch: true,
    searchPlaceholder: 'Buscar...'
  });

  // Outputs
  rowClick = output<T>();
  searchChange = output<string>();
  sortChange = output<{ column: string; direction: 'asc' | 'desc' }>();

  // State
  protected readonly searchTerm = signal('');
  protected readonly sortColumn = signal<string>('');
  protected readonly sortDirection = signal<'asc' | 'desc'>('asc');
  protected readonly currentPage = signal(1);

  // Computed values
  protected readonly filteredData = computed(() => {
    const data = this.data();
    const term = this.searchTerm().toLowerCase();
    
    if (!term) return data;

    return data.filter(row => {
      return this.columns().some(column => {
        const value = this.getNestedValue(row, column.key);
        return String(value).toLowerCase().includes(term);
      });
    });
  });

  protected readonly sortedData = computed(() => {
    const data = [...this.filteredData()];
    const column = this.sortColumn();
    
    if (!column) return data;

    return data.sort((a, b) => {
      const aVal = this.getNestedValue(a, column);
      const bVal = this.getNestedValue(b, column);
      
      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return this.sortDirection() === 'asc' ? comparison : -comparison;
    });
  });

  protected readonly totalPages = computed(() => {
    return Math.ceil(this.filteredData().length / (this.config().pageSize || 10));
  });

  protected readonly startIndex = computed(() => {
    return (this.currentPage() - 1) * (this.config().pageSize || 10);
  });

  protected readonly endIndex = computed(() => {
    return Math.min(
      this.startIndex() + (this.config().pageSize || 10),
      this.filteredData().length
    );
  });

  protected readonly paginatedData = computed(() => {
    if (!this.config().showPagination) {
      return this.sortedData();
    }
    
    return this.sortedData().slice(this.startIndex(), this.endIndex());
  });

  protected readonly pages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    
    // Mostrar máximo 5 páginas
    let start = Math.max(1, current - 2);
    let end = Math.min(total, current + 2);
    
    // Ajustar si estamos al inicio o final
    if (current <= 3) {
      end = Math.min(5, total);
    }
    if (current >= total - 2) {
      start = Math.max(1, total - 4);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  });

  // Methods
  protected onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
    this.currentPage.set(1);
    this.searchChange.emit(value);
  }

  protected onSort(columnKey: string): void {
    if (this.sortColumn() === columnKey) {
      this.sortDirection.update(dir => dir === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(columnKey);
      this.sortDirection.set('asc');
    }
    
    this.sortChange.emit({
      column: columnKey,
      direction: this.sortDirection()
    });
  }

  protected onRowClick(row: T): void {
    this.rowClick.emit(row);
  }

  protected goToPage(page: number): void {
    this.currentPage.set(page);
  }

  protected previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  protected nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  protected getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj) ?? '';
  }
}