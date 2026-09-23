'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ResultsPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState('12'); // '1', '4', '12' semanas
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutos de cuenta regresiva

  // Temporizador de urgencia (psicología de escasez)
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCheckout = async () => {
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan }),
      });
      const data = await res.json();
      if (data.init_point) {
        window.location.href = data.init_point; // Redirige a Mercado Pago
      } else {
        alert('Error al iniciar el pago. Inténtalo de nuevo.');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl overflow-hidden p-6 md:p-8">
        
        {/* Cabecera de éxito */}
        <div className="text-center mb-6">
          <span className="text-sm font-bold text-indigo-600 uppercase tracking-widest">Plan 100% Personalizado</span>
          <h1 className="text-2xl font-black text-gray-900 mt-1">
            Alcanzarás tus 90 kg de aquí al <span className="text-indigo-600">23 de diciembre</span>
          </h1>
        </div>

        {/* Gráfica ilustrativa simulada */}
        <div className="bg-indigo-50/50 rounded-2xl p-4 mb-6 border border-indigo-100">
          <div className="flex justify-between text-xs text-gray-500 font-semibold mb-2">
            <span>AHORA (93 kg)</span>
            <span className="text-indigo-600">OBJETIVO (90 kg)</span>
          </div>
          <div className="h-24 flex items-end justify-between px-2 relative">
            <div className="w-1/3 bg-indigo-200 h-16 rounded-t-lg"></div>
            <div className="w-1/3 bg-indigo-400 h-20 rounded-t-lg"></div>
            <div className="w-1/3 bg-indigo-600 h-24 rounded-t-lg shadow-lg"></div>
          </div>
        </div>

        {/* Banner de Urgencia */}
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 mb-6 text-center">
          <p className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-1">⏰ Esta oferta especial termina en:</p>
          <span className="text-3xl font-black text-rose-700">{formatTime(timeLeft)}</span>
        </div>

        {/* Selector de Planes */}
        <div className="space-y-3 mb-6">
          
          {/* Plan 1 semana */}
          <div 
            onClick={() => setSelectedPlan('1')}
            className={`cursor-pointer border-2 rounded-2xl p-4 flex items-center justify-between transition-all ${selectedPlan === '1' ? 'border-indigo-600 bg-indigo-50/30 shadow-md' : 'border-gray-100 hover:border-gray-200'}`}
          >
            <div>
              <span className="text-xs font-bold text-gray-400 block">PRueba inicial</span>
              <span className="text-lg font-bold text-gray-900">1 Semana</span>
            </div>
            <div className="text-right">
              <span className="text-sm text-gray-400 line-through block">$6.590 ARS</span>
              <span className="text-xl font-black text-indigo-600">$941 ARS<span className="text-xs text-gray-500 font-normal">/día</span></span>
            </div>
          </div>

          {/* Plan 4 semanas */}
          <div 
            onClick={() => setSelectedPlan('4')}
            className={`cursor-pointer border-2 rounded-2xl p-4 flex items-center justify-between transition-all ${selectedPlan === '4' ? 'border-indigo-600 bg-indigo-50/30 shadow-md' : 'border-gray-100 hover:border-gray-200'}`}
          >
            <div>
              <span className="text-xs font-bold text-indigo-600 block">RECOMENDADO</span>
              <span className="text-lg font-bold text-gray-900">4 Semanas</span>
            </div>
            <div className="text-right">
              <span className="text-sm text-gray-400 line-through block">$10.392 ARS</span>
              <span className="text-xl font-black text-indigo-600">$371 ARS<span className="text-xs text-gray-500 font-normal">/día</span></span>
            </div>
          </div>

          {/* Plan 12 semanas (Más popular) */}
          <div 
            onClick={() => setSelectedPlan('12')}
            className={`cursor-pointer border-2 rounded-2xl p-4 flex items-center justify-between transition-all relative overflow-hidden ${selectedPlan === '12' ? 'border-indigo-600 bg-indigo-50/30 shadow-md' : 'border-gray-100 hover:border-gray-200'}`}
          >
            <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-bl-xl uppercase tracking-wider">
              Más Popular (-80%)
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-600 block">TRANSFORMACIÓN TOTAL</span>
              <span className="text-lg font-bold text-gray-900">12 Semanas</span>
            </div>
            <div className="text-right">
              <span className="text-sm text-gray-400 line-through block">$21.592 ARS</span>
              <span className="text-xl font-black text-indigo-600">$257 ARS<span className="text-xs text-gray-500 font-normal">/día</span></span>
            </div>
          </div>

        </div>

        {/* Botón de Acción Principal */}
        <button 
          onClick={handleCheckout}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-lg py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all mb-4 text-center"
        >
          Quiero mi plan personalizado
        </button>

        {/* Garantía y Seguridad */}
        <div className="text-center text-xs text-gray-400 space-y-1">
          <p>🔒 Garantía de reembolso de 30 días sin preguntas.</p>
          <p>Pago seguro garantizado con Mercado Pago.</p>
        </div>

      </div>
    </div>
  );
}
