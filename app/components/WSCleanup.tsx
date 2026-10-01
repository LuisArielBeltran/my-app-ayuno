'use client';
import { useEffect } from 'react';

export default function WSCleanup() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 1. Desregistrar cualquier Service Worker activo o residual
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister();
            console.log('Service Worker desregistrado con éxito.');
          }
        }).catch((err) => {
          console.error('Error al desregistrar el Service Worker:', err);
        });
      }

      // 2. Limpiar la memoria caché antigua almacenada por la PWA
      if ('caches' in window) {
        caches.keys().then((names) => {
          for (const name of names) {
            caches.delete(name);
            console.log('Caché antigua eliminada:', name);
          }
        }).catch((err) => {
          console.error('Error al limpiar las cachés:', err);
        });
      }
    }
  }, []);

  return null;
}
