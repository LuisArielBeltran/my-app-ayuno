'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlEmail = searchParams.get('email') || '';

  const [selectedPlan, setSelectedPlan] = useState('4'); // 4 Semanas seleccionado por defecto
  const [email, setEmail] = useState(urlEmail);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Recupera el correo del usuario si ya lo ingresó en los pasos anteriores o lo lee de la URL
  useEffect(() => {
    const savedEmail = localStorage.getItem('user_email');
    if (savedEmail && !email) setEmail(savedEmail);
  }, [email]);

  const handleCheckoutAndRegister = async () => {
    if (!email || !password) {
      alert('Por favor, ingresa tu correo y crea una contraseña para asegurar tu cuenta.');
      return;
    }
    
    setLoading(true);
    
    try {
      // 1. Asignar la contraseña en la base de datos
      const regRes = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const regData = await regRes.json();

      if (!regRes.ok && regData.error !== 'El usuario ya está registrado. Por favor, inicia sesión.') {
        alert(regData.error);
        setLoading(false);
        return;
      }

      // 2. Proceder a la pasarela de pago (Mercado Pago)
      const payRes = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan }),
      });
      const payData = await payRes.json();
      
      if (payData.init_point) {
        localStorage.setItem('user_email', email); // Asegura que se mantenga la sesión
        window.location.href = payData.init_point;
      } else {
        alert('Hubo un problema al iniciar el pago. Inténtalo de nuevo.');
      }
    } catch (error) {
      console.error(error);
      alert('Ocurrió un error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl overflow-hidden p-6 md:p-8">
        
        {/* Cabecera del Diagnóstico */}
        <div className="text-center mb-8">
          <span className="text-sm font-bold text-emerald-600 uppercase tracking-widest block mb-1">Diagnóstico Analizado ✓</span>
          <h1 className="text-2xl font-black text-gray-900 leading-tight">Elige tu Plan de Transformación</h1>
          <p className="text-sm text-gray-500 mt-3 leading-relaxed">
            Hemos preparado tu ruta metabólica para <strong className="text-indigo-600">{email || 'ti'}</strong>. Selecciona la duración ideal para alcanzar tu meta:
          </p>
        </div>

        {/* Tarjetas de Precios y Planes */}
        <div className="space-y-4 mb-8">
          
          {/* Plan 1 Semana */}
          <div 
            onClick={() => setSelectedPlan('1')}
            className={`cursor-pointer border-2 rounded-2xl p-4 transition-all ${selectedPlan === '1' ? 'border-indigo-600 bg-indigo-50/50 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-lg font-bold text-gray-900">Plan 1 Semana</span>
              <span className="text-xl font-black text-indigo-600">$6.99</span>
            </div>
            <p className="text-xs text-gray-500 font-medium"><strong>7 días gratis.</strong> Ideal para probar el método y ver tus primeros cambios metabólicos.</p>
          </div>

          {/* Plan 4 Semanas */}
          <div 
            onClick={() => setSelectedPlan('4')}
            className={`cursor-pointer border-2 rounded-2xl p-4 transition-all relative ${selectedPlan === '4' ? 'border-indigo-600 bg-indigo-50/50 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
          >
            <span className="absolute -top-3 left-4 bg-amber-400 text-amber-900 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
              Más Vendido ⭐
            </span>
            <div className="flex justify-between items-center mb-1 mt-1">
              <span className="text-lg font-bold text-gray-900">Plan 4 Semanas</span>
              <span className="text-xl font-black text-indigo-600">$19.99</span>
            </div>
            <p className="text-xs text-gray-500 font-medium"><strong>7 días gratis.</strong> El programa más popular para adquirir el hábito y perder peso de forma saludable.</p>
          </div>

          {/* Plan 12 Semanas */}
          <div 
            onClick={() => setSelectedPlan('12')}
            className={`cursor-pointer border-2 rounded-2xl p-4 transition-all relative ${selectedPlan === '12' ? 'border-indigo-600 bg-indigo-50/50 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
          >
            <span className="absolute -top-3 left-4 bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
              Ahorra 50% 🚀
            </span>
            <div className="flex justify-between items-center mb-1 mt-1">
              <span className="text-lg font-bold text-gray-900">Plan 12 Semanas</span>
              <span className="text-xl font-black text-indigo-600">$39.99</span>
            </div>
            <p className="text-xs text-gray-500 font-medium"><strong>7 días gratis.</strong> Transformación total, cambio metabólico profundo y acceso a guías avanzadas.</p>
          </div>
        </div>

        {/* Módulo de Seguridad (Creación de Contraseña) */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-6">
          <h3 className="text-md font-bold text-gray-900 mb-1">Último Paso: Protege tu Cuenta</h3>
          <p className="text-xs text-gray-500 mb-4">Crea una contraseña para asegurar tu plan y acceder cuando quieras.</p>
          
          <div className="space-y-3">
            <input 
              type="email" 
              placeholder="Correo electrónico" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-sm p-3.5 border border-gray-300 rounded-xl outline-none focus:border-indigo-600 bg-white"
            />
            <input 
              type="password" 
              placeholder="Crea una Contraseña" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-sm p-3.5 border border-gray-300 rounded-xl outline-none focus:border-indigo-600 bg-white"
            />
          </div>
        </div>

        {/* Botón Principal y Footer */}
        <button 
          onClick={handleCheckoutAndRegister}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all mb-4 text-center disabled:opacity-50"
        >
          {loading ? 'Procesando...' : 'Activar mi Plan y Entrar 🚀'}
        </button>

        <div className="text-center">
          <p className="text-xs text-gray-400 font-medium">🔒 Pago 100% seguro cifrado por SSL</p>
          <button onClick={() => router.push('/login')} className="text-xs text-indigo-600 font-bold mt-5 hover:underline block w-full">
            ¿Ya tienes cuenta? Inicia sesión
          </button>
        </div>

      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Cargando tu plan personalizado...</div>}>
      <ResultsContent />
    </Suspense>
  );
}
