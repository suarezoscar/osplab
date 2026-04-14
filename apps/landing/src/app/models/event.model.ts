/** Evento tal como viene de Supabase (sin password_hash). */
export interface EventRow {
  id: string;
  slug: string;
  title: string;
  location_name: string;
  lat: number | null;
  lng: number | null;
  event_date: string; // ISO 8601
  created_at: string; // ISO 8601
}

/** Asistente de un evento. */
export interface AttendeeRow {
  id: string;
  event_id: string;
  name: string;
  joined_at: string; // ISO 8601
}

/** Payload para crear un evento. */
export interface CreateEventPayload {
  slug: string;
  title: string;
  location_name: string;
  lat?: number | null;
  lng?: number | null;
  event_date: string;
  password_hash?: string | null;
}

/** Columnas que seleccionamos de la tabla events (excluye password_hash). */
export const EVENT_SELECT_COLUMNS =
  'id, slug, title, location_name, lat, lng, event_date, created_at' as const;
