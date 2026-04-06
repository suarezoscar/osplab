import { Component, computed, input } from '@angular/core';
import type { PharmacyDto } from '@farmacias-guardia/shared-interfaces';
import {
  ClockIconComponent,
  DirectionsIconComponent,
  HouseIconComponent,
  PhoneIconComponent,
  StarIconComponent,
} from '../icons/icons';

@Component({
  selector: 'app-pharmacy-card',
  imports: [
    ClockIconComponent,
    DirectionsIconComponent,
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
      ? 'animate-card-enter animate-glow-once pharmacy-card-primary bg-white rounded-3xl overflow-hidden border-2 border-green-200/60 transition-all duration-300 hover:scale-[1.01]'
      : 'animate-card-enter bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300',
  );

  readonly headerClass = computed(() =>
    this.isFirst()
      ? 'bg-linear-to-br from-green-800 to-green-700 text-white px-5 py-4 flex items-start justify-between gap-3'
      : 'bg-linear-to-br from-green-700 to-green-600 text-white px-5 py-4 flex items-start justify-between gap-3',
  );

  readonly rankBadgeClass = computed(() =>
    this.isFirst()
      ? 'shrink-0 w-7 h-7 rounded-full bg-amber-400 text-amber-900 text-xs font-extrabold flex items-center justify-center shadow-sm'
      : 'shrink-0 w-6 h-6 rounded-full bg-white/20 text-white text-xs font-bold flex items-center justify-center',
  );

  readonly nameClass = computed(() =>
    this.isFirst()
      ? 'font-bold text-lg leading-snug truncate'
      : 'font-semibold text-base leading-snug truncate',
  );

  readonly distanceBadgeClass = computed(() =>
    this.isFirst()
      ? 'shrink-0 bg-white/25 rounded-xl px-3 py-2 text-center min-w-17'
      : 'shrink-0 bg-white/15 rounded-xl px-2.5 py-1.5 text-center min-w-15',
  );

  readonly distanceTextClass = computed(() =>
    this.isFirst() ? 'text-2xl font-extrabold leading-none' : 'text-lg font-extrabold leading-none',
  );

  readonly cityLineClass = computed(() =>
    this.isFirst() ? 'text-green-100 text-sm pl-9 mt-0.5' : 'text-green-100 text-xs pl-8 mt-0.5',
  );

  formatDistance(meters: number | undefined): string {
    if (meters == null) return '';
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  }

  rankLabel(): string {
    return ['La más cercana', 'Segunda más cercana', 'Tercera más cercana'][this.index()] ?? '';
  }
}
