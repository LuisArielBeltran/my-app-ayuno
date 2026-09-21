// components/FastingTimer.tsx
'use client';

import { useState, useEffect } from 'react';

export default function FastingTimer({ protocolHours = 16 }) {
  const [timeLeft, setTimeLeft] = useState(protocolHours * 60 * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);

  // Formato HH:MM:SS
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
      
      {/* Círculo de Progreso */}
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