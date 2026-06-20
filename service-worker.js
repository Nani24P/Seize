const CACHE = "verdant-siege-v1-0";
const SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./src/styles.css",
  "./src/main.js",
  "./src/scenes/BootScene.js",
  "./src/scenes/MenuScene.js",
  "./src/scenes/GameScene.js",
  "./src/objects/Enemy.js",
  "./src/objects/Tower.js",
  "./src/systems/AudioSystem.js",
  "./src/systems/GameState.js",
  "./src/systems/SaveSystem.js",
  "./data/map.js",
  "./data/enemies.js",
  "./data/towers.js",
  "./data/waves.js",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then((cached) => {
      const refresh = fetch(e.request)
        .then((res) => {
          if (res && res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() => cached);
      return cached || refresh;
    })
  );
});
