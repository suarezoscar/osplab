/** Evento tal como viene de Supabase (sin password_hash). */
export interface EventRow {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  location_name: string;
  lat: number | null;
  lng: number | null;
  event_date: string; // ISO 8601
  registration_deadline: string | null; // ISO 8601 — si null, se usa event_date
  options: string[] | null; // Opciones que debe elegir el asistente (ej: menús)
  multi_select: boolean; // Si true, el asistente puede elegir varias opciones
  created_at: string; // ISO 8601
}

/** Asistente de un evento. */
export interface AttendeeRow {
  id: string;
  event_id: string;
  name: string;
  selected_option: string | null;
  joined_at: string; // ISO 8601
}

/** Payload para crear un evento. */
export interface CreateEventPayload {
  slug: string;
  title: string;
  description?: string | null;
  location_name: string;
  lat?: number | null;
  lng?: number | null;
  event_date: string;
  registration_deadline?: string | null;
  options?: string[] | null;
  multi_select?: boolean;
  password_hash?: string | null;
}

/** Columnas que seleccionamos de la tabla events (excluye password_hash). */
export const EVENT_SELECT_COLUMNS =
  'id, slug, title, description, location_name, lat, lng, event_date, registration_deadline, options, multi_select, created_at' as const;
