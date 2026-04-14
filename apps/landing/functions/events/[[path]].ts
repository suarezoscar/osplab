/**
 * Cloudflare Pages Function — OG meta tags para eventos
 *
 * Intercepta peticiones a /events/* y, si el User-Agent es un crawler
 * (WhatsApp, Facebook, Twitter, Telegram…), devuelve HTML con OG tags
 * dinámicos para que la preview del enlace sea específica del evento.
 *
 * Para humanos normales: sirve la SPA Angular (index.html).
 *
 * Variables de entorno (Cloudflare Pages → Settings → Environment Variables):
 *   SUPABASE_URL      = https://vrqaamkqoiuppqtrzpbu.supabase.co
 *   SUPABASE_ANON_KEY = eyJ…
 */

/// <reference types="@cloudflare/workers-types" />

interface Env {
  ASSETS: Fetcher;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}

interface EventData {
  title: string;
  location_name: string;
  event_date: string;
}

const BOT_UA =
  /whatsapp|facebookexternalhit|twitterbot|telegrambot|linkedinbot|slackbot|discordbot|googlebot|bingbot/i;

export const onRequest: PagesFunction<Env> = async (context) => {
  const pathParts = context.params.path as string[];
  const path = pathParts?.join('/') || '';

  // /events/create → serve SPA directly
  if (!path || path === 'create') {
    return serveApp(context);
  }

  const ua = context.request.headers.get('user-agent') || '';

  if (BOT_UA.test(ua)) {
    try {
      const event = await fetchEvent(path, context.env);
      if (event) {
        return new Response(buildOgHtml(event, context.request.url), {
          headers: { 'Content-Type': 'text/html;charset=UTF-8' },
        });
      }
    } catch {
      // Fall through to serve the app
    }
  }

  return serveApp(context);
};

async function serveApp(context: { request: Request; env: Env }): Promise<Response> {
  // Fetch the SPA index.html from static assets
  const url = new URL('/', context.request.url);
  return context.env.ASSETS.fetch(url);
}

async function fetchEvent(slug: string, env: Env): Promise<EventData | null> {
  const url = `${env.SUPABASE_URL}/rest/v1/events?slug=eq.${encodeURIComponent(slug)}&select=title,location_name,event_date&limit=1`;

  const res = await fetch(url, {
    headers: {
      apikey: env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
    },
  });

  if (!res.ok) return null;

  const rows = (await res.json()) as EventData[];
  return rows.length > 0 ? rows[0] : null;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function buildOgHtml(event: EventData, pageUrl: string): string {
  const title = escapeHtml(event.title);
  const dateStr = formatDate(event.event_date);
  const description = escapeHtml(
    `📍 ${event.location_name} · 📅 ${dateStr} — ¡Apúntate al evento!`,
  );
  const ogImage = 'https://osplab.dev/assets/images/og-image.png';

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>${title} — OSPLab Events</title>
  <meta name="description" content="${description}" />

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${escapeHtml(pageUrl)}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${ogImage}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:locale" content="es_ES" />
  <meta property="og:site_name" content="OSPLab Events" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${ogImage}" />

  <!-- Redirect humans to the SPA -->
  <meta http-equiv="refresh" content="0;url=${escapeHtml(pageUrl)}" />
</head>
<body>
  <p>Redirigiendo a <a href="${escapeHtml(pageUrl)}">${title}</a>…</p>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
