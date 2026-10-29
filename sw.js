// ブロック落とし — オフラインでも遊べるように取っておく
// index.html は毎回まず取りに行き（新しい版をすぐ届けるため）、つながらないときだけ控えを使う
const CACHE = "bd-v2";
const FILES = ["./", "index.html", "manifest.webmanifest", "icon/icon-192.png", "icon/icon-512.png", "icon/icon-maskable-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("bd-") && k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const isPage = req.mode === "navigate" || req.url.endsWith("/index.html");
  if (isPage) {
    e.respondWith(fetch(req, { cache: "no-store" }).then(r => {
      const copy = r.clone(); caches.open(CACHE).then(c => c.put("index.html", copy)); return r;
    }).catch(() => caches.match("index.html")));
  } else {
    e.respondWith(caches.match(req).then(r => r || fetch(req)));
  }
});
