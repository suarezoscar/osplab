import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { EventsService, EVENTS_APP_VERSION } from '@osplab/events-data-access';
import { LocationPickerComponent, MapCoords } from './location-picker.component';
import {
  OspHeaderComponent,
  OspIconComponent,
  OspLabFooterComponent,
  OspLangSwitcherComponent,
} from '@osplab/shared-ui';

@Component({
  selector: 'app-event-create',
  standalone: true,
  imports: [
    FormsModule,
    TranslocoPipe,
    LocationPickerComponent,
    OspHeaderComponent,
    OspIconComponent,
    OspLabFooterComponent,
    OspLangSwitcherComponent,
  ],
  templateUrl: './event-create.component.html',
})
export class EventCreateComponent {
  private readonly eventsService = inject(EventsService);
  private readonly router = inject(Router);
  private readonly t = inject(TranslocoService);

  readonly appVersion = inject(EVENTS_APP_VERSION);

  // ── Form fields ───────────────────────────────────────────────────────────
  title = signal('');
  description = signal('');
  locationName = signal('');
  locationLat = signal<number | null>(null);
  locationLng = signal<number | null>(null);
  eventDate = signal('');
  registrationDeadline = signal('');
  password = signal('');
  options = signal<string[]>([]);
  newOption = signal('');
  multiSelect = signal(false);

  // ── UI state ──────────────────────────────────────────────────────────────
  submitting = signal(false);
  error = signal<string | null>(null);
  minDateTime = new Date().toISOString().slice(0, 16);

  onCoordsSelected(coords: MapCoords | null): void {
    this.locationLat.set(coords?.lat ?? null);
    this.locationLng.set(coords?.lng ?? null);
  }

  addOption(): void {
    const opt = this.newOption().trim();
    if (!opt) return;
    if (this.options().includes(opt)) return;
    this.options.update((list) => [...list, opt]);
    this.newOption.set('');
  }

  removeOption(index: number): void {
    this.options.update((list) => list.filter((_, i) => i !== index));
  }

  async onSubmit(): Promise<void> {
    this.error.set(null);

    if (!this.title().trim()) {
      this.error.set(this.t.translate('create.error_title'));
      return;
    }
    if (!this.locationName().trim()) {
      this.error.set(this.t.translate('create.error_location'));
      return;
    }
    if (!this.eventDate()) {
      this.error.set(this.t.translate('create.error_date'));
      return;
    }

    this.submitting.set(true);

    try {
      const date = new Date(this.eventDate());
      const slug = this.eventsService.generateSlug(this.title(), date);

      const passwordHash = this.password().trim()
        ? await this.eventsService.hashPassword(this.password().trim())
        : null;

      const deadline = this.registrationDeadline()
        ? new Date(this.registrationDeadline()).toISOString()
        : null;

      const opts = this.options().length >= 2 ? this.options() : null;

      const event = await this.eventsService.create({
        slug,
        title: this.title().trim(),
        description: this.description().trim() || null,
        location_name: this.locationName().trim(),
        lat: this.locationLat(),
        lng: this.locationLng(),
        event_date: date.toISOString(),
        registration_deadline: deadline,
        options: opts,
        multi_select: opts ? this.multiSelect() : undefined,
        password_hash: passwordHash,
      });

      await this.router.navigate(['/', event.slug], {
        state: { password: this.password().trim() || null },
      });
    } catch (err) {
      this.error.set(this.t.translate('create.error_generic'));
      console.error('Create event error:', err);
    } finally {
      this.submitting.set(false);
    }
  }
}
