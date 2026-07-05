"use client";

import { useEffect } from "react";

/**
 * PintAR bukan PWA dan tidak memakai service worker. Komponen ini membersihkan
 * service worker & cache usang yang mungkin tertinggal dari proyek lain pada
 * origin yang sama (mis. domain tunnel yang pernah dipakai), agar pengguna
 * selalu melihat versi terbaru.
 */
export function ServiceWorkerCleanup() {
  useEffect(() => {
    if (typeof navigator === "undefined") return;

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => regs.forEach((r) => r.unregister()))
        .catch(() => {});
    }

    if (typeof caches !== "undefined") {
      caches
        .keys()
        .then((keys) => keys.forEach((k) => caches.delete(k)))
        .catch(() => {});
    }
  }, []);

  return null;
}
