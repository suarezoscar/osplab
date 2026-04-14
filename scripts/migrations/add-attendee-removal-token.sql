-- ============================================================================
-- Migración: Token de auto-eliminación + Seguridad a nivel de columna
-- ============================================================================
-- Permite que quien apuntó a alguien lo dé de baja sin ser organizador.
-- Protege password_hash y removal_token de acceso directo.
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================================

-- 1. Nueva columna para el token de eliminación
ALTER TABLE event_attendees ADD COLUMN IF NOT EXISTS removal_token TEXT;

-- 2. Función RPC para auto-eliminación con token
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

-- 3. Función RPC para eliminar evento completo (admin con contraseña)
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

-- 4. Column-level grants: proteger password_hash y removal_token
--    Las funciones SECURITY DEFINER bypasan esto (ejecutan como owner).

-- events: ocultar password_hash del cliente
REVOKE ALL ON events FROM anon, authenticated;
GRANT SELECT (id, slug, title, location_name, lat, lng, event_date, created_at) ON events TO anon, authenticated;
GRANT INSERT ON events TO anon, authenticated;

-- event_attendees: ocultar removal_token del cliente
REVOKE ALL ON event_attendees FROM anon, authenticated;
GRANT SELECT (id, event_id, name, joined_at) ON event_attendees TO anon, authenticated;
GRANT INSERT ON event_attendees TO anon, authenticated;
