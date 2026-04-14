import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EventsService } from '../../../services/events.service';
import { SeoService } from '../../../services/seo.service';
import {
  OspThemeToggleComponent,
  OspIconComponent,
  OspLabFooterComponent,
} from '@osplab/shared-ui';
import type { EventRow, AttendeeRow } from '../../../models/event.model';

@Component({
  selector: 'app-event-view',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    OspThemeToggleComponent,
    OspIconComponent,
    OspLabFooterComponent,
  ],
  templateUrl: './event-view.component.html',
})
export class EventViewComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly eventsService = inject(EventsService);
  private readonly seoService = inject(SeoService);

  // ── Data ──────────────────────────────────────────────────────────────
  event = signal<EventRow | null>(null);
  attendees = signal<AttendeeRow[]>([]);

  // ── UI State ──────────────────────────────────────────────────────────
  loading = signal(true);
  notFound = signal(false);
  joinName = signal('');
  joinOption = signal('');
  joining = signal(false);
  copied = signal(false);
  error = signal<string | null>(null);

  // ── Edit mode ─────────────────────────────────────────────────────────
  editMode = signal(false);
  editPassword = signal('');
  editPasswordHash = signal<string | null>(null);
  verifying = signal(false);
  passwordError = signal<string | null>(null);
  saving = signal(false);
  deleting = signal(false);
  confirmDelete = signal(false);

  // Edit form fields
  editTitle = signal('');
  editDescription = signal('');
  editLocation = signal('');
  editEventDate = signal('');
  editDeadline = signal('');
  editOptions = signal<string[]>([]);
  editNewOption = signal('');

  // ── Computed ──────────────────────────────────────────────────────────
  eventUrl = computed(() => {
    const e = this.event();
    return e ? `https://osplab.dev/events/${e.slug}` : '';
  });

  whatsappUrl = computed(() => {
    const e = this.event();
    if (!e) return '';
    const text = `¡Apúntate a "${e.title}"! 📍 ${e.location_name}\n${this.eventUrl()}`;
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  });

  calendarUrl = computed(() => {
    const e = this.event();
    return e ? this.eventsService.generateCalendarUrl(e) : '';
  });

  mapsUrl = computed(() => {
    const e = this.event();
    if (!e) return '';
    if (e.lat && e.lng) return `https://www.google.com/maps?q=${e.lat},${e.lng}`;
    return `https://www.google.com/maps/search/${encodeURIComponent(e.location_name)}`;
  });

  isExpired = computed(() => {
    const e = this.event();
    return e ? new Date(e.event_date) < new Date() : false;
  });

  isRegistrationClosed = computed(() => {
    const e = this.event();
    if (!e) return false;
    const deadline = e.registration_deadline ?? e.event_date;
    return new Date(deadline) < new Date();
  });

  async ngOnInit(): Promise<void> {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) {
      this.notFound.set(true);
      this.loading.set(false);
      return;
    }

    // Check for password passed via router state (after create)
    const nav = this.router.getCurrentNavigation() ?? this.router.lastSuccessfulNavigation?.();
    const statePassword = nav?.extras?.state?.['password'] as string | null;

    try {
      const event = await this.eventsService.getBySlug(slug);
      if (!event) {
        this.notFound.set(true);
        this.loading.set(false);
        return;
      }

      this.event.set(event);
      const attendees = await this.eventsService.getAttendees(event.id);
      this.attendees.set(attendees);

      // Set SEO meta tags
      this.seoService.setEventMeta({
        title: event.title,
        location: event.location_name,
        date: this.formatDate(event.event_date),
        slug: event.slug,
      });

      // Auto-unlock edit mode if password was passed from create page
      if (statePassword) {
        const hash = await this.eventsService.hashPassword(statePassword);
        const valid = await this.eventsService.verifyPassword(event.id, hash);
        if (valid) {
          this.editPasswordHash.set(hash);
        }
      }
    } catch (err) {
      this.error.set('Error al cargar el evento.');
      console.error('Load event error:', err);
    } finally {
      this.loading.set(false);
    }
  }

  ngOnDestroy(): void {
    this.seoService.resetMeta();
  }

  // ── Join ──────────────────────────────────────────────────────────────

  async onJoin(): Promise<void> {
    const e = this.event();
    const name = this.joinName().trim();
    if (!e || !name) return;

    // Si el evento tiene opciones, la selección es obligatoria
    const option = this.joinOption();
    if (e.options?.length && !option) return;

    this.joining.set(true);
    this.error.set(null);

    try {
      const attendee = await this.eventsService.addAttendee(e.id, name, option || null);
      this.attendees.update((list) => [...list, attendee]);
      this.joinName.set('');
      this.joinOption.set('');
    } catch (err) {
      this.error.set('Error al apuntarse. Inténtalo de nuevo.');
      console.error('Join error:', err);
    } finally {
      this.joining.set(false);
    }
  }

  // ── Copy link ─────────────────────────────────────────────────────────

  async copyLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.eventUrl());
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    } catch {
      // Fallback: select input technique
      this.copied.set(false);
    }
  }

  // ── Password verification ─────────────────────────────────────────────

  async onVerifyPassword(): Promise<void> {
    const e = this.event();
    const pwd = this.editPassword().trim();
    if (!e || !pwd) return;

    this.verifying.set(true);
    this.passwordError.set(null);

    try {
      const hash = await this.eventsService.hashPassword(pwd);
      const valid = await this.eventsService.verifyPassword(e.id, hash);

      if (valid) {
        this.editPasswordHash.set(hash);
        this.editPassword.set('');
      } else {
        this.passwordError.set('Contraseña incorrecta.');
      }
    } catch (err) {
      this.passwordError.set('Error al verificar.');
      console.error('Verify password error:', err);
    } finally {
      this.verifying.set(false);
    }
  }

  // ── Edit mode ─────────────────────────────────────────────────────────

  enterEditMode(): void {
    const e = this.event();
    if (!e) return;

    this.editTitle.set(e.title);
    this.editDescription.set(e.description ?? '');
    this.editLocation.set(e.location_name);
    this.editEventDate.set(this.toLocalDatetime(e.event_date));
    this.editDeadline.set(
      e.registration_deadline ? this.toLocalDatetime(e.registration_deadline) : '',
    );
    this.editOptions.set(e.options ?? []);
    this.editMode.set(true);
  }

  cancelEdit(): void {
    this.editMode.set(false);
  }

  async saveEdit(): Promise<void> {
    const e = this.event();
    const hash = this.editPasswordHash();
    if (!e || !hash) return;

    this.saving.set(true);
    this.error.set(null);

    try {
      const opts = this.editOptions()
        .map((opt) => opt.trim())
        .filter(Boolean);
      const ok = await this.eventsService.updateWithPassword(e.id, hash, {
        title: this.editTitle().trim(),
        description: this.editDescription().trim() || null,
        location_name: this.editLocation().trim(),
        event_date: new Date(this.editEventDate()).toISOString(),
        registration_deadline: this.editDeadline()
          ? new Date(this.editDeadline()).toISOString()
          : null,
        options: opts.length >= 2 ? opts : null,
      });

      if (ok) {
        // Reload event data
        const updated = await this.eventsService.getBySlug(e.slug);
        if (updated) this.event.set(updated);
        this.editMode.set(false);
      } else {
        this.error.set('No se pudo actualizar el evento.');
      }
    } catch (err) {
      this.error.set('Error al guardar los cambios.');
      console.error('Save edit error:', err);
    } finally {
      this.saving.set(false);
    }
  }

  // ── Remove attendee (organizer only) ──────────────────────────────────

  async removeAttendee(attendee: AttendeeRow): Promise<void> {
    const e = this.event();
    const hash = this.editPasswordHash();
    if (!e || !hash) return;

    try {
      const ok = await this.eventsService.removeAttendee(attendee.id, e.id, hash);
      if (ok) {
        this.attendees.update((list) => list.filter((a) => a.id !== attendee.id));
      }
    } catch (err) {
      console.error('Remove attendee error:', err);
    }
  }

  // ── Delete event (organizer only) ─────────────────────────────────────

  async deleteEvent(): Promise<void> {
    const e = this.event();
    const hash = this.editPasswordHash();
    if (!e || !hash) return;

    this.deleting.set(true);
    this.error.set(null);

    try {
      const ok = await this.eventsService.deleteEvent(e.id, hash);
      if (ok) {
        await this.router.navigate(['/']);
      } else {
        this.error.set('No se pudo eliminar el evento.');
      }
    } catch (err) {
      this.error.set('Error al eliminar el evento.');
      console.error('Delete event error:', err);
    } finally {
      this.deleting.set(false);
      this.confirmDelete.set(false);
    }
  }

  // ── Self-removal (attendee with token) ────────────────────────────────

  /** Comprueba si el usuario actual apuntó a este asistente (tiene su token). */
  canSelfRemove(attendeeId: string): boolean {
    return this.eventsService.hasAttendeeToken(attendeeId);
  }

  async selfRemoveAttendee(attendee: AttendeeRow): Promise<void> {
    try {
      const ok = await this.eventsService.removeAttendeeByToken(attendee.id);
      if (ok) {
        this.attendees.update((list) => list.filter((a) => a.id !== attendee.id));
      }
    } catch (err) {
      console.error('Self-remove attendee error:', err);
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────

  formatDate(iso: string): string {
    const opts: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(iso).toLocaleDateString('es-ES', opts);
  }

  private toLocalDatetime(iso: string): string {
    const d = new Date(iso);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
}
