'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react'; // Importación clave para el auto-login

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';
  const planParam = searchParams.get('plan') || '4weeks'; // Capturamos el plan de la URL

  const [email, setEmail] = useState(emailParam);
  const [password, setPassword] = useState('');
  const [plan] = useState(planParam);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Detectamos la zona horaria local del navegador del usuario
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    try {
      // 1. Creamos el usuario enviando también el plan seleccionado
      const res = await fetch('/api/register', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          timezone: userTimezone,
          plan // <-- Enviamos el plan al backend para guardarlo correctamente
        })
      });
      const data = await res.json();

      if (data.success) {
        // 2. AUTO-LOGIN: Generamos la sesión segura de NextAuth silenciosamente
        const signInRes = await signIn('credentials', {
          redirect: false,
          email,
          password
        });

        if (signInRes?.error) {
          // Si por alguna razón falla el login automático, lo enviamos al login manual
          alert('Cuenta creada con éxito, pero debes iniciar sesión.');
          router.push('/login');
        } else {
          // 3. Redirigimos al dashboard con la sesión ya activa
          router.push(`/dashboard?email=${encodeURIComponent(email)}&success=true`);
        }
      } else {
        alert('Error en el registro: ' + data.error);
      }
    } catch (err: any) {
      alert('Error de red: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Último Paso</span>
          <h1 className="text-2xl font-black text-gray-900 mt-2">Protege tu Cuenta</h1>
          <p className="text-sm text-gray-500 mt-1">Crea una contraseña para asegurar tu plan y acceder cuando quieras.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Correo electrónico</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:border-green-600 outline-none bg-gray-50"
              placeholder="tu@correo.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Crea una Contraseña</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:border-green-600 outline-none"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-all shadow-md disabled:opacity-50"
          >
            {loading ? 'Configurando seguridad...' : 'Activar mi Plan y Entrar 🚀'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          ¿Ya tienes cuenta? <a href="/login" className="text-green-600 font-bold hover:underline">Inicia sesión</a>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Cargando registro...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
