import { useEffect } from 'react';

export type BackHandler = () => boolean;

interface RegisteredHandler {
  id: string;
  handler: BackHandler;
  priority: number;
}

class NavigationManager {
  private handlers: RegisteredHandler[] = [];
  private isExiting = false;

  /**
   * Registra un manejador de botón atrás / gesto de retroceso.
   * Prioridad más alta se ejecuta primero (LIFO dentro de la misma prioridad).
   */
  public register(id: string, handler: BackHandler, priority = 10): () => void {
    // Remover existente si ya estaba registrado
    this.handlers = this.handlers.filter(h => h.id !== id);
    // Insertar al inicio para que el último registrado tenga preferencia si tienen misma prioridad
    this.handlers.unshift({ id, handler, priority });
    this.handlers.sort((a, b) => b.priority - a.priority);

    return () => {
      this.unregister(id);
    };
  }

  public unregister(id: string) {
    this.handlers = this.handlers.filter(h => h.id !== id);
  }

  /**
   * Ejecuta los manejadores registrados en orden de prioridad.
   * Retorna true si algún manejador procesó el evento de retroceso.
   */
  public runHandlers(): boolean {
    for (const item of [...this.handlers]) {
      try {
        const handled = item.handler();
        if (handled) {
          return true;
        }
      } catch (err) {
        console.error(`[NavigationManager] Error en back handler '${item.id}':`, err);
      }
    }
    return false;
  }

  public setExiting(val: boolean) {
    this.isExiting = val;
  }

  public getIsExiting(): boolean {
    return this.isExiting;
  }
}

export const navigationManager = new NavigationManager();

/**
 * Hook para registrar un controlador de atrás mientras una condición esté activa (modal abierto, etc.)
 */
export function useBackHandler(
  id: string,
  isActive: boolean,
  onBack: () => void,
  priority = 10
) {
  useEffect(() => {
    if (!isActive) return;

    const unregister = navigationManager.register(
      id,
      () => {
        onBack();
        return true;
      },
      priority
    );

    return () => {
      unregister();
    };
  }, [id, isActive, onBack, priority]);
}
