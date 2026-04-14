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
      .select('id, event_id, name, joined_at')
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

  /** Añade un asistente a un evento. */
  async addAttendee(eventId: string, name: string): Promise<AttendeeRow> {
    const { data, error } = await this.db
      .from('event_attendees')
      .insert({ event_id: eventId, name })
      .select('id, event_id, name, joined_at')
      .single();

    if (error) throw error;
    return data;
  }

  /** Actualiza un evento verificando la contraseña (via RPC). */
  async updateWithPassword(
    eventId: string,
    passwordHash: string,
    updates: Partial<Pick<EventRow, 'title' | 'location_name' | 'event_date'>>,
  ): Promise<boolean> {
    const { data, error } = await this.db.rpc('update_event_with_password', {
      p_event_id: eventId,
      p_password_hash: passwordHash,
      p_title: updates.title ?? null,
      p_location_name: updates.location_name ?? null,
      p_lat: null,
      p_lng: null,
      p_event_date: updates.event_date ?? null,
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

  /** Genera un hash SHA-256 de una contraseña. */
  async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  private generateToken(length: number): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, (b) => chars[b % chars.length]).join('');
  }
}
