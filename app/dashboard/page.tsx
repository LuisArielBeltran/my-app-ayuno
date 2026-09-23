'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function DashboardContent() {
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get('success');

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden p-6 md:p-8">
      
      {/* Banner de éxito si viene de la compra o simulación */}
      {isSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl mb-6 text-center">
          <span className="font-bold block text-lg mb-1">¡🎉 Plan Activado con Éxito!</span>
          <p className="text-sm">Tu programa personalizado de ayuno intermitente está listo.</p>
        </div>
      )}

      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-gray-900">Panel Principal</h1>
        <p className="text-gray-500 mt-1">Monitorea tus avances metabólicos y hábitos diarios.</p>
      </div>

      {/* Grid de opciones principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        
        {/* Tarjeta de Cronómetro */}
        <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block mb-1">Control activo</span>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Cronómetro de Ayuno</h3>
            <p className="text-sm text-gray-600">Lleva el control estricto de tus ventanas de ayuno y alimentación.</p>
          </div>
          <button className="mt-4 bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-indigo-700 transition-all text-center">
            Iniciar Ayuno
          </button>
        </div>

        {/* Tarjeta de Hidratación */}
        <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1">Hidratación</span>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Registro de Agua</h3>
            <p className="text-sm text-gray-600">Asegúrate de cumplir con tu consumo diario recomendado.</p>
          </div>
          <button className="mt-4 bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 transition-all text-center">
            Registrar Vasos
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
