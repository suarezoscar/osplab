/**
 * Cloudflare Pages Function — Proxy inverso
 *
 * Redirige todas las peticiones /api/* al backend en Render.
 * Esto permite que el frontend Angular use URLs relativas (/api/...)
 * sin problemas de CORS ni cambios en el código fuente.
 *
 * La variable BACKEND_URL se configura en Cloudflare Pages → Settings → Environment Variables.
 * Ejemplo: BACKEND_URL = https://osplab-farmacias-api.onrender.com
 */

/// <reference types="@cloudflare/workers-types" />

interface Env {
  BACKEND_URL: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);

  const backendBase = env.BACKEND_URL || 'http://localhost:3000';
  const backendUrl = `${backendBase}${url.pathname}${url.search}`;

  // Clonar headers (quitando host para evitar conflictos)
  const headers = new Headers(request.headers);
  headers.delete('host');

  const backendResponse = await fetch(backendUrl, {
    method: request.method,
    headers,
    body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
  });

  // Reenviar la respuesta del backend al cliente
  return new Response(backendResponse.body, {
    status: backendResponse.status,
    statusText: backendResponse.statusText,
    headers: backendResponse.headers,
  });
};
