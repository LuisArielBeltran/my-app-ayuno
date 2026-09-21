// components/WaterTracker.tsx
'use client';

import { useState } from 'react';

export default function WaterTracker() {
  const [glasses, setGlasses] = useState(0);
  const dailyGoal = 8; // Meta: 8 vasos de 250ml (2 litros)
  const glassVolume = 250;

  const handleAddGlass = async () => {
    if (glasses < dailyGoal) {
      const newCount = glasses + 1;
      setGlasses(newCount);

      try {
        // Llamada a tu API (en el futuro aquí pasaremos el userId real)
        await fetch('/api/water', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ volumeMl: glassVolume, userId: null }), 
        });
      } catch (error) {
        console.error("Error al guardar el vaso de agua", error);
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

      {/* Barra de progreso global */}
      <div className="w-full bg-blue-100 rounded-full h-2.5 mb-6">
        <div 
          className="bg-blue-500 h-2.5 rounded-full transition-all duration-500" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>

      {/* Grid interactivo de vasos */}
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
              {/* Líquido animado dentro del vaso */}
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