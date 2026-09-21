'use client';
import { useState, useEffect } from 'react';

export default function FastingTimer() {
  const [protocolHours, setProtocolHours] = useState(16); // 16 por defecto
  const [timeLeft, setTimeLeft] = useState(16 * 3600);
  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState<string | null>(null);

  // 1. Recuperar el estado de ayuno y la meta guardada
  useEffect(() => {
    const fetchFasting = async () => {
      const email = localStorage.getItem('user_email');
      if (!email) return;

      try {
        const res = await fetch(`/api/fasting?email=${encodeURIComponent(email)}`);
        const data = await res.json();
        
        if (data.state) {
          const savedTarget = data.state.target_hours || 16;
          setProtocolHours(savedTarget);

          if (data.state.is_fasting && data.state.start_time) {
            setIsActive(true);
            setStartTime(data.state.start_time);
            
            const start = new Date(data.state.start_time).getTime();
            const now = new Date().getTime();
            const elapsedSeconds = Math.floor((now - start) / 1000);
            const totalTargetSeconds = savedTarget * 3600;
            
            const remaining = totalTargetSeconds - elapsedSeconds;
            setTimeLeft(remaining > 0 ? remaining : 0);
          } else {
            // Si no está ayunando, resetea el reloj a la meta guardada
            setTimeLeft(savedTarget * 3600);
          }
        }
      } catch (error) {
        console.error('Error cargando ayuno:', error);
      }
    };
    fetchFasting();
  }, []);

  // 2. Motor del cronómetro
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft <= 0 && isActive) {
      setIsActive(false); 
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // 3. Cambiar protocolo desde el selector (solo permitido si está pausado)
  const handleProtocolChange = (hours: number) => {
    if (isActive) return;
    setProtocolHours(hours);
    setTimeLeft(hours * 3600);
  };

  // 4. Iniciar/Detener ayuno y notificar a PostgreSQL
  const toggleTimer = async () => {
    const newState = !isActive;
    const newStartTime = newState ? new Date().toISOString() : null;
    const email = localStorage.getItem('user_email') || 'usuario@demo.com';
    
    setIsActive(newState);
    setStartTime(newStartTime);
    
    if (!newState) {
      setTimeLeft(protocolHours * 3600); // Reiniciar visualmente al detener
    }

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
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-lg w-full max-w-sm mx-auto mb-6">
      <div className="flex justify-between w-full mb-6 items-center">
        <h2 className="text-lg font-bold text-gray-800">Tu Protocolo</h2>
        {/* Selector de horas */}
        <select 
          disabled={isActive}
          value={protocolHours}
          onChange={(e) => handleProtocolChange(Number(e.target.value))}
          className="bg-gray-50 border border-gray-200 text-sm font-semibold rounded-xl focus:ring-green-500 focus:border-green-500 block p-2.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer outline-none"
        >
          <option value={12}>12/12 Principiante</option>
          <option value={16}>16/8 Intermedio</option>
          <option value={20}>20/4 Avanzado</option>
        </select>
      </div>
      
      <div className="relative w-48 h-48 rounded-full border-8 border-gray-100 flex items-center justify-center mb-6">
        <div 
          className="absolute top-0 left-0 w-full h-full rounded-full border-8 border-green-500 transition-all duration-1000"
          style={{ clipPath: `polygon(0 0, 100% 0, 100% ${progressPercentage}%, 0 ${progressPercentage}%)` }}
        ></div>
        <div className="z-10 flex flex-col items-center">
          <span className="text-4xl font-mono font-bold text-gray-800">{formatTime(timeLeft)}</span>
          <span className="text-sm text-gray-500 mt-1">{isActive ? 'Ayuno activo' : 'Ventana abierta'}</span>
        </div>
      </div>

      <button 
        onClick={toggleTimer}
        className={`w-full py-3.5 rounded-xl font-bold text-white transition-colors shadow-md ${isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
      >
        {isActive ? 'Romper Ayuno' : 'Iniciar Ayuno'}
      </button>
    </div>
  );
}
