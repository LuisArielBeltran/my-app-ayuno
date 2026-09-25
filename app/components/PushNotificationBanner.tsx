'use client';
import { useState, useEffect } from 'react';
import { requestNotificationPermission, sendLocalNotification } from '@/lib/notifications';
import { useSearchParams } from 'next/navigation';

export default function PushNotificationBanner() {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [supported, setSupported] = useState(true);
  const searchParams = useSearchParams();
  const userEmail = searchParams.get('email') || 'usuario@ayuno.com';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!('Notification' in window)) {
        setSupported(false);
      } else if (Notification.permission === 'granted') {
        setPermissionGranted(true);
      }
    }
  }, []);

  const handleEnable = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setPermissionGranted(true);
      sendLocalNotification(
        '🔔 ¡Notificaciones Activadas!', 
        'Te avisaremos cuando concluya tu ventana de ayuno metabólico.'
      );

      // Registrar la suscripción en el backend de PostgreSQL
      try {
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.ready;
          const pubKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
          
          if (pubKey) {
            // Convertir VAPID key a Uint8Array
            const padding = '='.repeat((4 - (pubKey.length % 4)) % 4);
            const base64 = (pubKey + padding).replace(/-/g, '+').replace(/_/g, '/');
            const rawData = window.atob(base64);
            const outputArray = new Uint8Array(rawData.length);
            for (let i = 0; i < rawData.length; ++i) {
              outputArray[i] = rawData.charCodeAt(i);
            }

            const subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: outputArray
            });

            await fetch('/api/push/subscribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: userEmail, subscription })
            });
          }
        }
      } catch (err) {
        console.error('Error al guardar suscripción push en el servidor:', err);
      }

    } else {
      alert('Has denegado los permisos de notificación en tu navegador. Puedes habilitarlos desde la configuración de tu sitio.');
    }
  };

  if (!supported || permissionGranted) return null;

  return (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-2xl shadow-md flex items-center justify-between gap-4">
      <div>
        <h4 className="font-bold text-sm">Activa las Alertas de Ayuno 🚀</h4>
        <p className="text-xs text-indigo-100 mt-0.5">Recibe avisos automáticos cuando tu cronómetro alcance la meta de autofagia.</p>
      </div>
      <button 
        onClick={handleEnable}
        className="bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-xs px-4 py-2.5 rounded-xl shadow transition-all whitespace-nowrap"
      >
        Activar
      </button>
    </div>
  );
}
