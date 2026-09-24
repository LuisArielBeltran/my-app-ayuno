'use client';
import { useState, useEffect } from 'react';
import { requestNotificationPermission, sendLocalNotification } from '@/lib/notifications';

export default function PushNotificationBanner() {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [supported, setSupported] = useState(true);

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
