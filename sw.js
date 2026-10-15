/* Compétition 1.4.3 — service worker : fichiers gardés sur l’appareil pour l’utilisation hors ligne.
   Aucune donnée de l’utilisateur ne passe par ce fichier (elles restent dans le stockage local du navigateur). */
var CACHE = 'competition-1.4.3-9e2e32172dbd';
var FICHIERS = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return Promise.all(FICHIERS.map(function (f) {
      return fetch(new Request(f, { cache: 'reload' })).then(function (r) { if (!r.ok) throw new Error(f + ' : ' + r.status); return c.put(f, r); });
    }));
  }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k.indexOf('competition-') === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(caches.open(CACHE).then(function (c) {
    return c.match(req, { ignoreSearch: true }).then(function (r) {
      if (r) return r;
      if (req.mode === 'navigate') return c.match('index.html').then(function (i) { return i || fetch(req); });
      return fetch(req);
    });
  }));
});
