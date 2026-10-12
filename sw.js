// Makes iNat Viewer installable and usable offline: the app shell, Leaflet, map tiles and photos are cached.
// iNaturalist API calls are not handled here; the page keeps its own data in IndexedDB.
const VER = 'v1';
const SHELL = `shell-${VER}`, LIBS = `libs-${VER}`, TILES = `tiles-${VER}`, PHOTOS = `photos-${VER}`;
const KEEP = [SHELL, LIBS, TILES, PHOTOS];
const SHELL_FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(SHELL_FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => !KEEP.includes(k)).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

async function trim(cache, max) {
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]); // oldest first
}
// Cache-first for third-party files. Re-fetched with CORS so the stored copy is a real response (opaque ones count ~7 MB each against the quota);
// if the server doesn't allow CORS the plain request goes through uncached.
async function cacheFirst(req, name, max) {
  const cache = await caches.open(name);
  const hit = await cache.match(req.url);
  if (hit) return hit;
  try {
    const res = await fetch(req.url, { mode: 'cors', credentials: 'omit' });
    if (res.ok) { cache.put(req.url, res.clone()); if (max) trim(cache, max); }
    return res;
  } catch { return fetch(req); }
}
// App shell: network first (so updates arrive), falling back to the cached copy when offline or slow.
async function shellNav(req) {
  const cache = await caches.open(SHELL);
  try {
    const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 4000);
    const res = await fetch(req, { signal: ctl.signal }); clearTimeout(t);
    if (res.ok && res.type === 'basic') cache.put('index.html', res.clone());
    return res;
  } catch {
    return (await cache.match('index.html')) || (await cache.match('./')) || Response.error();
  }
}
async function staleWhileRevalidate(req) {
  const cache = await caches.open(SHELL);
  const hit = await cache.match(req, { ignoreSearch: true });
  const net = fetch(req).then(res => { if (res.ok) cache.put(req, res.clone()); return res; }).catch(() => hit);
  return hit || net;
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const u = new URL(req.url);
  if (u.origin === location.origin) {
    if (u.pathname.endsWith('/sw.js')) return;
    e.respondWith(req.mode === 'navigate' ? shellNav(req) : staleWhileRevalidate(req));
  } else if (u.hostname === 'cdnjs.cloudflare.com') {
    e.respondWith(cacheFirst(req, LIBS));
  } else if (u.hostname.endsWith('tile.openstreetmap.org')) {
    e.respondWith(cacheFirst(req, TILES, 600));
  } else if (req.destination === 'image' && /(^|\.)inaturalist(-open-data)?\.(org|s3\.amazonaws\.com)$|inaturalist-open-data\.s3/.test(u.hostname)) {
    e.respondWith(cacheFirst(req, PHOTOS, 800));
  }
});
