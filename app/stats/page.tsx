'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function StatsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userEmail = searchParams.get('email') || '';

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!userEmail) return;
      try {
        const weightRes = await fetch(`/api/weight?email=${encodeURIComponent(userEmail)}`);
        const weightData = await weightRes.json();
        
        setStats({
          weights: weightData.success ? weightData.weights : [],
          targetWeight: weightData.target_weight || 0,
        });
      } catch (err) {
        console.error('Error cargando estadísticas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userEmail]);

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-all"
        >
          ← Volver al Panel
        </button>
        <h1 className="text-xl font-black text-gray-900">Estadísticas y Hábitos</h1>
      </div>

      <div className="text-center py-4">
        <span className="text-4xl">📊</span>
        <h2 className="text-2xl font-black text-gray-900 mt-2">Tu Progreso en TIENES EL CONTROL</h2>
        <p className="text-sm text-gray-500 mt-1">Análisis detallado de tu constancia, hábitos y evolución metabólica.</p>
      </div>

      {loading ? (
        <p className="text-center text-gray-500 py-10">Cargando estadísticas...</p>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl text-center">
              <span className="text-xs font-bold text-indigo-600 uppercase">Registros de Peso</span>
              <p className="text-2xl font-black text-indigo-900 mt-1">{stats?.weights?.length || 0}</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-center">
              <span className="text-xs font-bold text-emerald-600 uppercase">Peso Objetivo</span>
              <p className="text-2xl font-black text-emerald-900 mt-1">{stats?.targetWeight ? `${stats.targetWeight} kg` : 'No definido'}</p>
            </div>
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl text-center">
              <span className="text-xs font-bold text-blue-600 uppercase">Estado del Plan</span>
              <p className="text-2xl font-black text-blue-900 mt-1">Activo ✓</p>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 p-6 rounded-2xl">
            <h3 className="font-bold text-gray-900 mb-2">💡 Resumen de Hábitos</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Mantén una constancia firme en tus ventanas de ayuno y asegura una correcta hidratación diaria para potenciar la autofagia y la salud metabólica.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StatsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <Suspense fallback={<div className="text-center py-20 text-gray-500">Cargando estadísticas...</div>}>
        <StatsContent />
      </Suspense>
    </div>
  );
}
