import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Tipos de almacenamiento disponibles
 */
export type StorageType = 'localStorage' | 'sessionStorage';

/**
 * Servicio para encapsular el acceso a localStorage y sessionStorage
 *
 * Proporciona una API tipo-segura para almacenar y recuperar datos
 * Maneja automáticamente la serialización/deserialización JSON
 * Compatible con SSR (Server-Side Rendering)
 * Maneja errores de forma segura
 *
 * @example
 * ```typescript
 * // En un componente o servicio:
 * private storage = inject(StorageService);
 *
 * // Guardar datos
 * this.storage.set('user', { name: 'John', id: 123 });
 *
 * // Recuperar datos
 * const user = this.storage.get<User>('user');
 *
 * // Verificar existencia
 * if (this.storage.has('token')) {
 *   // ...
 * }
 *
 * // Eliminar
 * this.storage.remove('token');
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser: boolean;

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  /**
   * Guarda un valor en el storage
   *
   * @param key - Clave para almacenar el valor
   * @param value - Valor a almacenar (se serializará automáticamente a JSON)
   * @param storageType - Tipo de storage ('localStorage' o 'sessionStorage')
   * @returns true si se guardó exitosamente, false en caso contrario
   */
  set(key: string, value: any, storageType: StorageType = 'localStorage'): boolean {
    if (!this.isBrowser) {
      console.warn('[StorageService] Intento de acceso a storage en SSR');
      return false;
    }

    try {
      const storage = this.getStorage(storageType);
      const serializedValue = JSON.stringify(value);
      storage.setItem(key, serializedValue);
      return true;
    } catch (error) {
      console.error(`[StorageService] Error al guardar '${key}':`, error);
      return false;
    }
  }

  /**
   * Recupera un valor del storage
   *
   * @param key - Clave del valor a recuperar
   * @param storageType - Tipo de storage ('localStorage' o 'sessionStorage')
   * @returns El valor deserializado o null si no existe o hay error
   */
  get<T = any>(key: string, storageType: StorageType = 'localStorage'): T | null {
    if (!this.isBrowser) {
      console.warn('[StorageService] Intento de acceso a storage en SSR');
      return null;
    }

    try {
      const storage = this.getStorage(storageType);
      const serializedValue = storage.getItem(key);

      if (serializedValue === null) {
        return null;
      }

      return JSON.parse(serializedValue) as T;
    } catch (error) {
      console.error(`[StorageService] Error al recuperar '${key}':`, error);
      return null;
    }
  }

  /**
   * Recupera un valor del storage o retorna un valor por defecto
   *
   * @param key - Clave del valor a recuperar
   * @param defaultValue - Valor por defecto si no existe
   * @param storageType - Tipo de storage ('localStorage' o 'sessionStorage')
   * @returns El valor deserializado o el valor por defecto
   */
  getOrDefault<T>(key: string, defaultValue: T, storageType: StorageType = 'localStorage'): T {
    const value = this.get<T>(key, storageType);
    return value !== null ? value : defaultValue;
  }

  /**
   * Elimina un valor del storage
   *
   * @param key - Clave del valor a eliminar
   * @param storageType - Tipo de storage ('localStorage' o 'sessionStorage')
   * @returns true si se eliminó exitosamente, false en caso contrario
   */
  remove(key: string, storageType: StorageType = 'localStorage'): boolean {
    if (!this.isBrowser) {
      console.warn('[StorageService] Intento de acceso a storage en SSR');
      return false;
    }

    try {
      const storage = this.getStorage(storageType);
      storage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`[StorageService] Error al eliminar '${key}':`, error);
      return false;
    }
  }

  /**
   * Limpia todo el contenido del storage
   *
   * @param storageType - Tipo de storage ('localStorage' o 'sessionStorage')
   * @returns true si se limpió exitosamente, false en caso contrario
   */
  clear(storageType: StorageType = 'localStorage'): boolean {
    if (!this.isBrowser) {
      console.warn('[StorageService] Intento de acceso a storage en SSR');
      return false;
    }

    try {
      const storage = this.getStorage(storageType);
      storage.clear();
      return true;
    } catch (error) {
      console.error('[StorageService] Error al limpiar storage:', error);
      return false;
    }
  }

  /**
   * Verifica si existe una clave en el storage
   *
   * @param key - Clave a verificar
   * @param storageType - Tipo de storage ('localStorage' o 'sessionStorage')
   * @returns true si la clave existe, false en caso contrario
   */
  has(key: string, storageType: StorageType = 'localStorage'): boolean {
    if (!this.isBrowser) {
      return false;
    }

    try {
      const storage = this.getStorage(storageType);
      return storage.getItem(key) !== null;
    } catch (error) {
      console.error(`[StorageService] Error al verificar '${key}':`, error);
      return false;
    }
  }

  /**
   * Obtiene todas las claves almacenadas
   *
   * @param storageType - Tipo de storage ('localStorage' o 'sessionStorage')
   * @returns Array con todas las claves
   */
  keys(storageType: StorageType = 'localStorage'): string[] {
    if (!this.isBrowser) {
      return [];
    }

    try {
      const storage = this.getStorage(storageType);
      return Object.keys(storage);
    } catch (error) {
      console.error('[StorageService] Error al obtener claves:', error);
      return [];
    }
  }

  /**
   * Obtiene el número de elementos almacenados
   *
   * @param storageType - Tipo de storage ('localStorage' o 'sessionStorage')
   * @returns Número de elementos
   */
  length(storageType: StorageType = 'localStorage'): number {
    if (!this.isBrowser) {
      return 0;
    }

    try {
      const storage = this.getStorage(storageType);
      return storage.length;
    } catch (error) {
      console.error('[StorageService] Error al obtener length:', error);
      return 0;
    }
  }

  /**
   * Guarda múltiples valores a la vez
   *
   * @param items - Objeto con pares clave-valor a guardar
   * @param storageType - Tipo de storage ('localStorage' o 'sessionStorage')
   * @returns true si todos se guardaron exitosamente, false en caso contrario
   */
  setMany(items: Record<string, any>, storageType: StorageType = 'localStorage'): boolean {
    if (!this.isBrowser) {
      console.warn('[StorageService] Intento de acceso a storage en SSR');
      return false;
    }

    try {
      Object.entries(items).forEach(([key, value]) => {
        this.set(key, value, storageType);
      });
      return true;
    } catch (error) {
      console.error('[StorageService] Error al guardar múltiples valores:', error);
      return false;
    }
  }

  /**
   * Elimina múltiples valores a la vez
   *
   * @param keys - Array de claves a eliminar
   * @param storageType - Tipo de storage ('localStorage' o 'sessionStorage')
   * @returns true si todos se eliminaron exitosamente, false en caso contrario
   */
  removeMany(keys: string[], storageType: StorageType = 'localStorage'): boolean {
    if (!this.isBrowser) {
      console.warn('[StorageService] Intento de acceso a storage en SSR');
      return false;
    }

    try {
      keys.forEach(key => {
        this.remove(key, storageType);
      });
      return true;
    } catch (error) {
      console.error('[StorageService] Error al eliminar múltiples valores:', error);
      return false;
    }
  }

  /**
   * Obtiene el objeto de storage correspondiente
   *
   * @param storageType - Tipo de storage
   * @returns Objeto Storage (localStorage o sessionStorage)
   */
  private getStorage(storageType: StorageType): Storage {
    return storageType === 'localStorage' ? localStorage : sessionStorage;
  }

  /**
   * Verifica si el storage está disponible y funcional
   *
   * @param storageType - Tipo de storage a verificar
   * @returns true si está disponible, false en caso contrario
   */
  isAvailable(storageType: StorageType = 'localStorage'): boolean {
    if (!this.isBrowser) {
      return false;
    }

    try {
      const storage = this.getStorage(storageType);
      const testKey = '__storage_test__';
      storage.setItem(testKey, 'test');
      storage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }
}
