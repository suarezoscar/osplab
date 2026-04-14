-- ============================================================================
-- Migración: Descripción, deadline, opciones y selected_option
-- ============================================================================
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================================

-- 1. Nuevas columnas en events
ALTER TABLE events ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS registration_deadline TIMESTAMPTZ;
ALTER TABLE events ADD COLUMN IF NOT EXISTS options JSONB;

-- 2. Nueva columna en event_attendees
ALTER TABLE event_attendees ADD COLUMN IF NOT EXISTS selected_option TEXT;

-- 3. Actualizar column-level grants
REVOKE ALL ON events FROM anon, authenticated;
GRANT SELECT (id, slug, title, description, location_name, lat, lng, event_date, registration_deadline, options, created_at) ON events TO anon, authenticated;
GRANT INSERT ON events TO anon, authenticated;

REVOKE ALL ON event_attendees FROM anon, authenticated;
GRANT SELECT (id, event_id, name, selected_option, joined_at) ON event_attendees TO anon, authenticated;
GRANT INSERT ON event_attendees TO anon, authenticated;

-- 4. Actualizar RPC update_event_with_password con nuevos campos
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

