'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react'; // Importación clave de NextAuth

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Utilizamos NextAuth para manejar la autenticación segura
      const res = await signIn('credentials', {
        redirect: false, // Evitamos que NextAuth recargue la página automáticamente
        email,
        password,
      });

      if (res?.error) {
        alert('Error: Credenciales incorrectas. Verifica tu correo y contraseña.');
      } else if (res?.ok) {
        // Si el login es exitoso, NextAuth ya creó la cookie de sesión.
        // Ahora sí redirigimos al dashboard.
        router.push(`/dashboard?email=${encodeURIComponent(email)}`);
      }
    } catch (err: any) {
      alert('Error de conexión: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-black text-gray-900">Iniciar Sesión</h1>
          <p className="text-sm text-gray-500 mt-1">Accede a tu panel de ayuno y métricas</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Correo electrónico</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:border-indigo-600 outline-none"
              placeholder="tu@correo.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Contraseña</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:border-indigo-600 outline-none"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-md disabled:opacity-50"
          >
            {loading ? 'Validando credenciales...' : 'Entrar al Panel'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          ¿No tienes cuenta? <a href="/register" className="text-indigo-600 font-bold hover:underline">Regístrate</a>
        </p>
      </div>
    </div>
  );
}
