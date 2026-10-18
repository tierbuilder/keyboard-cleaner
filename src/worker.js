// Serves two sites from one set of files:
//   keycleaner.gumber.ai    – Keyboard Cleaner (files in public/)
//   screencleaner.gumber.ai – Screen Cleaner (same files, with the pages below swapped for public/_screen/)
// Also sets the security and caching headers for every response.

const SCREEN_PAGES = {
  '/': '/_screen/',
  '/index.html': '/_screen/',
  '/robots.txt': '/_screen/robots.txt',
  '/sitemap.xml': '/_screen/sitemap.xml',
  '/llms.txt': '/_screen/llms.txt',
  '/og.png': '/_screen/og.png',
  '/manifest.webmanifest': '/_screen/manifest.webmanifest',
};

const SECURITY_HEADERS = {
  'Content-Security-Policy': "default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; manifest-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; object-src 'none'; upgrade-insecure-requests",
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'fullscreen=(self), screen-wake-lock=(self), camera=(), microphone=(), geolocation=(), payment=(), usb=(), hid=(), serial=(), bluetooth=(), interest-cohort=()',
  'X-Frame-Options': 'DENY',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

// Images and icons rarely change; pages, the script, and SEO files are re-checked on every visit.
const LONG_CACHE = /\.(png|svg)$/;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // The workers.dev address would be a duplicate of the real site, so send it there.
    if (url.hostname.endsWith('.workers.dev')) {
      return Response.redirect('https://keycleaner.gumber.ai' + url.pathname + url.search, 301);
    }

    // One address per page: /index.html is the home page.
    if (url.pathname === '/index.html') {
      return Response.redirect(url.origin + '/' + url.search, 301);
    }

    const isScreen = url.hostname.startsWith('screencleaner.');
    const asset = new URL(url);
    if (url.pathname.startsWith('/_screen')) {
      asset.pathname = '/__not_found__'; // the override folder is never served directly; gives a real 404
    } else if (isScreen && SCREEN_PAGES[url.pathname]) {
      asset.pathname = SCREEN_PAGES[url.pathname];
    }

    const res = await env.ASSETS.fetch(new Request(asset, request));
    const out = new Response(res.body, res);
    for (const [name, value] of Object.entries(SECURITY_HEADERS)) out.headers.set(name, value);
    if (res.ok) out.headers.set('Cache-Control', LONG_CACHE.test(asset.pathname) ? 'public, max-age=86400' : 'no-cache');
    if (asset.pathname.endsWith('.txt')) out.headers.set('Content-Type', 'text/plain; charset=utf-8');
    if (asset.pathname.endsWith('.webmanifest')) out.headers.set('Content-Type', 'application/manifest+json');
    return out;
  },
};
