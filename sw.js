// Offline support.
// - App files (HTML, CSS, JS): network first, so updates show up straight away;
//   the cached copy is used only when offline.
// - Quran pages, fonts, hadith and tafsir: kept once read, so they open offline.
// - Translation: network first with an offline copy.
// - Recitation audio and book PDFs stream from their sites.
const SHELL = 'tilawah-shell-v9';
const DATA = 'tilawah-data-v3';
const ASSETS = [
  './', './index.html', './styles.css', './matcher.js', './app.js', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png',
  './mushaf/madinah/meta.json', './mushaf/madinah/search.json', './mushaf/madinah/fonts/QCF4_QBSML.woff2', './hadith/index.json',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== SHELL && k !== DATA).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

function networkFirst(req, cacheName) {
  return fetch(req).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(cacheName).then(c => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match(req, { ignoreSearch: true }));
}

function cacheFirst(req) {
  return caches.match(req).then(hit => hit || fetch(req).then(res => {
    if (res.ok && res.status === 200) { const copy = res.clone(); caches.open(DATA).then(c => c.put(req, copy)); }
    return res;
  }));
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Translation, tafsir and ayah timings: online first, kept for offline use.
  if (['api.alquran.cloud', 'api.quran.com', 'mp3quran.net'].includes(url.hostname)) { e.respondWith(networkFirst(req, DATA)); return; }

  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.open(DATA).then(c => c.match(req).then(hit => {
      const net = fetch(req).then(res => { if (res.ok || res.type === 'opaque') c.put(req, res.clone()); return res; }).catch(() => hit);
      return hit || net;
    })));
    return;
  }

  if (url.origin !== self.location.origin) return;

  // Index files can change between versions, so they are checked online first.
  if (/\/(mushaf|hadith)\//.test(url.pathname) && !/(index|meta)\.json$/.test(url.pathname)) { e.respondWith(cacheFirst(req)); return; }

  e.respondWith(networkFirst(req, SHELL));
});
