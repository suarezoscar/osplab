import { Injectable, signal, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type OspTheme = 'dark' | 'light';

const STORAGE_KEY = 'osp-theme';

/**
 * Servicio global de tema (dark/light).
 *
 * - Lee la preferencia de `localStorage`.
 * - Fallback a `prefers-color-scheme` del sistema.
 * - Aplica/quita la clase `light` en `<html>`.
 * - Expone un signal reactivo `theme()`.
 */
@Injectable({ providedIn: 'root' })
export class OspThemeService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** Tema activo */
  readonly theme = signal<OspTheme>(this.resolveInitial());

  /** Atajo: true si estamos en modo oscuro */
  readonly isDark = () => this.theme() === 'dark';

  constructor() {
    // Sincronizar con el DOM cada vez que cambie
    effect(() => {
      if (!this.isBrowser) return;
      const t = this.theme();
      const root = document.documentElement;

      if (t === 'light') {
        root.classList.add('light');
        root.classList.remove('dark');
      } else {
        root.classList.remove('light');
        root.classList.add('dark');
      }

      try {
        localStorage.setItem(STORAGE_KEY, t);
      } catch {
        // SSR / quota exceeded — silencioso
      }
    });
  }

  /** Alterna entre dark y light */
  toggle(): void {
    this.theme.set(this.theme() === 'dark' ? 'light' : 'dark');
  }

  /** Establece un tema concreto */
  set(theme: OspTheme): void {
    this.theme.set(theme);
  }

  private resolveInitial(): OspTheme {
    if (!this.isBrowser) return 'dark';

    try {
      const stored = localStorage.getItem(STORAGE_KEY) as OspTheme | null;
      if (stored === 'dark' || stored === 'light') return stored;
    } catch {
      // ignore
    }

    // Respetar preferencia del sistema
    if (window.matchMedia?.('(prefers-color-scheme: light)').matches) {
      return 'light';
    }

    return 'dark';
  }
}
