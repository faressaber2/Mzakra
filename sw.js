// ضع هذا الملف جنب index.html على نفس الموقع (https). بيخلي التطبيق يفتح من غير إنترنت.
const CACHE_NAME = 'mzakraty-v2';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (/firebasedatabase\.app|firebaseio\.com|openrouter\.ai/.test(url.hostname)) return;
  if (req.mode === 'navigate') {   // الصفحة: الشبكة أولًا عشان التحديثات توصل، والكاش لو أوفلاين
    event.respondWith(fetch(req).then(res => { const c = res.clone(); caches.open(CACHE_NAME).then(k => k.put(req, c)); return res; })
      .catch(() => caches.match(req).then(r => r || caches.match('./'))));
    return;
  }
  if (url.origin === self.location.origin || /fonts\.(googleapis|gstatic)\.com|www\.gstatic\.com/.test(url.hostname)) {
    event.respondWith(caches.open(CACHE_NAME).then(cache => cache.match(req).then(cached => {
      const net = fetch(req).then(res => { if (res && (res.status === 200 || res.type === 'opaque')) cache.put(req, res.clone()); return res; }).catch(() => cached);
      return cached || net;
    })));
  }
});
