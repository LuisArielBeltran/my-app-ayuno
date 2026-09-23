'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function DashboardContent() {
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get('success');
  const userEmail = searchParams.get('email') || 'usuario@ayuno.com'; // Email de referencia

  // Estados interactivos para el cronómetro y el agua
  const [isFasting, setIsFasting] = useState(false);
  const [fastingSeconds, setFastingSeconds] = useState(0);
  const [waterGlasses, setWaterGlasses] = useState(3);

  // Estados para el Validador de Alimentos
  const [searchTerm, setSearchTerm] = useState('');
  const [foodResults, setFoodResults] = useState<any[]>([]);
  const [loadingFood, setLoadingFood] = useState(false);

  // Estado del Coach Metabólico
  const [currentTip, setCurrentTip] = useState<any>(null);

  // Estados de Seguimiento de Peso y Metas
  const [weightHistory, setWeightHistory] = useState<any[]>([]);
  const [targetWeight, setTargetWeight] = useState<number | null>(null);
  const [newWeightInput, setNewWeightInput] = useState('');
  const [submittingWeight, setSubmittingWeight] = useState(false);

  // Cargar el estado real del ayuno y peso desde Railway al iniciar
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // 1. Estado del ayuno
        const fastingRes = await fetch(`/api/fasting/state?email=${encodeURIComponent(userEmail)}`);
        const fastingData = await fastingRes.json();
        if (fastingData.success && fastingData.fasting.is_fasting && fastingData.fasting.start_time) {
          setIsFasting(true);
          const start = new Date(fastingData.fasting.start_time).getTime();
          const now = new Date().getTime();
          const elapsedSeconds = Math.floor((now - start) / 1000);
          setFastingSeconds(elapsedSeconds > 0 ? elapsedSeconds : 0);
        }

        // 2. Historial de peso y metas
        const weightRes = await fetch(`/api/weight?email=${encodeURIComponent(userEmail)}`);
        const weightData = await weightRes.json();
        if (weightData.success) {
          setWeightHistory(weightData.weights);
          setTargetWeight(weightData.target_weight);
        }
      } catch (err) {
        console.error('Error al cargar datos iniciales:', err);
      }
    };

    fetchInitialData();
  }, [userEmail]);

  // Lógica del Cronómetro de Ayuno
  useEffect(() => {
    let interval: any = null;
    if (isFasting) {
      interval = setInterval(() => {
        setFastingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isFasting]);

  // Obtener consejo de coaching según las horas actuales de ayuno
  useEffect(() => {
    const fetchCoachingTip = async () => {
      const currentHours = Math.floor(fastingSeconds / 3600);
      try {
        const res = await fetch(`/api/coaching/tips?hours=${currentHours}`);
        const data = await res.json();
        if (data.success && data.tip) {
          setCurrentTip(data.tip);
        }
      } catch (err) {
        console.error('Error obteniendo tip de coaching:', err);
      }
    };

    fetchCoachingTip();
  }, [fastingSeconds]);

  // Búsqueda inteligente de alimentos en la API con debounce
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (!searchTerm.trim()) {
        setFoodResults([]);
        setLoadingFood(false);
        return;
      }

      setLoadingFood(true);
      try {
        const res = await fetch(`/api/food/search?q=${encodeURIComponent(searchTerm)}`);
        const data = await res.json();
        if (data.success) {
          setFoodResults(data.results);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingFood(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const formatFastingTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Sincronizar el cambio de estado del ayuno con Railway
  const toggleFasting = async () => {
    const newFastingState = !isFasting;
    
    try {
      const res = await fetch('/api/fasting/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, is_fasting: newFastingState, target_hours: 16 })
      });
      const data = await res.json();

      if (data.success) {
        setIsFasting(newFastingState);
        if (newFastingState) {
          setFastingSeconds(0);
        }
      }
    } catch (err) {
      console.error('Error al actualizar estado de ayuno:', err);
    }
  };

  // Guardar nuevo registro de peso con manejo de errores visible
  const handleAddWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeightInput || isNaN(Number(newWeightInput))) return;

    setSubmittingWeight(true);
    try {
      const res = await fetch('/api/weight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, weight_kg: parseFloat(newWeightInput) })
      });
      const data = await res.json();
      
      if (data.success) {
        setWeightHistory((prev) => [...prev, data.log]);
        setNewWeightInput('');
      } else {
        alert('Error al guardar el peso: ' + (data.error || 'Desconocido'));
        console.error('Detalle del error:', data);
      }
    } catch (err: any) {
      console.error('Error guardando peso:', err);
      alert('Error de conexión al registrar peso: ' + err.message);
    } finally {
      setSubmittingWeight(false);
    }
  };

  const addWaterGlass = () => {
    setWaterGlasses((prev) => prev + 1);
  };

  const currentWeight = weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].weight_kg : 'Sin registros';

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden p-6 md:p-8 space-y-6">
      
      {/* Banner de éxito si viene de la compra */}
      {isSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-center animate-fade-in">
          <span className="font-bold block text-lg mb-1">¡🎉 Plan Activado con Éxito!</span>
          <p className="text-sm">Tu programa personalizado de ayuno intermitente está listo.</p>
        </div>
      )}

      <div className="text-center">
        <h1 className="text-3xl font-black text-gray-900">Panel Principal & Coach</h1>
        <p className="text-gray-500 mt-1">Monitorea tus avances metabólicos y resuelve tus dudas al instante.</p>
      </div>

      {/* Tarjeta Dinámica del Coach Metabólico */}
      {currentTip && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">💡</span>
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Coach Metabólico • Fase actual</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">{currentTip.title}</h3>
          <p className="text-sm text-gray-700 leading-relaxed">{currentTip.content}</p>
        </div>
      )}

      {/* Grid de opciones principales (Cronómetro e Hidratación) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Tarjeta de Cronómetro Interactiva */}
        <div className={`border p-6 rounded-2xl flex flex-col justify-between transition-all ${isFasting ? 'bg-indigo-900 text-white border-indigo-900 shadow-lg' : 'bg-indigo-50 border-indigo-100 text-gray-900'}`}>
          <div>
            <span className={`text-xs font-bold uppercase tracking-wider block mb-1 ${isFasting ? 'text-indigo-300' : 'text-indigo-600'}`}>
              {isFasting ? '🔥 Ayuno en Curso' : 'Control activo'}
            </span>
            <h3 className="text-xl font-bold mb-2">Cronómetro de Ayuno</h3>
            
            {isFasting ? (
              <div className="my-4 text-center">
                <span className="text-4xl font-black font-mono tracking-wider">{formatFastingTime(fastingSeconds)}</span>
                <p className="text-xs text-indigo-200 mt-1">Meta recomendada: 16 horas</p>
              </div>
            ) : (
              <p className="text-sm text-gray-600 mb-4">Lleva el control estricto de tus ventanas de ayuno y alimentación.</p>
            )}
          </div>

          <button 
            onClick={toggleFasting}
            className={`w-full font-bold py-3 px-4 rounded-xl transition-all text-center shadow-md ${isFasting ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
          >
            {isFasting ? 'Romper Ayuno / Finalizar' : 'Iniciar Ayuno'}
          </button>
        </div>

        {/* Tarjeta de Hidratación Interactiva */}
        <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1">Hidratación</span>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Registro de Agua</h3>
            <div className="my-3 flex items-center justify-between bg-white/80 p-3 rounded-xl border border-blue-100">
              <span className="text-sm font-semibold text-gray-600">Vasos hoy:</span>
              <span className="text-2xl font-black text-blue-600">{waterGlasses} <span className="text-xs font-normal text-gray-400">/ 8 vasos</span></span>
            </div>
          </div>
          <button 
            onClick={addWaterGlass}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all text-center shadow-md"
          >
            + Registrar Vaso de Agua 💧
          </button>
        </div>

      </div>

      {/* Módulo de Seguimiento de Peso y Metas */}
      <div className="bg-purple-50 border border-purple-100 p-6 rounded-2xl">
        <div className="flex justify-between items-center mb-4">
          <div>
            <span className="text-xs font-bold text-purple-600 uppercase tracking-wider block mb-1">Evolución Corporal</span>
            <h3 className="text-xl font-bold text-gray-900">Seguimiento de Peso & Metas</h3>
          </div>
          {targetWeight && (
            <div className="text-right bg-white px-4 py-2 rounded-xl border border-purple-200 shadow-sm">
              <span className="text-xs text-gray-500 block">Meta Objetivo</span>
              <span className="text-lg font-black text-purple-700">{targetWeight} kg</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-white p-4 rounded-xl border border-purple-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-600">Peso Actual:</span>
            <span className="text-2xl font-black text-purple-900">{currentWeight} {currentWeight !== 'Sin registros' && 'kg'}</span>
          </div>

          <form onSubmit={handleAddWeight} className="flex gap-2">
            <input 
              type="number" 
              step="0.1" 
              placeholder="Nuevo peso (kg)"
              value={newWeightInput}
              onChange={(e) => setNewWeightInput(e.target.value)}
              className="w-full p-3 border border-purple-200 rounded-xl text-sm focus:border-purple-600 outline-none bg-white"
            />
            <button 
              type="submit"
              disabled={submittingWeight}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-3 rounded-xl text-sm transition-all shadow-md whitespace-nowrap"
            >
              {submittingWeight ? 'Guardando...' : 'Registrar'}
            </button>
          </form>
        </div>

        {weightHistory.length > 0 && (
          <div className="text-xs text-gray-500 flex items-center justify-between bg-white/60 p-3 rounded-xl">
            <span>Total de registros: <b>{weightHistory.length}</b></span>
            <span>Último registro: {new Date(weightHistory[weightHistory.length - 1].log_date).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {/* Validador de Alimentos / Buscador Regional */}
      <div className="bg-gray-50 border border-gray-200 p-6 rounded-2xl">
        <h3 className="text-xl font-bold text-gray-900 mb-1">🔍 Validador de Alimentos</h3>
        <p className="text-sm text-gray-500 mb-4">Escribe cualquier producto (ej: mate, panela, cortado, café con leche) para saber si rompe tu ayuno.</p>
        
        <input 
          type="text"
          placeholder="Busca un alimento, bebida o término regional..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-4 border-2 border-gray-200 rounded-xl text-base focus:border-indigo-600 focus:ring-0 outline-none bg-white transition-all mb-4"
        />

        {loadingFood ? (
          <p className="text-center text-sm text-gray-400 py-4">Buscando en la base de datos...</p>
        ) : (
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {foodResults.length === 0 && searchTerm.trim() !== '' ? (
              <p className="text-center text-sm text-gray-400 py-4">No se encontró ese producto. ¡Prueba con otro término!</p>
            ) : foodResults.length === 0 ? null : (
              foodResults.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-200 flex items-start justify-between gap-4 shadow-sm">
                  <div>
                    <h4 className="font-bold text-gray-900">{item.food_name}</h4>
                    <p className="text-xs text-gray-600 mt-1">{item.explanation}</p>
                  </div>
                  <div>
                    {item.breaks_fast ? (
                      <span className="bg-rose-100 text-rose-700 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                        ❌ Rompe el ayuno
                      </span>
                    ) : (
                      <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                        ✅ Permitido
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Estado del Plan */}
      <div className="bg-gray-50 border border-gray-200 p-4 rounded-2xl text-center">
        <p className="text-sm text-emerald-600 font-semibold">Plan Personalizado Activo ✓</p>
      </div>

    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <Suspense fallback={<div className="text-center py-20 text-gray-500">Cargando panel...</div>}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
