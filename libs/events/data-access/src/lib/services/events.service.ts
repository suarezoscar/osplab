import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import type { EventRow, AttendeeRow, CreateEventPayload } from '../models/event.model';
import { EVENT_SELECT_COLUMNS } from '../models/event.model';

@Injectable({ providedIn: 'root' })
export class EventsService {
  private readonly db = inject(SupabaseService).client;

  // ── Queries ──────────────────────────────────────────────────────────────

  /** Obtiene un evento por su slug (sin password_hash). */
  async getBySlug(slug: string): Promise<EventRow | null> {
    const { data, error } = await this.db
      .from('events')
      .select(EVENT_SELECT_COLUMNS)
      .eq('slug', slug)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  /** Obtiene los asistentes de un evento ordenados por fecha de inscripción. */
  async getAttendees(eventId: string): Promise<AttendeeRow[]> {
    const { data, error } = await this.db
      .from('event_attendees')
      .select('id, event_id, name, selected_option, joined_at')
      .eq('event_id', eventId)
      .order('joined_at', { ascending: true });

    if (error) throw error;
    return data ?? [];
  }

  // ── Mutations ────────────────────────────────────────────────────────────

  /** Crea un evento y devuelve el registro creado. */
  async create(payload: CreateEventPayload): Promise<EventRow> {
    const { data, error } = await this.db
      .from('events')
      .insert(payload)
      .select(EVENT_SELECT_COLUMNS)
      .single();

    if (error) throw error;
    return data;
  }

  /** Añade un asistente a un evento. Genera un token de auto-eliminación y lo guarda en localStorage. */
  async addAttendee(
    eventId: string,
    name: string,
    selectedOption?: string | null,
  ): Promise<AttendeeRow> {
    const removalToken = this.generateToken(32);

    const { data, error } = await this.db
      .from('event_attendees')
      .insert({
        event_id: eventId,
        name,
        removal_token: removalToken,
        ...(selectedOption ? { selected_option: selectedOption } : {}),
      })
      .select('id, event_id, name, selected_option, joined_at')
      .single();

    if (error) throw error;

    this.storeAttendeeToken(data.id, removalToken);
    return data;
  }

  /** Actualiza un evento verificando la contraseña (via RPC). */
  async updateWithPassword(
    eventId: string,
    passwordHash: string,
    updates: Partial<
      Pick<
        EventRow,
        | 'title'
        | 'description'
        | 'location_name'
        | 'event_date'
        | 'registration_deadline'
        | 'options'
        | 'multi_select'
      >
    >,
  ): Promise<boolean> {
    const { data, error } = await this.db.rpc('update_event_with_password', {
      p_event_id: eventId,
      p_password_hash: passwordHash,
      p_title: updates.title ?? null,
      p_description: updates.description ?? null,
      p_location_name: updates.location_name ?? null,
      p_lat: null,
      p_lng: null,
      p_event_date: updates.event_date ?? null,
      p_registration_deadline: updates.registration_deadline ?? null,
      p_options: updates.options ?? null,
      p_clear_deadline: updates.registration_deadline === null,
      p_multi_select: updates.multi_select ?? null,
    });

    if (error) throw error;
    return data === true;
  }

  /** Verifica la contraseña de un evento (sin modificar nada). */
  async verifyPassword(eventId: string, passwordHash: string): Promise<boolean> {
    const { data, error } = await this.db.rpc('verify_event_password', {
      p_event_id: eventId,
      p_password_hash: passwordHash,
    });

    if (error) throw error;
    return data === true;
  }

  /** Elimina un asistente verificando la contraseña del evento (via RPC). */
  async removeAttendee(
    attendeeId: string,
    eventId: string,
    passwordHash: string,
  ): Promise<boolean> {
    const { data, error } = await this.db.rpc('remove_attendee_with_password', {
      p_attendee_id: attendeeId,
      p_event_id: eventId,
      p_password_hash: passwordHash,
    });

    if (error) throw error;
    return data === true;
  }

  /** Elimina un evento completo y todos sus asistentes (via RPC, requiere contraseña). */
  async deleteEvent(eventId: string, passwordHash: string): Promise<boolean> {
    const { data, error } = await this.db.rpc('delete_event_with_password', {
      p_event_id: eventId,
      p_password_hash: passwordHash,
    });

    if (error) throw error;
    return data === true;
  }

  /** Elimina un asistente usando su token de auto-eliminación (sin contraseña de organizador). */
  async removeAttendeeByToken(attendeeId: string): Promise<boolean> {
    const token = this.getAttendeeToken(attendeeId);
    if (!token) return false;

    const { data, error } = await this.db.rpc('remove_attendee_with_token', {
      p_attendee_id: attendeeId,
      p_removal_token: token,
    });

    if (error) throw error;

    if (data === true) {
      this.clearAttendeeToken(attendeeId);
    }
    return data === true;
  }

  /** Comprueba si el usuario actual tiene el token de un asistente (lo apuntó él). */
  hasAttendeeToken(attendeeId: string): boolean {
    return !!this.getAttendeeToken(attendeeId);
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  /** Genera un slug humano a partir del título y la fecha del evento. */
  generateSlug(title: string, eventDate: Date): string {
    const slugified = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 60);

    const dd = eventDate.getDate().toString().padStart(2, '0');
    const mm = (eventDate.getMonth() + 1).toString().padStart(2, '0');
    const yyyy = eventDate.getFullYear();
    const token = this.generateToken(6);

    return `${slugified}-${dd}-${mm}-${yyyy}-${token}`;
  }

  /** Genera un enlace de Google Calendar para un evento. */
  generateCalendarUrl(event: EventRow): string {
    const start = new Date(event.event_date);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // +2h por defecto

    const fmt = (d: Date) =>
      d
        .toISOString()
        .replace(/[-:]/g, '')
        .replace(/\.\d{3}/, '');

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${fmt(start)}/${fmt(end)}`,
      location: event.location_name,
      details: event.description
        ? `${event.description}\n\nhttps://events.osplab.dev/${event.slug}`
        : `https://events.osplab.dev/${event.slug}`,
    });

    return `https://calendar.google.com/calendar/render?${params}`;
  }

  /** Genera un hash SHA-256 de una contraseña. */
  async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // ── Attendee token storage (localStorage) ────────────────────────────────

  private storeAttendeeToken(attendeeId: string, token: string): void {
    try {
      const tokens = this.getAllAttendeeTokens();
      tokens[attendeeId] = token;
      localStorage.setItem('osplab_attendee_tokens', JSON.stringify(tokens));
    } catch {
      /* localStorage no disponible */
    }
  }

  private getAttendeeToken(attendeeId: string): string | null {
    try {
      return this.getAllAttendeeTokens()[attendeeId] ?? null;
    } catch {
      return null;
    }
  }

  private clearAttendeeToken(attendeeId: string): void {
    try {
      const tokens = this.getAllAttendeeTokens();
      delete tokens[attendeeId];
      localStorage.setItem('osplab_attendee_tokens', JSON.stringify(tokens));
    } catch {
      /* ignore */
    }
  }

  private getAllAttendeeTokens(): Record<string, string> {
    try {
      return JSON.parse(localStorage.getItem('osplab_attendee_tokens') ?? '{}');
    } catch {
      return {};
    }
  }

  private generateToken(length: number): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, (b) => chars[b % chars.length]).join('');
  }
}
