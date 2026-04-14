import { Component, computed, input } from '@angular/core';
import type { PharmacyDto } from '@osplab/shared-interfaces';
import {
  AppleIconComponent,
  ClockIconComponent,
  GoogleMapsIconComponent,
  HouseIconComponent,
  PhoneIconComponent,
  StarIconComponent,
} from '../../icons/icons';

/**
 * Tarjeta de farmacia de guardia.
 *
 * La primera tarjeta (index 0) recibe un estilo destacado con franja ámbar.
 * Las demás muestran un badge numérico con su posición en el ranking.
 */
@Component({
  selector: 'app-pharmacy-card',
  imports: [
    AppleIconComponent,
    ClockIconComponent,
    GoogleMapsIconComponent,
    HouseIconComponent,
    PhoneIconComponent,
    StarIconComponent,
  ],
  templateUrl: './pharmacy-card.component.html',
})
export class PharmacyCardComponent {
  pharmacy = input.required<PharmacyDto>();
  index = input.required<number>();

  readonly isFirst = computed(() => this.index() === 0);
  readonly animationDelay = computed(() => `${this.index() * 90}ms`);

  readonly articleClass = computed(() =>
    this.isFirst()
      ? 'animate-card-enter animate-glow-once pharmacy-card-primary bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border-2 border-amber-200/70 dark:border-amber-700/50 transition-all duration-300 hover:scale-[1.01]'
      : 'animate-card-enter bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-md hover:shadow-lg transition-all duration-300',
  );

  readonly headerClass = computed(() =>
    this.isFirst()
      ? 'bg-linear-to-br from-green-950 to-green-800 text-white px-5 py-4'
      : 'bg-linear-to-br from-green-700 to-green-600 text-white px-5 py-4',
  );

  readonly rankBadgeClass = computed(
    () =>
      'shrink-0 w-6 h-6 rounded-full bg-white/20 text-white text-xs font-bold flex items-center justify-center',
  );

  readonly nameClass = computed(() =>
    this.isFirst() ? 'font-bold text-lg leading-snug' : 'font-semibold text-base leading-snug',
  );

  readonly distanceBadgeClass = computed(() =>
    this.isFirst()
      ? 'inline-flex items-center bg-amber-400 text-amber-900 text-xs font-bold rounded-full px-2.5 py-0.5'
      : 'inline-flex items-center bg-white/15 text-green-100 text-xs font-bold rounded-full px-2.5 py-0.5',
  );

  readonly cityLineClass = computed(() =>
    this.isFirst() ? 'text-green-300 text-sm mt-0.5' : 'text-green-100 text-xs pl-8 mt-0.5',
  );

  readonly ownerClass = computed(() =>
    this.isFirst()
      ? 'text-green-300 text-xs leading-snug italic mt-0.5 truncate'
      : 'text-green-200 text-xs leading-snug italic pl-9 -mt-0.5 truncate',
  );

  /** Formatea una distancia en metros a texto legible (`350 m` / `2.5 km`). */
  formatDistance(meters: number | undefined): string {
    if (meters == null) return '';
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  }

  /** Devuelve la etiqueta de ranking accesible para `aria-label`. */
  rankLabel(): string {
    return ['La más cercana', 'Segunda más cercana', 'Tercera más cercana'][this.index()] ?? '';
  }
}
