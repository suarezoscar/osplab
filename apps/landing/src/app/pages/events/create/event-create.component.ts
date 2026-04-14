import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EventsService } from '../../../services/events.service';
import { LocationPickerComponent, MapCoords } from './location-picker.component';

@Component({
  selector: 'app-event-create',
  standalone: true,
  imports: [FormsModule, RouterLink, LocationPickerComponent],
  templateUrl: './event-create.component.html',
})
export class EventCreateComponent {
  private readonly eventsService = inject(EventsService);
  private readonly router = inject(Router);

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
      this.error.set('El título es obligatorio.');
      return;
    }
    if (!this.locationName().trim()) {
      this.error.set('El lugar es obligatorio.');
      return;
    }
    if (!this.eventDate()) {
      this.error.set('La fecha del evento es obligatoria.');
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
        password_hash: passwordHash,
      });

      await this.router.navigate(['/events', event.slug], {
        state: { password: this.password().trim() || null },
      });
    } catch (err) {
      this.error.set('Error al crear el evento. Inténtalo de nuevo.');
      console.error('Create event error:', err);
    } finally {
      this.submitting.set(false);
    }
  }
}
