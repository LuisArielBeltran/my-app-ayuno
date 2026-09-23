'use client';
import { useState } from 'formdata-event'; // o standard useState
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [goal, setGoal] = useState('general');
  const [gender, setGender] = useState('otro');
  const [heightCm, setHeightCm] = useState('170');
  const [weightKg, setWeightKg] = useState('70');
  const [targetWeightKg, setTargetWeightKg] = useState('65');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          goal,
          gender,
          height_cm: parseFloat(heightCm),
          weight_kg: parseFloat(weightKg),
          target_weight_kg: parseFloat(targetWeightKg)
        })
      });
      const data = await res.json();

      if (data.success) {
        router.push(`/dashboard?email=${encodeURIComponent(email)}&success=true`);
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
          <h1 className="text-2xl font-black text-gray-900">Crear Cuenta</h1>
          <p className="text-sm text-gray-500 mt-1">Comienza tu viaje de ayuno intermitente</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Peso actual (kg)</label>
              <input 
                type="number" 
                step="0.1"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:border-indigo-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Peso meta (kg)</label>
              <input 
                type="number" 
                step="0.1"
                value={targetWeightKg}
                onChange={(e) => setTargetWeightKg(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:border-indigo-600 outline-none"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-md"
          >
            {loading ? 'Registrando...' : 'Completar Registro'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          ¿Ya tienes cuenta? <a href="/login" className="text-indigo-600 font-bold hover:underline">Inicia sesión</a>
        </p>
      </div>
    </div>
  );
}
