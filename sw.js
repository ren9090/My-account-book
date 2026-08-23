const CACHE_NAME = 'account-book-v6'
const ASSETS = [
  'index.html',
  'manifest.json',
  'icon-192.png',
  'icon-512.png'
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  )
  self.clients.claim()
})

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // 导航请求：缓存优先秒开，后台静默刷新供下次启动使用
  if (request.mode === 'navigate') {
    const refresh = caches.open(CACHE_NAME).then(cache =>
      fetch(request).then(response => {
        if (response.ok) cache.put('index.html', response.clone());
        return response;
      })
    );
    event.waitUntil(refresh.catch(() => {}));
    event.respondWith(
      caches.match('index.html', { ignoreSearch: true }).then(cached =>
        cached || refresh.catch(() => caches.match('index.html'))
      )
    );
    return;
  }
  // 仅接管白名单静态资源：缓存优先，miss 则网络并写缓存
  if (!ASSETS.includes(url.pathname.split('/').pop())) return;
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }
        return response;
      }).catch(() => caches.match('index.html'));
    })
  );
});
