/**
 * Configuración de Supabase para la landing app.
 *
 * URL y anon key son PÚBLICOS (diseñados para exponerse en el cliente).
 * La seguridad se garantiza via Row Level Security en Supabase.
 *
 * Para configurar:
 *  1. Ve a Supabase Dashboard → Settings → API
 *  2. Copia "Project URL" y "anon public" key
 *  3. Rellena los valores abajo
 */
export const SUPABASE_CONFIG = {
  url: 'https://vrqaamkqoiuppqtrzpbu.supabase.co',
  anonKey: 'SUPABASE_ANON_KEY', // TODO: Reemplazar con la anon key real
} as const;
