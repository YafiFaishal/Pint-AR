// Kill-switch service worker.
// Menggantikan service worker lama (dari proyek sebelumnya) yang masih meng-cache
// tampilan usang di origin ini. SW ini menghapus semua cache, membatalkan
// registrasi dirinya sendiri, lalu memuat ulang halaman agar konten terbaru tampil.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      } catch (e) {
        // abaikan
      }
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: "window" });
      for (const client of clients) {
        client.navigate(client.url);
      }
    })(),
  );
});
