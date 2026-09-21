'use client';
import { useState, useEffect } from 'react';

export default function WaterTracker() {
  const [glasses, setGlasses] = useState(0);
  const dailyGoal = 8;
  const glassVolume = 250;

  // 1. Cargar el registro desde la nube al abrir la app
  useEffect(() => {
    const fetchWater = async () => {
      const email = localStorage.getItem('user_email');
      if (!email) return; // Si no hay usuario, no busca

      try {
        const res = await fetch(`/api/water?email=${encodeURIComponent(email)}`);
        const data = await res.json();
        if (data.glasses !== undefined) {
          setGlasses(data.glasses);
        }
      } catch (error) {
        console.error('Error al cargar agua:', error);
      }
    };
    fetchWater();
  }, []);

  // 2. Guardar en PostgreSQL al sumar un vaso
  const handleAddGlass = async () => {
    if (glasses < dailyGoal) {
      const newCount = glasses + 1;
      setGlasses(newCount); // Actualiza la pantalla instantáneamente

      const email = localStorage.getItem('user_email') || 'usuario@demo.com';

      try {
        await fetch('/api/water', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, glasses: newCount }), 
        });
      } catch (error) {
        console.error("Error al guardar en la nube", error);
      }
    }
  };

  const progressPercentage = (glasses / dailyGoal) * 100;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-sm mx-auto mt-6">
      <div className="flex justify-between items-end mb-4">
        <h3 className="text-lg font-bold text-gray-800">Hidratación</h3>
        <span className="text-sm font-medium text-blue-500">
          {glasses * glassVolume}ml / {dailyGoal * glassVolume}ml
        </span>
      </div>

      <div className="w-full bg-blue-100 rounded-full h-2.5 mb-6">
        <div 
          className="bg-blue-500 h-2.5 rounded-full transition-all duration-500" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>

      <div className="grid grid-cols-4 gap-4 justify-items-center">
        {Array.from({ length: dailyGoal }).map((_, index) => {
          const isFilled = index < glasses;
          return (
            <button
              key={index}
              onClick={handleAddGlass}
              disabled={isFilled}
              className={`relative flex items-end justify-center w-12 h-14 rounded-b-xl border-2 transition-all duration-300 overflow-hidden ${
                isFilled 
                  ? 'border-blue-500 cursor-default' 
                  : 'border-blue-200 hover:border-blue-300 active:scale-95'
              }`}
            >
              <div 
                className={`absolute bottom-0 w-full bg-blue-500 transition-all duration-500 ${
                  isFilled ? 'h-full' : 'h-0'
                }`}
              ></div>
            </button>
          );
        })}
      </div>
      
      {glasses === dailyGoal && (
        <p className="text-center text-sm font-bold text-blue-600 mt-4 animate-pulse">
          ¡Meta diaria de hidratación alcanzada! 💧
        </p>
      )}
    </div>
  );
}
