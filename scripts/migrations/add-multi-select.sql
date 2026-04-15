-- ============================================================================
-- Migración: Añadir soporte multi-select a eventos
-- ============================================================================
-- Permite que el creador del evento active la multirespuesta.
-- Por defecto es FALSE (single-select, comportamiento actual).
-- ============================================================================

ALTER TABLE events ADD COLUMN IF NOT EXISTS multi_select BOOLEAN NOT NULL DEFAULT FALSE;

-- Actualizar column grants para incluir la nueva columna
REVOKE ALL ON events FROM anon, authenticated;
GRANT SELECT (id, slug, title, description, location_name, lat, lng, event_date, registration_deadline, options, multi_select, created_at) ON events TO anon, authenticated;
GRANT INSERT ON events TO anon, authenticated;

-- Actualizar la función RPC de update para manejar multi_select
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
  p_clear_deadline          BOOLEAN        DEFAULT FALSE,
  p_multi_select            BOOLEAN        DEFAULT NULL
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
    options                 = COALESCE(p_options, options),
    multi_select            = COALESCE(p_multi_select, multi_select)
  WHERE id = p_event_id;

  RETURN TRUE;
END;
$$;

