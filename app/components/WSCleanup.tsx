'use client';
import { useEffect } from 'react';

export default function WSCleanup() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 1. Desregistrar cualquier Service Worker residual de la PWA anterior
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister();
          }
        }).catch((err) => {
          console.error('Error al desregistrar el Service Worker:', err);
        });
      }

      // 2. Limpiar la memoria caché antigua almacenada
      if ('caches' in window) {
        caches.keys().then((names) => {
          for (const name of names) {
            caches.delete(name);
          }
        }).catch((err) => {
          console.error('Error al limpiar las cachés:', err);
        });
      }
    }
  }, []);

  return null;
}
