// Utilidad para gestionar Notificaciones Push en la PWA

export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('Este navegador no soporta notificaciones de escritorio.');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

export function sendLocalNotification(title: string, body: string) {
  if (!('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    // Si la app está en segundo plano o abierta, usa el Service Worker si está disponible
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, {
          body,
          icon: '/icons/icon-192x192.png', // Asegúrate de tener tu icono en la PWA
          badge: '/icons/icon-192x192.png',
          vibrate: [200, 100, 200]
        } as NotificationOptions);
      });
    } else {
      new Notification(title, { body });
    }
  }
}
