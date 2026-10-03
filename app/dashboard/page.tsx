'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import FoodAnalyzer from '@/components/FoodAnalyzer';
import BadgesSection from '@/components/BadgesSection';
import PushNotificationBanner from '@/components/PushNotificationBanner';

// ==========================================
// COMPONENTE INTEGRADO: Coach IA Flotante
// ==========================================
function AICoachChat({ email }: { email: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: '¡Hola! Soy tu coach personal de "TIENES EL CONTROL". Estoy aquí 24/7 para resolver cualquier duda sobre tu dieta, tus porciones, el ayuno o si tienes un antojo repentino. ¿En qué te ayudo ahora? 💪' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userText = inputMessage;
    setInputMessage('');
    setMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/analyze-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userText, email })
      });

      const data = await res.json();
      const assistantReply = data.text || data.reply || "¡Aquí estoy para ayudarte!";
      
      setMessages((prev) => [...prev, { role: 'assistant', text: assistantReply }]);
      setLoading(false);

    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { 
        role: 'assistant', 
        text: 'Ups, tuve un pequeño problema de conexión, pero recuerda mantener tu hidratación alta. ¡Inténtalo de nuevo en un segundito!' 
      }]);
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white p-4 rounded-full shadow-2xl flex items-center gap-3 transition-all transform hover:scale-105 group"
        >
          <span className="text-2xl animate-bounce">🤖</span>
          <span className="font-bold text-sm tracking-wide pr-2 hidden md:inline">¿Hablamos con tu Coach?</span>
        </button>
      )}

      {isOpen && (
        <div className="bg-white w-[90vw] sm:w-[380px] h-[500px] rounded-3xl shadow-2xl border border-indigo-100 flex flex-col overflow-hidden animate-fade-in-up">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">
                🧠
              </div>
              <div>
                <h4 className="font-bold text-sm">Coach TIENES EL CONTROL</h4>
                <span className="text-[10px] text-indigo-200 flex items-center gap-1">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span> En línea 24/7
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white text-xl font-bold px-2 py-1"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl border border-gray-100 text-xs text-gray-400 animate-pulse">
                  El coach está escribiendo...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input
              type="text"
              placeholder="Pregúntale algo a tu coach..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 p-3 border border-gray-200 rounded-xl text-xs focus:border-indigo-600 outline-none bg-gray-50"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 rounded-xl text-xs font-bold transition-all shadow-md disabled:opacity-50"
            >
              Enviar
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

// ==========================================
// DASHBOARD PRINCIPAL
// ==========================================
function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get('success');

  const [userEmail, setUserEmail] = useState<string>('usuario@ayuno.com');

  useEffect(() => {
    const paramEmail = searchParams.get('email');
    const localEmail = typeof window !== 'undefined' ? localStorage.getItem('user_email') : null;
    if (paramEmail) {
      setUserEmail(paramEmail);
      localStorage.setItem('user_email', paramEmail);
    } else if (localEmail) {
      setUserEmail(localEmail);
    }
  }, [searchParams]);

  const [isFasting, setIsFasting] = useState(false);
  const [fastingSeconds, setFastingSeconds] = useState(0);
  const [targetHours, setTargetHours] = useState<number>(16);
  const [waterGlasses, setWaterGlasses] = useState(0); // Iniciado en 0
  const [waterTarget, setWaterTarget] = useState<number>(8);
  const [fastingStreak, setFastingStreak] = useState(3);

  const [userGoal, setUserGoal] = useState('Bajar peso y mantenerme');
  const [trackType, setTrackType] = useState('fat_loss');
  const [dietType, setDietType] = useState('omnivore');
  const [weightLossMethod, setWeightLossMethod] = useState('fasting');
  const [hasActivity, setHasActivity] = useState(false);
  const [activityType, setActivityType] = useState('');

  const [mealsLogged, setMealsLogged] = useState({
    breakfast: false,
    lunch: false,
    snack: false,
    dinner: false
  });

  const [currentTip, setCurrentTip] = useState<{phase: string, title: string, content: string} | null>(null);

  const [weightHistory, setWeightHistory] = useState<any[]>([]);
  const [targetWeight, setTargetWeight] = useState<number | null>(null);
  const [newWeightInput, setNewWeightInput] = useState('');
  const [submittingWeight, setSubmittingWeight] = useState(false);
  const [goalReached, setGoalReached] = useState(false);

  useEffect(() => {
    if (!userEmail || userEmail === 'usuario@ayuno.com') return;

    const fetchInitialData = async () => {
      try {
        const fastingRes = await fetch(`/api/fasting/state?email=${encodeURIComponent(userEmail)}`, { cache: 'no-store' });
        const fastingData = await fastingRes.json();
        if (fastingData.success && fastingData.state && fastingData.state.is_fasting && fastingData.state.start_time) {
          setIsFasting(true);
          if (fastingData.state.target_hours) {
            setTargetHours(fastingData.state.target_hours);
          }
          const start = new Date(fastingData.state.start_time).getTime();
          const now = new Date().getTime();
          const elapsedSeconds = Math.floor((now - start) / 1000);
          setFastingSeconds(elapsedSeconds > 0 ? elapsedSeconds : 0);
        }

        const weightRes = await fetch(`/api/weight?email=${encodeURIComponent(userEmail)}`, { cache: 'no-store' });
        const weightData = await weightRes.json();
        if (weightData.success) {
          setWeightHistory(weightData.weights);
          setTargetWeight(weightData.target_weight);

          if (weightData.weights && weightData.weights.length > 0) {
            const currentW = Number(weightData.weights[weightData.weights.length - 1].weight_kg) || 70;
            const calculatedGlasses = Math.round((currentW * 35) / 250);
            setWaterTarget(calculatedGlasses);
          }
        }

        const metricsRes = await fetch(`/api/metrics?email=${encodeURIComponent(userEmail)}`, { cache: 'no-store' });
        const metricsData = await metricsRes.json();
        if (metricsData.success && metricsData.metrics) {
          const m = metricsData.metrics;
          if (m.goal) setUserGoal(m.goal);
          if (m.track_type) setTrackType(m.track_type);
          if (m.diet_type) setDietType(m.diet_type);
          if (m.weight_loss_method) setWeightLossMethod(m.weight_loss_method);
          if (m.has_activity !== undefined) setHasActivity(m.has_activity);
          if (m.activity_type) setActivityType(m.activity_type);
        }
      } catch (err) {
        console.error('Error al cargar datos iniciales:', err);
      }
    };

    fetchInitialData();
  }, [userEmail]);

  useEffect(() => {
    let interval: any = null;
    if (isFasting && weightLossMethod === 'fasting' && trackType === 'fat_loss') {
      interval = setInterval(() => {
        setFastingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isFasting, weightLossMethod, trackType]);

  useEffect(() => {
    if (userGoal.includes('masa muscular')) {
      setCurrentTip({
        phase: "Volumen Limpio",
        title: "Optimización de Fibras Musculares",
        content: `Tu enfoque actual es hipertrofia con dieta ${dietType}${hasActivity ? ` y entrenamiento de ${activityType}` : ''}. Asegúrate de cumplir tus ingestas proteicas diarias.`
      });
      return;
    }

    if (userGoal.includes('envejecimiento')) {
      setCurrentTip({
        phase: "Longevidad y Regeneración",
        title: "Activación Anti-Aging",
        content: "El ayuno intermitente y la restricción limpia estimulan la reparación de tejidos y la salud mitocondrial."
      });
      return;
    }

    if (userGoal.includes('Desintoxicación')) {
      setCurrentTip({
        phase: "Detox Celular y Autofagia",
        title: "Limpieza Metabólica Profunda",
        content: "Mantén una hidratación alta con infusiones permitidas para potenciar la eliminación de toxinas."
      });
      return;
    }

    if (weightLossMethod === 'traditional') {
      setCurrentTip({
        phase: "Método Tradicional Activo",
        title: "Control de Ingestas y Hábitos",
        content: "Concéntrate en registrar tus comidas principales y mantén al coach alerta a tus porciones."
      });
      return;
    }

    if (!isFasting) {
      setCurrentTip({
        phase: "Preparación",
        title: "Modo Ayuno Activo",
        content: `Tu plan está configurado con dieta ${dietType}. Elige tu ventana y presiona iniciar para comenzar el ciclo metabólico.`
      });
      return;
    }

    const hours = fastingSeconds / 3600;
    if (hours >= targetHours) {
      setCurrentTip({ 
        phase: "¡Meta Cumplida! 🎉", 
        title: "Zona de Cetosis y Autofagia Óptima", 
        content: "¡Meta alcanzada! Máxima optimización metabólica y limpieza celular lista para romper." 
      });
      return;
    }

    if (hours < 4) {
      setCurrentTip({ phase: "Fase Inicial", title: "Procesando Nutrientes", content: "Tus niveles de energía están estables mientras tu organismo inicia el ciclo metabólico." });
    } else {
      setCurrentTip({ phase: "Fase Activa", title: "Optimización Metabólica en Curso", content: "Mantén una hidratación constante y respeta tus ventanas biológicas." });
    }
  }, [fastingSeconds, targetHours, isFasting, userGoal, dietType, weightLossMethod, hasActivity, activityType]);

  useEffect(() => {
    if (weightHistory.length > 0 && targetWeight !== null) {
      const initialWeight = Number(weightHistory[0].weight_kg);
      const currentW = Number(weightHistory[weightHistory.length - 1].weight_kg);

      const calculatedGlasses = Math.round((currentW * 35) / 250);
      setWaterTarget(calculatedGlasses);

      if (initialWeight > targetWeight && currentW <= targetWeight) {
        setGoalReached(true);
      } else if (initialWeight < targetWeight && currentW >= targetWeight) {
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
    const startTimeNow = newFastingState ? new Date().toISOString() : null;
    try {
      const res = await fetch('/api/fasting/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: userEmail, 
          is_fasting: newFastingState, 
          start_time: startTimeNow,
          target_hours: targetHours 
        })
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

    if (isNaN(weightNum) || weightNum < 30 || weightNum > 300) {
      alert('Por favor introduce un peso válido entre 30 kg y 300 kg.');
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

  const getGoalBadgeInfo = () => {
    if (userGoal.includes('masa muscular')) return { label: '💪 Ganancia Muscular (Volumen Limpio)', color: 'bg-amber-50 text-amber-900 border-amber-200' };
    if (userGoal.includes('envejecimiento')) return { label: '🧬 Retrasar el Envejecimiento (Anti-Aging)', color: 'bg-purple-50 text-purple-900 border-purple-200' };
    if (userGoal.includes('Desintoxicación')) return { label: '🌿 Desintoxicación Celular (Autofagia)', color: 'bg-emerald-50 text-emerald-900 border-emerald-200' };
    if (weightLossMethod === 'traditional') return { label: '🥗 Pérdida de Grasa (Método Tradicional)', color: 'bg-indigo-50 text-indigo-900 border-indigo-200' };
    return { label: '🔥 Pérdida de Grasa (Ayuno Intermitente)', color: 'bg-indigo-50 text-indigo-900 border-indigo-200' };
  };

  const goalInfo = getGoalBadgeInfo();

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden p-6 md:p-8 space-y-6 relative">
      
      <PushNotificationBanner />

      <div className="flex justify-end">
        <button 
          onClick={() => router.push(`/stats?email=${encodeURIComponent(userEmail)}`)}
          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs px-4 py-2.5 rounded-xl transition-all border border-indigo-200 shadow-sm flex items-center gap-2"
        >
          📊 Ver Mis Estadísticas y Hábitos
        </button>
      </div>

      {isSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-center animate-fade-in">
          <span className="font-bold block text-lg mb-1">¡🎉 Plan Activado con Éxito!</span>
          <p className="text-sm">Tu programa profesional personalizado está listo con asistente proactivo.</p>
        </div>
      )}

      {/* Banner de Objetivo Personalizado */}
      <div className={`flex flex-wrap items-center justify-between border p-4 rounded-2xl gap-2 ${goalInfo.color}`}>
        <div className="flex items-center gap-2">
          <span className="text-xl">🎯</span>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest block opacity-75">Tu Meta Seleccionada</span>
            <span className="text-sm font-black">{goalInfo.label}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasActivity && (
            <span className="bg-white/80 px-3 py-1.5 rounded-xl border text-xs font-bold text-gray-800">
              🏃‍♂️ {activityType}
            </span>
          )}
          <span className="bg-white px-3 py-1.5 rounded-xl border text-xs font-bold capitalize">
            🥗 Dieta: {dietType}
          </span>
        </div>
      </div>

      <div className="text-center">
        <h1 className="text-3xl font-black text-gray-900">Panel Principal & Coach</h1>
        <p className="text-gray-500 mt-1">Monitorea tus avances metabólicos y mantén el control absoluto de tus hábitos.</p>
      </div>

      {currentTip && (
        <div className={`border p-6 rounded-2xl shadow-sm transition-all ${currentTip.phase.includes('Meta Cumplida') ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200' : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">💡</span>
            <span className={`text-xs font-bold uppercase tracking-wider ${currentTip.phase.includes('Meta Cumplida') ? 'text-emerald-800' : 'text-amber-800'}`}>
              Coach Proactivo • {currentTip.phase}
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">{currentTip.title}</h3>
          <p className="text-sm text-gray-700 leading-relaxed">{currentTip.content}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {trackType === 'fat_loss' && weightLossMethod === 'fasting' ? (
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
                    <option value={12}>12/12 - Descanso Digestivo (12h)</option>
                    <option value={14}>14/10 - Intermedio (14h)</option>
                    <option value={16}>16/8 - Clásico / Definición (16h)</option>
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
        ) : (
          <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block mb-1">
                {userGoal.includes('masa muscular') ? '💪 Control de Ingestas y Volumen' : '🥗 Control Diario de Comidas'}
              </span>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Registro de Ingestas Hoy</h3>
              <p className="text-xs text-gray-600 mb-3">Marca tus comidas principales para asegurar que cumples con tus requerimientos diarios.</p>
              
              <div className="space-y-2 mb-4">
                {[
                  { key: 'breakfast', label: '🍳 Desayuno / Primera Comida' },
                  { key: 'lunch', label: '🥗 Almuerzo Principal' },
                  { key: 'snack', label: '🥜 Colación / Refuerzo Proteico' },
                  { key: 'dinner', label: '🍲 Cena Reparadora' }
                ].map((meal) => (
                  <label key={meal.key} className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-indigo-100 cursor-pointer hover:bg-indigo-50 transition-all">
                    <span className="text-xs font-bold text-gray-700">{meal.label}</span>
                    <input 
                      type="checkbox"
                      checked={(mealsLogged as any)[meal.key]}
                      onChange={(e) => setMealsLogged({ ...mealsLogged, [meal.key]: e.target.checked })}
                      className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                    />
                  </label>
                ))}
              </div>
            </div>
            <div className="bg-white/80 p-2.5 rounded-xl border border-indigo-200 text-center text-xs font-bold text-indigo-900">
              {Object.values(mealsLogged).filter(Boolean).length} de 4 comidas registradas hoy
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1">Hidratación Constante</span>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Registro de Agua</h3>
            <div className="my-3 flex items-center justify-between bg-white/80 p-3 rounded-xl border border-blue-100">
              <span className="text-sm font-semibold text-gray-600">Vasos hoy:</span>
              <span className="text-2xl font-black text-blue-600">
                {waterGlasses} <span className="text-xs font-normal text-gray-400">/ {waterTarget} vasos</span>
              </span>
            </div>
            <p className="text-[11px] text-blue-700 italic">💡 El coach te recordará beber agua periódicamente para evitar la fatiga.</p>
          </div>
          <button 
            onClick={addWaterGlass}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all text-center shadow-md"
          >
            + Registrar Vaso de Agua 💧
          </button>
        </div>
      </div>

      <div className="bg-purple-50 border border-purple-100 p-6 rounded-2xl">
        {goalReached && (
          <div className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 p-1 rounded-2xl mb-6 shadow-xl transition-all">
            <div className="bg-white px-6 py-8 rounded-xl text-center">
              <span className="text-6xl block mb-4">🏆</span>
              <h2 className="text-2xl font-black text-gray-900 mb-2">¡Misión Cumplida!</h2>
              <p className="text-gray-700 font-medium">
                Has alcanzado tu meta de <span className="font-black text-yellow-600">{targetWeight} kg</span>. Todo tu esfuerzo y disciplina han dado frutos. ¡Felicidades!
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

        {renderWeightChart()}
      </div>

      <BadgesSection email={userEmail} />

      <FoodAnalyzer />

      <div className="bg-gray-50 border border-gray-200 p-4 rounded-2xl text-center">
        <p className="text-sm text-emerald-600 font-semibold">Programa Especialista Adaptativo Activo ✓</p>
      </div>

      {/* Renderizado del Coach IA integrado */}
      <AICoachChat email={userEmail} />

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
