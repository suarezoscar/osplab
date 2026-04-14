-- ============================================================================
-- OSPLab Events — Supabase Schema
-- ============================================================================
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- Estas tablas son independientes del schema de farmacias (Prisma).
-- ============================================================================

-- ── Tabla de eventos ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                    TEXT NOT NULL UNIQUE,
  title                   TEXT NOT NULL,
  description             TEXT,                        -- Descripción del evento (opcional)
  location_name           TEXT NOT NULL,
  lat                     DOUBLE PRECISION,
  lng                     DOUBLE PRECISION,
  event_date              TIMESTAMPTZ NOT NULL,
  registration_deadline   TIMESTAMPTZ,                 -- Fecha límite de inscripción (null = event_date)
  options                 JSONB,                       -- Array de strings: opciones a elegir (null = sin opciones)
  password_hash           TEXT,                        -- SHA-256 hash (null = sin contraseña)
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Tabla de asistentes ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS event_attendees (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  selected_option TEXT,                        -- Opción elegida por el asistente (si el evento tiene options)
  removal_token   TEXT,                        -- Token para auto-eliminación
  joined_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Índices ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_event_attendees_event_id ON event_attendees(event_id);

-- ── Row Level Security ──────────────────────────────────────────────────────
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;

-- Lectura pública
CREATE POLICY "events_select" ON events
  FOR SELECT USING (true);

-- Cualquiera puede crear un evento
CREATE POLICY "events_insert" ON events
  FOR INSERT WITH CHECK (true);

-- No se permite UPDATE/DELETE directo — solo via RPC con contraseña
-- (pg_cron maneja el borrado automático)

-- Lectura pública de asistentes
CREATE POLICY "attendees_select" ON event_attendees
  FOR SELECT USING (true);

-- Cualquiera puede apuntarse
CREATE POLICY "attendees_insert" ON event_attendees
  FOR INSERT WITH CHECK (true);

-- ── Column-level grants ──────────────────────────────────────────────────────
-- Protege password_hash y removal_token de acceso directo desde el cliente.
-- Las funciones RPC (SECURITY DEFINER) bypasan esto porque ejecutan como owner.

-- events: ocultar password_hash
REVOKE ALL ON events FROM anon, authenticated;
GRANT SELECT (id, slug, title, description, location_name, lat, lng, event_date, registration_deadline, options, created_at) ON events TO anon, authenticated;
GRANT INSERT ON events TO anon, authenticated;

-- event_attendees: ocultar removal_token
REVOKE ALL ON event_attendees FROM anon, authenticated;
GRANT SELECT (id, event_id, name, selected_option, joined_at) ON event_attendees TO anon, authenticated;
GRANT INSERT ON event_attendees TO anon, authenticated;

-- ── RPC: Actualizar evento con contraseña ───────────────────────────────────
CREATE OR REPLACE FUNCTION update_event_with_password(
  p_event_id                UUID,
  p_password_hash           TEXT,
  p_title                   TEXT           DEFAULT NULL,
  p_description             TEXT           DEFAULT NULL,
  p_location_name           TEXT           DEFAULT NULL,
  p_lat                     DOUBLE PRECISION DEFAULT NULL,
  p_lng                     DOUBLE PRECISION DEFAULT NULL,
  p_event_date              TIMESTAMPTZ    DEFAULT NULL,
  p_registration_deadline   TIMESTAMPTZ    DEFAULT NULL,
  p_options                 JSONB          DEFAULT NULL,
  p_clear_deadline          BOOLEAN        DEFAULT FALSE
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_stored_hash TEXT;
BEGIN
  SELECT password_hash INTO v_stored_hash
    FROM events WHERE id = p_event_id;

  IF v_stored_hash IS NULL OR v_stored_hash != p_password_hash THEN
    RETURN FALSE;
  END IF;

  UPDATE events SET
    title                   = COALESCE(p_title, title),
    description             = COALESCE(p_description, description),
    location_name           = COALESCE(p_location_name, location_name),
    lat                     = COALESCE(p_lat, lat),
    lng                     = COALESCE(p_lng, lng),
    event_date              = COALESCE(p_event_date, event_date),
    registration_deadline   = CASE WHEN p_clear_deadline THEN NULL ELSE COALESCE(p_registration_deadline, registration_deadline) END,
    options                 = COALESCE(p_options, options)
  WHERE id = p_event_id;

  RETURN TRUE;
END;
$$;

-- ── RPC: Verificar contraseña (sin modificar nada) ──────────────────────────
CREATE OR REPLACE FUNCTION verify_event_password(
  p_event_id      UUID,
  p_password_hash  TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_stored_hash TEXT;
BEGIN
  SELECT password_hash INTO v_stored_hash
    FROM events WHERE id = p_event_id;

  RETURN v_stored_hash IS NOT NULL AND v_stored_hash = p_password_hash;
END;
$$;

-- ── RPC: Eliminar asistente con contraseña ──────────────────────────────────
CREATE OR REPLACE FUNCTION remove_attendee_with_password(
  p_attendee_id   UUID,
  p_event_id      UUID,
  p_password_hash  TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_stored_hash TEXT;
BEGIN
  SELECT password_hash INTO v_stored_hash
    FROM events WHERE id = p_event_id;

  IF v_stored_hash IS NULL OR v_stored_hash != p_password_hash THEN
    RETURN FALSE;
  END IF;

  DELETE FROM event_attendees
    WHERE id = p_attendee_id AND event_id = p_event_id;

  RETURN TRUE;
END;
$$;

-- ── RPC: Eliminar evento completo con contraseña ─────────────────────────────
-- Elimina el evento y todos sus asistentes (CASCADE).
CREATE OR REPLACE FUNCTION delete_event_with_password(
  p_event_id      UUID,
  p_password_hash  TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_stored_hash TEXT;
BEGIN
  SELECT password_hash INTO v_stored_hash
    FROM events WHERE id = p_event_id;

  IF v_stored_hash IS NULL OR v_stored_hash != p_password_hash THEN
    RETURN FALSE;
  END IF;

  DELETE FROM events WHERE id = p_event_id;

  RETURN TRUE;
END;
$$;

-- ── RPC: Auto-eliminación de asistente con token ─────────────────────────────
-- Permite que quien apuntó a alguien lo dé de baja sin ser organizador.
CREATE OR REPLACE FUNCTION remove_attendee_with_token(
  p_attendee_id    UUID,
  p_removal_token  TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM event_attendees
    WHERE id = p_attendee_id
      AND removal_token IS NOT NULL
      AND removal_token = p_removal_token;

  RETURN FOUND;
END;
$$;

-- ── Borrado automático: 24h después de event_date ────────────────────────────
-- Requiere la extensión pg_cron (activar en Supabase → Database → Extensions)
-- SELECT cron.schedule(
--   'cleanup-expired-events',
--   '0 * * * *',
--   $$DELETE FROM events WHERE event_date + INTERVAL '24 hours' < now()$$
-- );
