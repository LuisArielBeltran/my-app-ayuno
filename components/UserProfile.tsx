'use client';
import { useState, useEffect } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';

export default function UserProfile() {
  const { data: session, status } = useSession();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Truco maestro: Sincronizar NextAuth con el LocalStorage existente 
  // para que los demás módulos sigan funcionando sin modificar su código.
  useEffect(() => {
    if (session?.user?.email) {
      localStorage.setItem('user_email', session.user.email);
    } else if (status === 'unauthenticated') {
      localStorage.removeItem('user_email');
    }
  }, [session, status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isLogin) {
      // Proceso de Iniciar Sesión
      const res = await signIn('credentials', { redirect: false, email, password });
      if (res?.error) setError('Credenciales incorrectas');
    } else {
      // Proceso de Registrarse
      try {
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        
        if (data.error) {
          setError(data.error);
        } else {
          // Si se registra con éxito, lo logueamos automáticamente
          await signIn('credentials', { redirect: false, email, password });
        }
      } catch (err) {
        setError('Error de conexión al registrar');
      }
    }
    setLoading(false);
  };

  if (status === 'loading') {
    return <div className="text-center text-sm p-4 text-gray-500">Cargando seguridad...</div>;
  }

  // Vista cuando el usuario YA está logueado
  if (session) {
    return (
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 w-full max-w-sm mx-auto mb-6 flex justify-between items-center">
        <div>
          <p className="text-xs text-green-500 font-bold uppercase tracking-wider mb-0.5">Conectado</p>
          <p className="text-sm font-bold text-gray-800 truncate max-w-[200px]">{session.user?.email}</p>
        </div>
        <button 
          onClick={() => signOut()}
          className="text-xs bg-gray-50 text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-100 hover:text-red-600 transition-colors font-semibold"
        >
          Cerrar Sesión
        </button>
      </div>
    );
  }

  // Vista cuando el usuario debe Iniciar Sesión / Registrarse
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 w-full max-w-sm mx-auto mb-6">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-extrabold text-gray-900">{isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}</h2>
        <p className="text-xs text-gray-500 mt-1">{isLogin ? 'Ingresa para continuar tu progreso' : 'Únete a la comunidad de Mi Ayuno'}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input 
            type="email" 
            placeholder="Tu correo electrónico" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full text-sm p-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            required
          />
        </div>
        <div>
          <input 
            type="password" 
            placeholder="Tu contraseña secreta" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full text-sm p-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            required
          />
        </div>
        
        {error && <p className="text-xs text-red-500 font-bold bg-red-50 p-2 rounded-lg text-center">{error}</p>}
        
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 text-white text-sm font-bold px-4 py-3.5 rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 shadow-md"
        >
          {loading ? 'Procesando...' : (isLogin ? 'Iniciar Sesión' : 'Registrarme')}
        </button>
      </form>
      
      <div className="mt-5 text-center">
        <button 
          type="button"
          onClick={() => { setIsLogin(!isLogin); setError(''); setPassword(''); }}
          className="text-xs text-gray-500 hover:text-blue-700 font-medium transition-colors"
        >
          {isLogin ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión aquí'}
        </button>
      </div>
    </div>
  );
}
