'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import RecipeGuide from '@/components/RecipeGuide';
import FoodAnalyzer from '@/components/FoodAnalyzer';

function DashboardContent() {
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get('success');
  const userEmail = searchParams.get('email') || 'usuario@ayuno.com';

  // Estados interactivos para el cronómetro y el agua
  const [isFasting, setIsFasting] = useState(false);
  const [fastingSeconds, setFastingSeconds] = useState(0);
  const [targetHours, setTargetHours] = useState<number>(16);
  const [waterGlasses, setWaterGlasses] = useState(3);
  const [fastingStreak, setFastingStreak] = useState(3);

  // Estados para el Validador de Alimentos
  const [searchTerm, setSearchTerm] = useState('');
  const [foodResults, setFoodResults] = useState<any[]>([]);
  const [loadingFood, setLoadingFood] = useState(false);

  // Estado del Coach Metabólico (Ahora en tiempo real)
  const [currentTip, setCurrentTip] = useState<{phase: string, title: string, content: string} | null>(null);

  // Estados de Seguimiento de Peso y Metas
  const [weightHistory, setWeightHistory] = useState<any[]>([]);
  const [targetWeight, setTargetWeight] = useState<number | null>(null);
  const [newWeightInput, setNewWeightInput] = useState('');
  const [submittingWeight, setSubmittingWeight] = useState(false);

  // NUEVO: Estado de Celebración de Meta
  const [goalReached, setGoalReached] = useState(false);

  // 1. Cargar el estado real del ayuno y peso desde la Base de Datos
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const fastingRes = await fetch(`/api/fasting/state?email=${encodeURIComponent(userEmail)}`);
        const fastingData = await fastingRes.json();
        if (fastingData.success && fastingData.fasting.is_fasting && fastingData.fasting.start_time) {
          setIsFasting(true);
          if (fastingData.fasting.target_hours) {
            setTargetHours(fastingData.fasting.target_hours);
          }
          const start = new Date(fastingData.fasting.start_time).getTime();
          const now = new Date().getTime();
          const elapsedSeconds = Math.floor((now - start) / 1000);
          setFastingSeconds(elapsedSeconds > 0 ? elapsedSeconds : 0);
        }

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

  // 2. Lógica del Cronómetro de Ayuno
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

  // 3. Cerebro del Coach Metabólico (En tiempo real)
  useEffect(() => {
    if (!isFasting) {
      setCurrentTip({
        phase: "Preparación",
        title: "Listo para comenzar",
        content: "Elige tu meta de ayuno en el cronómetro y presiona iniciar. Mantén una botella de agua cerca para controlar los antojos."
      });
      return;
    }

    const hours = fastingSeconds / 3600;
    
    if (hours >= targetHours) {
      if (targetHours >= 16) {
        setCurrentTip({ phase: "¡Meta Cumplida! 🎉", title: "Zona de Cetosis y Autofagia", content: "¡Meta alcanzada! Aquí es donde ocurre la magia de la limpieza celular y la máxima optimización metabólica. Puedes romper el ayuno cuando lo desees." });
      } else if (targetHours >= 14) {
        setCurrentTip({ phase: "¡Meta Cumplida! 🎉", title: "Zona de Cetosis Temprana", content: "¡Meta alcanzada! Tu cuerpo ya está quemando grasa como energía y mejorando tu claridad mental. Gran trabajo." });
      } else {
        setCurrentTip({ phase: "¡Meta Cumplida! 🎉", title: "Zona de Descanso Digestivo", content: "¡Meta alcanzada! Tu insulina se ha regulado y tu sistema digestivo ha descansado por completo." });
      }
      return;
    }

    if (hours < 2) setCurrentTip({ phase: "Fase 1 (0-2h)", title: "Nivelando Azúcar", content: "Tu cuerpo está procesando tu última comida. Los niveles de insulina comienzan a estabilizarse." });
    else if (hours < 8) setCurrentTip({ phase: "Fase 2 (2-8h)", title: "El cuerpo se prepara", content: "Tu sistema digestivo descansa. El azúcar en sangre baja y tu cuerpo busca reservas de energía." });
    else if (hours < 10) setCurrentTip({ phase: "Fase 3 (8-10h)", title: "Agotando el Glucógeno", content: "Las reservas de azúcar en tu hígado se están acabando. Pronto entrarás en modo 'quema de grasa'." });
    else if (hours < 12) setCurrentTip({ phase: "Fase 4 (10-12h)", title: "Activación Metabólica", content: "¡El cambio ha comenzado! Tu cuerpo empieza a liberar grasa almacenada para usarla como energía." });
    else if (hours < 14) setCurrentTip({ phase: "Fase 5 (12-14h)", title: "Produciendo Cetonas", content: "Tu hígado produce cetonas. Sentirás más claridad mental y tu hambre comenzará a desaparecer." });
    else if (hours < 16) setCurrentTip({ phase: "Fase 6 (14-16h)", title: "Pico de Quema de Grasa", content: "Estás utilizando grasa como combustible principal. ¡Sigue así!" });
    else if (hours < 18) setCurrentTip({ phase: "Fase 7 (16-18h)", title: "Inicio de Autofagia", content: "Tus células comienzan a 'reciclar' componentes viejos o dañados. Es el inicio del antienvejecimiento." });
    else setCurrentTip({ phase: "Fase 8 (18h+)", title: "Regeneración Máxima", content: "Autofagia profunda. Tienes máxima limpieza celular y reducción de la inflamación." });
  }, [fastingSeconds, targetHours, isFasting]);

  // 4. Búsqueda inteligente de alimentos
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

  // NUEVO 5. Evaluar si se alcanzó el peso meta
  useEffect(() => {
    if (weightHistory.length > 0 && targetWeight !== null) {
      const initialWeight = Number(weightHistory[0].weight_kg);
      const currentW = Number(weightHistory[weightHistory.length - 1].weight_kg);

      if (initialWeight > targetWeight && currentW <= targetWeight) {
        setGoalReached(true);
      } else if (initialWeight < targetWeight && currentW >= targetWeight) {
        setGoalReached(true);
      } else if (initialWeight === targetWeight && currentW === targetWeight) {
        setGoalReached(true);
      } else {
        setGoalReached(false);
      }
    }
  }, [weightHistory, targetWeight]);

  const formatFastingTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const toggleFasting = async () => {
    const newFastingState = !isFasting;
    try {
      const res = await fetch('/api/fasting/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, is_fasting: newFastingState, target_hours: targetHours })
      });
      const data = await res.json();
      if (data.success) {
        setIsFasting(newFastingState);
        if (newFastingState) {
          setFastingSeconds(0);
        } else {
          if (fastingSeconds >= 12 * 3600) {
            setFastingStreak((prev) => prev + 1);
          }
        }
      }
    } catch (err) {
      console.error('Error al actualizar estado de ayuno:', err);
    }
  };

  const handleAddWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeightInput) return;

    const sanitized = newWeightInput.replace(',', '.').trim();
    const weightNum = parseFloat(sanitized);

    if (isNaN(weightNum)) {
      alert('Por favor introduce un número válido.');
      return;
    }
    if (weightNum < 30 || weightNum > 300) {
      alert('El peso ingresado está fuera de los límites normales (debe estar entre 30 kg y 300 kg).');
      return;
    }

    setSubmittingWeight(true);
    try {
      const res = await fetch('/api/weight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, weight_kg: newWeightInput })
      });
      const data = await res.json();
      
      if (data.success) {
        setWeightHistory((prev) => [...prev, data.log]);
        setNewWeightInput('');
      } else {
        alert('Error al guardar el peso: ' + (data.error || 'Desconocido'));
      }
    } catch (err: any) {
      console.error('Error guardando peso:', err);
      alert('Error de conexión al registrar peso: ' + err.message);
    } finally {
      setSubmittingWeight(false);
    }
  };

  const addWaterGlass = () => setWaterGlasses((prev) => prev + 1);
  const currentWeight = weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].weight_kg : 'Sin registros';

  const renderWeightChart = () => {
    if (weightHistory.length === 0) return null;

    const weights = weightHistory.map((w: any) => Number(w.weight_kg));
    const minW = Math.min(...weights, targetWeight || Math.min(...weights)) - 2;
    const maxW = Math.max(...weights, targetWeight || Math.max(...weights)) + 2;
    const range = maxW - minW || 1;
    const width = 500;
    const height = 160;
    const padding = 20;

    const points = weightHistory.map((w: any, index: number) => {
      const x = padding + (index / (weightHistory.length === 1 ? 1 : weightHistory.length - 1)) * (width - padding * 2);
      const y = height - padding - ((Number(w.weight_kg) - minW) / range) * (height - padding * 2);
      return { x, y, weight: w.weight_kg, date: new Date(w.log_date).toLocaleDateString() };
    });

    const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');

    return (
      <div className="mt-4 bg-white p-4 rounded-xl border border-purple-100 shadow-sm">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Tendencia de Progreso Corporal</span>
        <div className="w-full overflow-x-auto">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-36 overflow-visible">
            {targetWeight && (
              <line 
                x1={padding} 
                y1={height - padding - ((targetWeight - minW) / range) * (height - padding * 2)} 
                x2={width - padding} 
                y2={height - padding - ((targetWeight - minW) / range) * (height - padding * 2)} 
                stroke="#10b981" 
                strokeDasharray="4 4" 
                strokeWidth="1.5" 
              />
            )}
            {points.length > 1 && (
              <polyline fill="none" stroke="#7c3aed" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={polylinePoints} />
            )}
            {points.map((p, idx) => (
              <g key={idx}>
                <circle cx={p.x} cy={p.y} r="5" fill="#7c3aed" className="transition-all hover:scale-125" />
                <text x={p.x} y={p.y - 10} textAnchor="middle" className="text-[10px] fill-gray-700 font-bold">{p.weight}kg</text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden p-6 md:p-8 space-y-6">
      
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

      {currentTip && (
        <div className={`border p-6 rounded-2xl shadow-sm transition-all ${currentTip.phase.includes('Meta Cumplida') ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200' : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">💡</span>
            <span className={`text-xs font-bold uppercase tracking-wider ${currentTip.phase.includes('Meta Cumplida') ? 'text-emerald-800' : 'text-amber-800'}`}>
              Coach Metabólico • {currentTip.phase}
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">{currentTip.title}</h3>
          <p className="text-sm text-gray-700 leading-relaxed">{currentTip.content}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Tarjeta de Cronómetro Interactiva */}
        <div className={`border p-6 rounded-2xl flex flex-col justify-between transition-all ${isFasting ? 'bg-indigo-900 text-white border-indigo-900 shadow-lg' : 'bg-indigo-50 border-indigo-100 text-gray-900'}`}>
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className={`text-xs font-bold uppercase tracking-wider ${isFasting ? 'text-indigo-300' : 'text-indigo-600'}`}>
                {isFasting ? '🔥 Ayuno en Curso' : 'Control activo'}
              </span>
              <span className="text-xs bg-indigo-500/20 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                ⚡ Racha: {fastingStreak} días
              </span>
            </div>
            <h3 className="text-xl font-bold mb-2">Cronómetro de Ayuno</h3>
            
            {isFasting ? (
              <div className="my-4 text-center">
                <span className="text-4xl font-black font-mono tracking-wider">{formatFastingTime(fastingSeconds)}</span>
                <p className="text-xs text-indigo-200 mt-1">Meta actual: {targetHours} horas</p>
                {fastingSeconds >= targetHours * 3600 && (
                  <p className="text-xs text-emerald-400 font-bold mt-2 animate-pulse">¡Meta completada!</p>
                )}
              </div>
            ) : (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-3">Lleva el control estricto de tus ventanas de ayuno y alimentación.</p>
                <label className="block text-xs font-bold text-indigo-700 uppercase mb-1">Elige tu plan de hoy:</label>
                <select 
                  value={targetHours}
                  onChange={(e) => setTargetHours(Number(e.target.value))}
                  className="w-full p-3 border border-indigo-200 rounded-xl text-sm focus:border-indigo-600 outline-none bg-white text-gray-800 shadow-sm font-medium"
                >
                  <option value={12}>12/12 - Principiante (12h)</option>
                  <option value={14}>14/10 - Intermedio (14h)</option>
                  <option value={16}>16/8 - Clásico / Pro (16h)</option>
                  <option value={18}>18/6 - Avanzado (18h)</option>
                  <option value={20}>20/4 - Dieta Guerrero (20h)</option>
                  <option value={24}>24h - Desintoxicación (OMAD)</option>
                </select>
              </div>
            )}
          </div>

          <button 
            onClick={toggleFasting}
            className={`w-full font-bold py-3 px-4 rounded-xl transition-all text-center shadow-md ${isFasting ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white mt-2'}`}
          >
            {isFasting ? 'Romper Ayuno / Finalizar' : 'Iniciar Ayuno'}
          </button>
        </div>

        {/* Tarjeta de Hidratación */}
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

      {/* Módulo de Seguimiento de Peso */}
      <div className="bg-purple-50 border border-purple-100 p-6 rounded-2xl">
        
        {goalReached && (
          <div className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 p-1 rounded-2xl mb-6 shadow-xl animate-bounce-slight transition-all">
            <div className="bg-white px-6 py-8 rounded-xl text-center">
              <span className="text-6xl block mb-4">🏆</span>
              <h2 className="text-2xl font-black text-gray-900 mb-2">¡Misión Cumplida!</h2>
              <p className="text-gray-700 font-medium">
                Has alcanzado tu peso meta de <span className="font-black text-yellow-600">{targetWeight} kg</span>. Todo tu esfuerzo, constancia y disciplina han dado sus frutos. ¡Felicidades, eres una inspiración!
              </p>
            </div>
          </div>
        )}

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
              type="text" 
              inputMode="decimal"
              placeholder="Ej. 70,5 o 70.5"
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
          <div className="text-xs text-gray-500 flex items-center justify-between bg-white/60 p-3 rounded-xl mb-2">
            <span>Total de registros: <b>{weightHistory.length}</b></span>
            <span>Último registro: {new Date(weightHistory[weightHistory.length - 1].log_date).toLocaleDateString()}</span>
          </div>
        )}

        {renderWeightChart()}
      </div>

      {/* Validador de Alimentos */}
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

      {/* MÓDULO DE IA POR FOTOGRAFÍA (NUEVO) */}
      <FoodAnalyzer />

      {/* Guía de Recetas Rotativas */}
      <RecipeGuide />

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
