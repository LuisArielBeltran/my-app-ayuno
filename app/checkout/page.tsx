'use client';
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [loading, setLoading] = useState(false);

  const handleSimulatePayment = () => {
    setLoading(true);
    // Aquí integrarías Stripe o tu pasarela de pago real. 
    // Al completarse el pago con éxito, lo mandamos a registrar su contraseña.
    setTimeout(() => {
      router.push(`/register?email=${encodeURIComponent(email)}&success=paid`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 space-y-6 text-center">
        <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Plan Personalizado Listo</span>
        <h1 className="text-2xl font-black text-gray-900">Activa tu Suscripción</h1>
        <p className="text-sm text-gray-500">
          Hemos procesado tus respuestas para <b className="text-gray-800">{email || 'tu cuenta'}</b>. Desbloquea tu plan completo de ayuno por solo <b>$19.99/mes</b>.
        </p>

        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl text-left space-y-2">
          <div className="flex justify-between text-sm font-semibold text-gray-700">
            <span>Plan Ayuno Intermitente Pro</span>
            <span>$19.99</span>
          </div>
          <p className="text-xs text-gray-500">Acceso ilimitado al cronómetro, coach, validador de alimentos y gráficas corporales.</p>
        </div>

        <button 
          onClick={handleSimulatePayment}
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg text-lg"
        >
          {loading ? 'Procesando pago seguro...' : 'Pagar Plan y Crear Contraseña 🔒'}
        </button>

        <p className="text-xs text-gray-400">Pago 100% seguro cifrado por SSL.</p>
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
