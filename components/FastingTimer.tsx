'use client';
import { useState, useEffect } from 'react';

export default function FastingTimer({ protocolHours = 16 }) {
  const [timeLeft, setTimeLeft] = useState(protocolHours * 3600);
  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState<string | null>(null);

  // 1. Recuperar el estado de ayuno de la base de datos
  useEffect(() => {
    const fetchFasting = async () => {
      const email = localStorage.getItem('user_email');
      if (!email) return;

      try {
        const res = await fetch(`/api/fasting?email=${encodeURIComponent(email)}`);
        const data = await res.json();
        
        if (data.state && data.state.is_fasting && data.state.start_time) {
          setIsActive(true);
          setStartTime(data.state.start_time);
          
          // Calcular el tiempo restante exacto basado en la hora en que empezó
          const start = new Date(data.state.start_time).getTime();
          const now = new Date().getTime();
          const elapsedSeconds = Math.floor((now - start) / 1000);
          const totalTargetSeconds = protocolHours * 3600;
          
          const remaining = totalTargetSeconds - elapsedSeconds;
          setTimeLeft(remaining > 0 ? remaining : 0);
        }
      } catch (error) {
        console.error('Error cargando ayuno:', error);
      }
    };
    fetchFasting();
  }, [protocolHours]);

  // 2. Motor del cronómetro local
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft <= 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // 3. Iniciar/Detener ayuno y notificar a PostgreSQL
  const toggleTimer = async () => {
    const newState = !isActive;
    const newStartTime = newState ? new Date().toISOString() : null;
    const email = localStorage.getItem('user_email') || 'usuario@demo.com';
    
    setIsActive(newState);
    setStartTime(newStartTime);
    setTimeLeft(protocolHours * 3600);

    try {
      await fetch('/api/fasting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          isFasting: newState,
          startTime: newStartTime,
          targetHours: protocolHours
        }),
      });
    } catch (err) {
      console.error('Error guardando en la nube:', err);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercentage = ((protocolHours * 3600 - timeLeft) / (protocolHours * 3600)) * 100;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-lg w-full max-w-sm mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Protocolo {protocolHours}/{24 - protocolHours}</h2>
      
      <div className="relative w-48 h-48 rounded-full border-8 border-gray-100 flex items-center justify-center mb-6">
        <div 
          className="absolute top-0 left-0 w-full h-full rounded-full border-8 border-green-500 transition-all duration-1000"
          style={{ clipPath: `polygon(0 0, 100% 0, 100% ${progressPercentage}%, 0 ${progressPercentage}%)` }}
        ></div>
        <div className="z-10 flex flex-col items-center">
          <span className="text-4xl font-mono font-bold text-gray-800">{formatTime(timeLeft)}</span>
          <span className="text-sm text-gray-500 mt-1">{isActive ? 'Ayuno activo' : 'Pausado'}</span>
        </div>
      </div>

      <button 
        onClick={toggleTimer}
        className={`w-full py-3 rounded-xl font-bold text-white transition-colors ${isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
      >
        {isActive ? 'Romper Ayuno' : 'Iniciar Ayuno'}
      </button>
    </div>
  );
}
