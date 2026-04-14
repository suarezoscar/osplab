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
  anonKey:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZycWFhbWtxb2l1cHBxdHJ6cGJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NzEyNDMsImV4cCI6MjA5MTA0NzI0M30.HXjvJBgyIxJIrYzpCiTHI0lsy8KUZvc3ryiTGJzE2Ko',
} as const;
