'use client';
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  
  // Estado para el plan seleccionado (por defecto 4 semanas, que es el más popular)
  const [selectedPlan, setSelectedPlan] = useState('4weeks');
  const [loading, setLoading] = useState(false);

  const plans = [
    { 
      id: '1week', 
      title: 'Plan 1 Semana', 
      price: '$6.99', 
      desc: 'Ideal para probar el método y ver tus primeros cambios metabólicos.' 
    },
    { 
      id: '4weeks', 
      title: 'Plan 4 Semanas', 
      price: '$19.99', 
      desc: 'El programa más popular para adquirir el hábito y perder peso de forma saludable.', 
      badge: 'Más Vendido ⭐' 
    },
    { 
      id: '12weeks', 
      title: 'Plan 12 Semanas', 
      price: '$39.99', 
      desc: 'Transformación total, cambio metabólico profundo y acceso a guías avanzadas.', 
      badge: 'Ahorra 50% 🚀' 
    }
  ];

  const handleCheckout = () => {
    setLoading(true);
    // Simulamos el proceso de pago con el plan seleccionado y redirigimos al registro de contraseña
    setTimeout(() => {
      router.push(`/register?email=${encodeURIComponent(email)}&plan=${selectedPlan}&success=paid`);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl p-6 md:p-8 space-y-6">
        
        <div className="text-center space-y-2">
          <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Diagnóstico Analizado ✓
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900">Elige tu Plan de Transformación</h1>
          <p className="text-sm text-gray-500">
            Hemos preparado tu ruta metabólica para <b className="text-gray-800">{email || 'tu cuenta'}</b>. Selecciona la duración ideal para alcanzar tu meta:
          </p>
        </div>

        {/* Tarjetas de Selección de 3 Opciones */}
        <div className="space-y-3">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                selectedPlan === plan.id 
                  ? 'border-indigo-600 bg-indigo-50/40 shadow-md ring-2 ring-indigo-600/20' 
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="space-y-1 pr-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-gray-900">{plan.title}</h3>
                  {plan.badge && (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {plan.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{plan.desc}</p>
              </div>
              <div className="text-right whitespace-nowrap">
                <span className="text-2xl font-black text-indigo-600">{plan.price}</span>
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={handleCheckout}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg text-base flex items-center justify-center gap-2"
        >
          {loading ? 'Procesando pago seguro...' : 'Continuar al Pago y Crear Contraseña 🔒'}
        </button>

        <div className="text-center space-y-1">
          <p className="text-xs text-gray-400">🔒 Pago 100% seguro cifrado por SSL • Garantía de devolución de 14 días</p>
        </div>

      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-500">Cargando pasarela de pago...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
