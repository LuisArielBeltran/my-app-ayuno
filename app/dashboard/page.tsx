'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function DashboardContent() {
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get('success');

  // Estados interactivos para las herramientas del dashboard
  const [isFasting, setIsFasting] = useState(false);
  const [fastingSeconds, setFastingSeconds] = useState(0);
  const [waterGlasses, setWaterGlasses] = useState(3); // Ejemplo inicial

  // Lógica del Cronómetro de Ayuno
  useEffect(() => {
    let interval: any = null;
    if (isFasting) {
      interval = setInterval(() => {
        setFastingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isFasting]);

  const formatFastingTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const toggleFasting = () => {
    if (!isFasting) {
      setIsFasting(true);
      setFastingSeconds(0); // Inicia desde 0
    } else {
      setIsFasting(false);
    }
  };

  const addWaterGlass = () => {
    setWaterGlasses((prev) => prev + 1);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden p-6 md:p-8">
      
      {/* Banner de éxito si viene de la compra */}
      {isSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl mb-6 text-center animate-fade-in">
          <span className="font-bold block text-lg mb-1">¡🎉 Plan Activado con Éxito!</span>
          <p className="text-sm">Tu programa personalizado de ayuno intermitente está listo.</p>
        </div>
      )}

      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-gray-900">Panel Principal</h1>
        <p className="text-gray-500 mt-1">Monitorea tus avances metabólicos y hábitos diarios.</p>
      </div>

      {/* Grid de opciones principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        
        {/* Tarjeta de Cronómetro Interactiva */}
        <div className={`border p-6 rounded-2xl flex flex-col justify-between transition-all ${isFasting ? 'bg-indigo-900 text-white border-indigo-900 shadow-lg' : 'bg-indigo-50 border-indigo-100 text-gray-900'}`}>
          <div>
            <span className={`text-xs font-bold uppercase tracking-wider block mb-1 ${isFasting ? 'text-indigo-300' : 'text-indigo-600'}`}>
              {isFasting ? '🔥 Ayuno en Curso' : 'Control activo'}
            </span>
            <h3 className="text-xl font-bold mb-2">Cronómetro de Ayuno</h3>
            
            {isFasting ? (
              <div className="my-4 text-center">
                <span className="text-4xl font-black font-mono tracking-wider">{formatFastingTime(fastingSeconds)}</span>
                <p className="text-xs text-indigo-200 mt-1">Meta recomendada: 16 horas</p>
              </div>
            ) : (
              <p className="text-sm text-gray-600 mb-4">Lleva el control estricto de tus ventanas de ayuno y alimentación.</p>
            )}
          </div>

          <button 
            onClick={toggleFasting}
            className={`w-full font-bold py-3 px-4 rounded-xl transition-all text-center shadow-md ${isFasting ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
          >
            {isFasting ? 'Romper Ayuno / Finalizar' : 'Iniciar Ayuno'}
          </button>
        </div>

        {/* Tarjeta de Hidratación Interactiva */}
        <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1">Hidratación</span>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Registro de Agua</h3>
            <div className="my-3 flex items-center justify-between bg-white/80 p-3 rounded-xl border border-blue-100">
              <span className="text-sm font-semibold text-gray-600">Vasos hoy:</span>
              <span className="text-2xl font-black text-blue-600">{waterGlasses} <span className="text-xs font-normal text-gray-400">/ 8 vasos</span></span>
            </div>
          </div>
          <button 
            onClick={addWaterGlass}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all text-center shadow-md"
          >
            + Registrar Vaso de Agua 💧
          </button>
        </div>

      </div>

      {/* Estado del Plan */}
      <div className="bg-gray-50 border border-gray-200 p-6 rounded-2xl text-center">
        <h4 className="font-bold text-gray-800 mb-1">Estado de tu cuenta</h4>
        <p className="text-sm text-emerald-600 font-semibold">Plan Personalizado Activo ✓</p>
      </div>

    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <Suspense fallback={<div className="text-center py-20 text-gray-500">Cargando panel...</div>}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
