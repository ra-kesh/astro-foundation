import type { APIRoute } from 'astro';
import site from '@/config/site';

export const GET: APIRoute = () =>
  new Response(
    JSON.stringify({
      name: site.title,
      short_name: site.name,
      description: site.description,
      start_url: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#ffffff',
      icons: [
        {
          src: '/favicon.svg',
          sizes: 'any',
          type: 'image/svg+xml',
        },
      ],
    }),
    { headers: { 'Content-Type': 'application/manifest+json' } },
  );
