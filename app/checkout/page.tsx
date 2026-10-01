'use client';
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  
  const [selectedPlan, setSelectedPlan] = useState('4weeks');
  const [loading, setLoading] = useState(false);

  const plans = [
    { 
      id: '1week', 
      title: 'Plan 1 Semana', 
      price: '$6.99 / semana', 
      desc: 'Ideal para probar el método y ver tus primeros cambios metabólicos tras los 7 días de prueba.' 
    },
    { 
      id: '4weeks', 
      title: 'Plan 4 Semanas', 
      price: '$19.99 / mes', 
      desc: 'El programa más popular para adquirir el hábito y perder peso de forma saludable.', 
      badge: 'Más Vendido ⭐' 
    },
    { 
      id: '12weeks', 
      title: 'Plan 12 Semanas', 
      price: '$39.99 / trimestre', 
      desc: 'Transformación total, cambio metabólico profundo y acceso a guías avanzadas.', 
      badge: 'Ahorra 50% 🚀' 
    }
  ];

  const handleCheckout = () => {
    setLoading(true);
    // Simulamos el proceso de pago/suscripción y redirigimos al registro
    setTimeout(() => {
      router.push(`/register?email=${encodeURIComponent(email)}&plan=${selectedPlan}&success=trial_active`);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl p-6 md:p-8 space-y-6">
        
        <div className="text-center space-y-2">
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Diagnóstico Analizado ✓
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900">Activa tus 7 Días Gratis</h1>
          <p className="text-sm text-gray-500">
            Hemos preparado tu ruta metabólica para <b className="text-gray-800">{email || 'tu cuenta'}</b>. Comienza hoy sin costo y elige tu plan de transformación para cuando finalice la prueba:
          </p>
        </div>

        {/* Tarjetas de Selección */}
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
                <span className="text-xl md:text-2xl font-black text-indigo-600">{plan.price}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
          <p className="text-xs text-blue-800 font-medium">
            💡 <b>No se te cobrará nada hoy.</b> Tendrás 7 días de acceso total gratuito. Si decides no continuar, puedes cancelar en cualquier momento antes de que termine el periodo de prueba.
          </p>
        </div>

        <button 
          onClick={handleCheckout}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg text-base flex items-center justify-center gap-2"
        >
          {loading ? 'Procesando suscripción segura...' : 'Comenzar mis 7 Días Gratis 🔒'}
        </button>

        <div className="text-center space-y-1">
          <p className="text-xs text-gray-400">🔒 Pago 100% seguro cifrado por SSL • Cancela en cualquier momento</p>
        </div>

      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-500">Cargando planes...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}



