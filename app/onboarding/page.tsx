'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Memoria temporal del cuestionario
  const [formData, setFormData] = useState({
    goal: '',
    weightLossMethod: 'fasting', // 'fasting' o 'traditional'
    gender: '',
    height: '',
    weight: '',
    targetWeight: '',
    water: '',
    firstMeal: '09:00',
    lastMeal: '22:00',
    dietType: 'omnivore',
    email: ''
  });

  // Determinar si el usuario eligió bajar de peso
  const isWeightLoss = formData.goal === 'Bajar peso y mantenerme';
  
  // Total de pasos dinámico: 9 si elige bajar de peso (por el selector de método), 8 para los demás
  const totalSteps = isWeightLoss ? 9 : 8;
  const progress = (step / totalSteps) * 100;

  // Mapeo limpio de pantallas según el paso actual y el objetivo
  const getScreenType = () => {
    if (step === 1) return 'goal';
    if (isWeightLoss) {
      if (step === 2) return 'weightLossMethod';
      if (step === 3) return 'gender';
      if (step === 4) return 'measurements';
      if (step === 5) return 'targetWeight';
      if (step === 6) return 'schedule';
      if (step === 7) return 'diet';
      if (step === 8) return 'water';
      if (step === 9) return 'summary';
    } else {
      if (step === 2) return 'gender';
      if (step === 3) return 'measurements';
      if (step === 4) return 'targetWeight';
      if (step === 5) return 'schedule';
      if (step === 6) return 'diet';
      if (step === 7) return 'water';
      if (step === 8) return 'summary';
    }
    return 'goal';
  };

  const currentScreen = getScreenType();

  const handleSelect = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    setTimeout(() => nextStep(), 300);
  };

  const nextStep = () => {
    // Validaciones específicas según la pantalla actual
    if (currentScreen === 'measurements') {
      const h = parseFloat(formData.height.replace(',', '.'));
      const w = parseFloat(formData.weight.replace(',', '.'));
      if (isNaN(h) || h < 100 || h > 250) {
        alert('Por favor ingresa una altura válida (entre 100 cm y 250 cm).');
        return;
      }
      if (isNaN(w) || w < 30 || w > 300) {
        alert('Por favor ingresa un peso actual válido (entre 30 kg y 300 kg).');
        return;
      }
    }

    if (currentScreen === 'targetWeight') {
      const tw = parseFloat(formData.targetWeight.replace(',', '.'));
      if (isNaN(tw) || tw < 30 || tw > 300) {
        alert('Por favor ingresa un peso objetivo válido (entre 30 kg y 300 kg).');
        return;
      }
    }

    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      startAnalysis();
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const startAnalysis = async () => {
    if (!formData.email || !formData.email.includes('@')) {
      alert('Por favor ingresa un correo electrónico válido.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/save-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (data.success) {
        setTimeout(() => {
          router.push(`/checkout?email=${encodeURIComponent(formData.email)}`);
        }, 3000);
      } else {
        alert('Error al guardar los datos: ' + data.error);
        setIsAnalyzing(false);
      }
    } catch (err) {
      console.error(err);
      alert('Ocurrió un error de red. Inténtalo de nuevo.');
      setIsAnalyzing(false);
    }
  };

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-8"></div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Analizando parámetros y construyendo plan...</h2>
        <p className="text-gray-500">Configurando tu asistente proactivo, alertas y metodología elegida.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white md:bg-gray-50">
      <div className="max-w-md mx-auto md:mt-10 min-h-screen md:min-h-0 bg-white md:rounded-2xl md:shadow-lg overflow-hidden flex flex-col">
        
        {/* Header y Barra de Progreso Sincronizada */}
        <div className="px-6 pt-6 pb-2">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevStep} disabled={step === 1} className={`text-gray-400 hover:text-gray-800 ${step === 1 ? 'invisible' : ''}`}>
              ← Volver
            </button>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mi Perfil • Paso {step}/{totalSteps}</span>
            <div className="w-10"></div>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-indigo-600 h-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        {/* Contenido Dinámico según la Pantalla */}
        <div className="flex-1 px-6 py-8 overflow-y-auto">
          
          {/* 1. OBJETIVO PRINCIPAL */}
          {currentScreen === 'goal' && (
            <div className="animate-fade-in-up">
              <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Para empezar, cuéntanos qué quieres lograr:</h2>
              <div className="space-y-3">
                {[
                  'Bajar peso y mantenerme', 
                  'Ganar masa muscular (Volumen limpio)', 
                  'Retrasar el envejecimiento', 
                  'Desintoxicación celular'
                ].map((opcion) => (
                  <button 
                    key={opcion} 
                    onClick={() => handleSelect('goal', opcion)} 
                    className="w-full text-left p-4 rounded-xl border-2 border-gray-100 hover:border-indigo-600 hover:bg-indigo-50 transition-all font-medium text-gray-700"
                  >
                    {opcion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 2. MÉTODO DE DESCENSO (Solo si elige bajar de peso) */}
          {currentScreen === 'weightLossMethod' && (
            <div className="animate-fade-in-up">
              <span className="text-indigo-600 text-xs font-bold uppercase tracking-widest block mb-1">Personalización de Descenso</span>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">¿Cómo prefieres lograr tu descenso de peso?</h2>
              <p className="text-gray-500 mb-6 text-sm">Adaptaremos la experiencia de tu panel principal a tu comodidad.</p>
              <div className="space-y-3">
                <button 
                  onClick={() => handleSelect('weightLossMethod', 'fasting')}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${formData.weightLossMethod === 'fasting' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100 hover:border-indigo-400'}`}
                >
                  <span className="font-bold text-gray-900 block">⏱️ Ayuno Intermitente</span>
                  <span className="text-xs text-gray-500">Control estricto de ventanas horarias y cronómetro metabólico.</span>
                </button>
                <button 
                  onClick={() => handleSelect('weightLossMethod', 'traditional')}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${formData.weightLossMethod === 'traditional' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100 hover:border-indigo-400'}`}
                >
                  <span className="font-bold text-gray-900 block">🥗 Método Tradicional / Equilibrado</span>
                  <span className="text-xs text-gray-500">Comidas fraccionadas a lo largo del día sin restricciones horarias de ayuno.</span>
                </button>
              </div>
            </div>
          )}

          {/* 3. GÉNERO */}
          {currentScreen === 'gender' && (
            <div className="animate-fade-in-up">
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">¿Cuál es tu género biológico?</h2>
              <p className="text-gray-500 mb-6 text-sm">Esta información nos sirve para calcular tu metabolismo basal con precisión médica.</p>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => handleSelect('gender', 'Hombre')} className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-gray-100 hover:border-indigo-600 hover:bg-indigo-50 transition-all">
                  <span className="text-5xl mb-3">👨</span>
                  <span className="font-medium text-gray-700">Hombre</span>
                </button>
                <button onClick={() => handleSelect('gender', 'Mujer')} className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-gray-100 hover:border-indigo-600 hover:bg-indigo-50 transition-all">
                  <span className="text-5xl mb-3">👩</span>
                  <span className="font-medium text-gray-700">Mujer</span>
                </button>
              </div>
            </div>
          )}

          {/* 4. MEDIDAS ACTUALES */}
          {currentScreen === 'measurements' && (
            <div className="animate-fade-in-up">
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Tus medidas actuales</h2>
              <p className="text-gray-500 mb-6 text-sm">Usaremos estos datos para determinar el ritmo al que te conviene avanzar.</p>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Altura (cm)</label>
                  <input 
                    type="text" 
                    inputMode="decimal"
                    placeholder="Ej. 175" 
                    value={formData.height} 
                    onChange={(e) => setFormData({...formData, height: e.target.value})} 
                    className="w-full p-4 border-2 border-gray-200 rounded-xl text-xl focus:border-indigo-600 focus:ring-0 outline-none transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Peso actual (kg)</label>
                  <input 
                    type="text" 
                    inputMode="decimal"
                    placeholder="Ej. 85,5 o 85.5" 
                    value={formData.weight} 
                    onChange={(e) => setFormData({...formData, weight: e.target.value})} 
                    className="w-full p-4 border-2 border-gray-200 rounded-xl text-xl focus:border-indigo-600 focus:ring-0 outline-none transition-all" 
                  />
                </div>
                <button onClick={nextStep} disabled={!formData.height || !formData.weight} className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all">
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* 5. PESO OBJETIVO */}
          {currentScreen === 'targetWeight' && (
            <div className="animate-fade-in-up">
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">¿Cuál es tu peso objetivo?</h2>
              <div className="bg-green-50 p-4 rounded-xl border border-green-100 mb-6">
                <p className="text-sm text-green-800 font-medium">💡 Ya sea para definir o ganar masa muscular limpia, fijar tu meta es el primer paso.</p>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Peso meta (kg)</label>
                  <input 
                    type="text" 
                    inputMode="decimal"
                    placeholder="Ej. 75,0 o 75.0" 
                    value={formData.targetWeight} 
                    onChange={(e) => setFormData({...formData, targetWeight: e.target.value})} 
                    className="w-full p-4 border-2 border-gray-200 rounded-xl text-xl focus:border-indigo-600 focus:ring-0 outline-none transition-all" 
                  />
                </div>
                <button onClick={nextStep} disabled={!formData.targetWeight} className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all">
                  Siguiente
                </button>
              </div>
            </div>
          )}

          {/* 6. HORARIOS BIOLÓGICOS */}
          {currentScreen === 'schedule' && (
            <div className="animate-fade-in-up space-y-6">
              <div className="text-center">
                <span className="text-4xl mb-2 block">⏰</span>
                <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Tus horarios de alimentación</h2>
                <p className="text-gray-500 text-sm">Alineamos tus ventanas nutricionales con tus hábitos diarios.</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">¿A qué hora es tu primera comida?</label>
                  <input 
                    type="time" 
                    value={formData.firstMeal}
                    onChange={(e) => setFormData({...formData, firstMeal: e.target.value})}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl text-xl font-bold text-indigo-600 bg-gray-50 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">¿A qué hora es tu última comida?</label>
                  <input 
                    type="time" 
                    value={formData.lastMeal}
                    onChange={(e) => setFormData({...formData, lastMeal: e.target.value})}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl text-xl font-bold text-indigo-600 bg-gray-50 outline-none"
                  />
                </div>
                <button onClick={nextStep} className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-all">
                  Siguiente
                </button>
              </div>
            </div>
          )}

          {/* 7. TIPO DE DIETA */}
          {currentScreen === 'diet' && (
            <div className="animate-fade-in-up">
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">¿Cómo prefieres alimentarte?</h2>
              <p className="text-gray-500 mb-6 text-sm">Adaptaremos el recetario y las proteínas según tu elección.</p>
              <div className="space-y-3">
                {[
                  { id: 'omnivore', title: '🥩 Omnívora (Incluye carnes y vegetales)', desc: 'Acceso a todo el recetario tradicional y proteico.' },
                  { id: 'vegetarian', title: '🧀 Vegetariana (Sin carnes, con lácteos/huevos)', desc: 'Proteínas limpias de alta calidad y vegetales.' },
                  { id: 'vegan', title: '🌱 Vegana (100% basado en plantas)', desc: 'Tofu, legumbres, semillas y alternativas vegetales.' }
                ].map((item) => (
                  <button 
                    key={item.id} 
                    onClick={() => handleSelect('dietType', item.id)} 
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${formData.dietType === item.id ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100 hover:border-indigo-400'}`}
                  >
                    <span className="font-bold text-gray-800 block">{item.title}</span>
                    <span className="text-xs text-gray-500">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 8. HÁBITOS DE AGUA */}
          {currentScreen === 'water' && (
            <div className="animate-fade-in-up">
              <div className="w-full h-24 bg-gray-100 rounded-xl mb-4 flex items-center justify-center text-3xl">💧</div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-6">¿Cuánta agua bebes al día?</h2>
              <div className="space-y-3">
                {[
                  { text: 'Solo bebo café o té', icon: '☕' },
                  { text: 'Unos 2 vasos', icon: '🚰' },
                  { text: 'Entre 2 y 6 vasos', icon: '💧' },
                  { text: 'Más de 6 vasos', icon: '🌊' }
                ].map((opcion) => (
                  <button key={opcion.text} onClick={() => handleSelect('water', opcion.text)} className="w-full flex items-center p-4 rounded-xl border-2 border-gray-100 hover:border-indigo-600 hover:bg-indigo-50 transition-all">
                    <span className="text-2xl mr-4">{opcion.icon}</span>
                    <span className="font-medium text-gray-700">{opcion.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 9. RESUMEN Y CORREO (FINAL) */}
          {currentScreen === 'summary' && (
            <div className="animate-fade-in-up space-y-5">
              <div className="text-center">
                <span className="text-4xl mb-2 block">🎯</span>
                <h2 className="text-2xl font-extrabold text-gray-900">Tu plan personal ha sido generado</h2>
                <p className="text-gray-500 text-xs mt-1">Hemos diseñado un sistema experto para tu meta y estilo.</p>
              </div>

              <div className="bg-indigo-50/60 border border-indigo-100 p-4 rounded-xl space-y-2 text-xs text-gray-700">
                <div className="flex justify-between font-bold text-indigo-900 border-b border-indigo-100 pb-2">
                  <span>Peso Actual ➔ Meta</span>
                  <span>{formData.weight || '85'} kg ➔ {formData.targetWeight || '75'} kg</span>
                </div>
                <div className="flex items-center gap-2 pt-1"><span>🟢</span> Objetivo: <b>{formData.goal || 'Tu objetivo'}</b></div>
                {formData.goal === 'Bajar peso y mantenerme' && (
                  <div className="flex items-center gap-2"><span>⚡</span> Método: <b className="capitalize">{formData.weightLossMethod === 'fasting' ? 'Ayuno Intermitente' : 'Método Tradicional'}</b></div>
                )}
                <div className="flex items-center gap-2"><span>🥗</span> Dieta adaptada: <b className="capitalize">{formData.dietType}</b></div>
                <div className="flex items-center gap-2"><span>📸</span> Asistencia 24/7 de Nutricionista IA por foto y Coach Proactivo</div>
              </div>

              <div className="bg-indigo-50/60 border border-indigo-100 p-4 rounded-xl text-center space-y-1.5">
                <p className="text-xs font-bold text-indigo-950 uppercase tracking-wide">
                  ¡Vamos a ayudarte a <span className="text-indigo-600">{formData.goal || "alcanzar tu meta"}</span>!
                </p>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  Nuestro coach insistente y proactivo estará recordándote tus tomas de agua y colaciones para que nunca te sientas solo en el proceso.
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Correo electrónico para enviar tu plan</label>
                <input 
                  type="email" 
                  placeholder="tucorreo@gmail.com" 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  className="w-full p-4 border-2 border-gray-200 rounded-xl text-base focus:border-indigo-600 outline-none transition-all" 
                />
              </div>

              <button onClick={startAnalysis} disabled={!formData.email || !formData.email.includes('@')} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-sm uppercase tracking-wider py-4 rounded-xl disabled:opacity-50 transition-all shadow-lg text-center">
                ¡VAMOS POR TU OBJETIVO! 🚀
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
