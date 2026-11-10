import type { APIRoute } from 'astro';

// Di-generate saat build (static), memakai `site` dari astro.config.mjs.
export const GET: APIRoute = ({ site }) => {
  const sitemapUrl = new URL('sitemap-index.xml', site);
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl.href}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
