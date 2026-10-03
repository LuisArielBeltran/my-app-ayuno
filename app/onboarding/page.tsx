'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Memoria temporal del cuestionario extendida (con edad incluida)
  const [formData, setFormData] = useState({
    goal: '',
    weightLossMethod: 'fasting',
    gender: '',
    age: '', 
    height: '',
    weight: '',
    targetWeight: '',
    hasActivity: null as boolean | null,
    activityType: '',
    activityOther: '',
    activityHours: '',
    water: '',
    firstMeal: '09:00',
    lastMeal: '22:00',
    dietType: 'omnivore',
    email: ''
  });

  // Lógica de cálculo de pasos actualizada
  const isWeightLoss = formData.goal === 'Bajar peso y mantenerme';
  const totalSteps = isWeightLoss ? 11 : 10; 
  const progress = (step / totalSteps) * 100;

  // Mapeo limpio de pantallas incluyendo el paso de la edad
  const getScreenType = () => {
    if (step === 1) return 'goal';
    if (isWeightLoss) {
      if (step === 2) return 'weightLossMethod';
      if (step === 3) return 'gender';
      if (step === 4) return 'age'; 
      if (step === 5) return 'measurements';
      if (step === 6) return 'targetWeight';
      if (step === 7) return 'activity';
      if (step === 8) return 'schedule';
      if (step === 9) return 'diet';
      if (step === 10) return 'water';
      if (step === 11) return 'summary';
    } else {
      if (step === 2) return 'gender';
      if (step === 3) return 'age'; 
      if (step === 4) return 'measurements';
      if (step === 5) return 'targetWeight';
      if (step === 6) return 'activity';
      if (step === 7) return 'schedule';
      if (step === 8) return 'diet';
      if (step === 9) return 'water';
      if (step === 10) return 'summary';
    }
    return 'goal';
  };

  const currentScreen = getScreenType();

  const handleSelect = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    setTimeout(() => nextStep(), 300);
  };

  const nextStep = () => {
    // Validaciones de edad
    if (currentScreen === 'age') {
      const a = parseInt(formData.age);
      if (isNaN(a) || a < 10 || a > 120) {
        alert('Por favor ingresa una edad válida (entre 10 y 120 años).');
        return;
      }
    }

    // Validaciones de medidas
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
          router.push(`/onboarding/results?email=${encodeURIComponent(formData.email)}`);
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

  const optionButtonClass = "w-full text-left p-4 rounded-xl border-2 border-gray-100 hover:border-indigo-600 hover:bg-indigo-50 shadow-sm transition-all font-bold text-gray-700";

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
              <span className="text-indigo-600 text-xs font-bold uppercase tracking-widest block mb-1">Paso Inicial</span>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Para empezar, cuéntanos qué quieres lograr:</h2>
              <div className="space-y-3">
                {[
                  'Bajar peso y mantenerme', 
                  'Ganar masa muscular (Volumen limpio)', 
                  'Retrasar el envejecimiento', 
                  'Desintoxicación celular'
                ].map((opcion) => (
                  <button key={opcion} onClick={() => handleSelect('goal', opcion)} className={optionButtonClass}>
                    {opcion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 2. MÉTODO DE DESCENSO */}
          {currentScreen === 'weightLossMethod' && (
            <div className="animate-fade-in-up">
              <span className="text-indigo-600 text-xs font-bold uppercase tracking-widest block mb-1">Personalización</span>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">¿Cómo prefieres lograr tu descenso de peso?</h2>
              <p className="text-gray-500 mb-6 text-sm">Adaptaremos la experiencia de tu panel principal a tu comodidad.</p>
              <div className="space-y-3">
                <button onClick={() => handleSelect('weightLossMethod', 'fasting')} className={`${optionButtonClass} ${formData.weightLossMethod === 'fasting' ? 'border-indigo-600 bg-indigo-50' : ''}`}>
                  <span className="block mb-1">⏱️ Ayuno Intermitente</span>
                  <span className="text-xs font-medium text-gray-500">Control estricto de ventanas horarias y cronómetro.</span>
                </button>
                <button onClick={() => handleSelect('weightLossMethod', 'traditional')} className={`${optionButtonClass} ${formData.weightLossMethod === 'traditional' ? 'border-indigo-600 bg-indigo-50' : ''}`}>
                  <span className="block mb-1">🥗 Método Tradicional / Equilibrado</span>
                  <span className="text-xs font-medium text-gray-500">Comidas fraccionadas sin restricciones de ayuno.</span>
                </button>
              </div>
            </div>
          )}

          {/* GÉNERO */}
          {currentScreen === 'gender' && (
            <div className="animate-fade-in-up">
              <span className="text-indigo-600 text-xs font-bold uppercase tracking-widest block mb-1">Biometría</span>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">¿Cuál es tu género biológico?</h2>
              <p className="text-gray-500 mb-6 text-sm">Sirve para calcular tu metabolismo basal con precisión.</p>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => handleSelect('gender', 'Hombre')} className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-gray-100 hover:border-indigo-600 hover:bg-indigo-50 shadow-sm transition-all">
                  <span className="text-5xl mb-3">👨</span>
                  <span className="font-bold text-gray-700">Hombre</span>
                </button>
                <button onClick={() => handleSelect('gender', 'Mujer')} className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-gray-100 hover:border-indigo-600 hover:bg-indigo-50 shadow-sm transition-all">
                  <span className="text-5xl mb-3">👩</span>
                  <span className="font-bold text-gray-700">Mujer</span>
                </button>
              </div>
            </div>
          )}

          {/* EDAD */}
          {currentScreen === 'age' && (
            <div className="animate-fade-in-up">
              <span className="text-indigo-600 text-xs font-bold uppercase tracking-widest block mb-1">Biometría</span>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">¿Cuál es tu edad?</h2>
              <p className="text-gray-500 mb-6 text-sm">Este dato es fundamental para ajustar tu plan metabólico.</p>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Edad (años)</label>
                  <input 
                    type="text" 
                    inputMode="numeric" 
                    placeholder="Ej. 30" 
                    value={formData.age} 
                    onChange={(e) => setFormData({...formData, age: e.target.value})} 
                    className="w-full p-4 border-2 border-gray-200 rounded-xl text-xl focus:border-indigo-600 focus:ring-0 outline-none shadow-sm transition-all" 
                  />
                </div>
                <button 
                  onClick={nextStep} 
                  disabled={!formData.age} 
                  className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* MEDIDAS ACTUALES */}
          {currentScreen === 'measurements' && (
            <div className="animate-fade-in-up">
              <span className="text-indigo-600 text-xs font-bold uppercase tracking-widest block mb-1">Perfil Corporal</span>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Tus medidas actuales</h2>
              <p className="text-gray-500 mb-6 text-sm">Usaremos estos datos para determinar tu ritmo de avance.</p>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Altura (cm)</label>
                  <input type="text" inputMode="decimal" placeholder="Ej. 175" value={formData.height} onChange={(e) => setFormData({...formData, height: e.target.value})} className="w-full p-4 border-2 border-gray-200 rounded-xl text-xl focus:border-indigo-600 focus:ring-0 outline-none shadow-sm transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Peso actual (kg)</label>
                  <input type="text" inputMode="decimal" placeholder="Ej. 85,5 o 85.5" value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} className="w-full p-4 border-2 border-gray-200 rounded-xl text-xl focus:border-indigo-600 focus:ring-0 outline-none shadow-sm transition-all" />
                </div>
                <button onClick={nextStep} disabled={!formData.height || !formData.weight} className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md">
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* PESO OBJETIVO */}
          {currentScreen === 'targetWeight' && (
            <div className="animate-fade-in-up">
              <span className="text-indigo-600 text-xs font-bold uppercase tracking-widest block mb-1">Tu Meta</span>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">¿Cuál es tu peso objetivo?</h2>
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 mb-6 shadow-sm">
                <p className="text-sm text-emerald-800 font-medium">💡 Ya sea para definir o ganar masa limpia, fijar tu meta es vital.</p>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Peso meta (kg)</label>
                  <input type="text" inputMode="decimal" placeholder="Ej. 75,0 o 75.0" value={formData.targetWeight} onChange={(e) => setFormData({...formData, targetWeight: e.target.value})} className="w-full p-4 border-2 border-gray-200 rounded-xl text-xl focus:border-indigo-600 focus:ring-0 outline-none shadow-sm transition-all" />
                </div>
                <button onClick={nextStep} disabled={!formData.targetWeight} className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md">
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* ACTIVIDAD FÍSICA */}
          {currentScreen === 'activity' && (
            <div className="animate-fade-in-up">
              <span className="text-indigo-600 text-xs font-bold uppercase tracking-widest block mb-1">Estilo de Vida</span>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">¿Realizas actividad física?</h2>
              <p className="text-gray-500 mb-6 text-sm">Esto ajustará tus necesidades calóricas e hídricas que la IA procesará.</p>

              {formData.hasActivity === null && (
                <div className="space-y-3">
                  <button onClick={() => setFormData({...formData, hasActivity: true})} className={optionButtonClass}>
                    🏃‍♂️ Sí, realizo ejercicio
                  </button>
                  <button onClick={() => { setFormData({...formData, hasActivity: false}); setTimeout(() => nextStep(), 300); }} className={optionButtonClass}>
                    🛋 No, soy sedentario/a
                  </button>
                </div>
              )}

              {formData.hasActivity === true && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">¿Qué actividad principal realizas?</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['Gimnasio', 'Spinning', 'Aeróbico', 'Running', 'Tenis', 'Fútbol', 'Caminar', 'Otras'].map((act) => (
                        <button
                          key={act}
                          onClick={() => setFormData({...formData, activityType: act})}
                          className={`p-3 rounded-xl border-2 text-sm font-bold transition-all shadow-sm ${formData.activityType === act ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-100 text-gray-600 hover:border-indigo-300'}`}
                        >
                          {act}
                        </button>
                      ))}
                    </div>
                    {formData.activityType === 'Otras' && (
                      <input
                        type="text"
                        placeholder="Especifica cuál..."
                        value={formData.activityOther}
                        onChange={(e) => setFormData({...formData, activityOther: e.target.value})}
                        className="mt-3 w-full p-4 border-2 border-gray-200 rounded-xl text-sm focus:border-indigo-600 outline-none shadow-sm transition-all"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">¿Cuántas horas a la semana?</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['1 hora', '2 horas', '3+ horas'].map((hrs) => (
                        <button
                          key={hrs}
                          onClick={() => setFormData({...formData, activityHours: hrs})}
                          className={`p-3 rounded-xl border-2 text-sm font-bold transition-all shadow-sm ${formData.activityHours === hrs ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-100 text-gray-600 hover:border-indigo-300'}`}
                        >
                          {hrs}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={nextStep}
                    disabled={!formData.activityType || (formData.activityType === 'Otras' && !formData.activityOther) || !formData.activityHours}
                    className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </div>
          )}

          {/* HORARIOS BIOLÓGICOS */}
          {currentScreen === 'schedule' && (
            <div className="animate-fade-in-up space-y-6">
              <div className="text-center">
                <span className="text-4xl mb-2 block">⏰</span>
                <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Tus horarios de alimentación</h2>
                <p className="text-gray-500 text-sm">Alineamos tus ventanas nutricionales con tus hábitos.</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">¿A qué hora es tu primera comida?</label>
                  <input type="time" value={formData.firstMeal} onChange={(e) => setFormData({...formData, firstMeal: e.target.value})} className="w-full p-4 border-2 border-gray-200 rounded-xl text-xl font-bold text-indigo-600 bg-white shadow-sm outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">¿A qué hora es tu última comida?</label>
                  <input type="time" value={formData.lastMeal} onChange={(e) => setFormData({...formData, lastMeal: e.target.value})} className="w-full p-4 border-2 border-gray-200 rounded-xl text-xl font-bold text-indigo-600 bg-white shadow-sm outline-none" />
                </div>
                <button onClick={nextStep} className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-all shadow-md">
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* TIPO DE DIETA */}
          {currentScreen === 'diet' && (
            <div className="animate-fade-in-up">
              <span className="text-indigo-600 text-xs font-bold uppercase tracking-widest block mb-1">Nutrición</span>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">¿Cómo prefieres alimentarte?</h2>
              <p className="text-gray-500 mb-6 text-sm">Adaptaremos el recetario según tu elección.</p>
              <div className="space-y-3">
                {[
                  { id: 'omnivore', title: '🥩 Omnívora', desc: 'Acceso a todo el recetario tradicional y proteico.' },
                  { id: 'vegetarian', title: '🧀 Vegetariana', desc: 'Sin carnes, con lácteos y huevos.' },
                  { id: 'vegan', title: '🌱 Vegana', desc: '100% basado en plantas, tofu y semillas.' }
                ].map((item) => (
                  <button key={item.id} onClick={() => handleSelect('dietType', item.id)} className={`${optionButtonClass} flex flex-col ${formData.dietType === item.id ? 'border-indigo-600 bg-indigo-50' : ''}`}>
                    <span className="font-bold text-gray-800 mb-1">{item.title}</span>
                    <span className="text-xs font-medium text-gray-500">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* HÁBITOS DE AGUA */}
          {currentScreen === 'water' && (
            <div className="animate-fade-in-up">
              <span className="text-indigo-600 text-xs font-bold uppercase tracking-widest block mb-1">Hidratación</span>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-6">¿Cuánta agua bebes al día?</h2>
              <div className="space-y-3">
                {[
                  { text: 'Solo bebo café o té', icon: '☕' },
                  { text: 'Unos 2 vasos', icon: '🚰' },
                  { text: 'Entre 2 y 6 vasos', icon: '💧' },
                  { text: 'Más de 6 vasos', icon: '🌊' }
                ].map((opcion) => (
                  <button key={opcion.text} onClick={() => handleSelect('water', opcion.text)} className={`${optionButtonClass} flex items-center`}>
                    <span className="text-2xl mr-4">{opcion.icon}</span>
                    <span>{opcion.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* RESUMEN Y CORREO */}
          {currentScreen === 'summary' && (
            <div className="animate-fade-in-up space-y-5">
              <div className="text-center">
                <span className="text-4xl mb-2 block">🎯</span>
                <h2 className="text-2xl font-extrabold text-gray-900">Tu plan personal está listo</h2>
                <p className="text-gray-500 text-xs mt-1">Hemos diseñado un sistema experto para tu meta.</p>
              </div>

              <div className="bg-indigo-50/60 border border-indigo-100 p-4 rounded-xl shadow-sm space-y-2 text-xs text-gray-700">
                <div className="flex justify-between font-bold text-indigo-900 border-b border-indigo-100 pb-2">
                  <span>Peso Actual ➔ Meta</span>
                  <span>{formData.weight || '85'} kg ➔ {formData.targetWeight || '75'} kg</span>
                </div>
                <div className="flex items-center gap-2 pt-1"><span>🟢</span> Objetivo: <b>{formData.goal || 'Tu objetivo'}</b></div>
                <div className="flex items-center gap-2"><span>👤</span> Edad: <b>{formData.age ? `${formData.age} años` : 'No especificada'}</b></div>
                <div className="flex items-center gap-2"><span>🏃‍♂️</span> Actividad: <b>{formData.hasActivity ? `${formData.activityType} (${formData.activityHours})` : 'Sedentario/a'}</b></div>
                {formData.goal === 'Bajar peso y mantenerme' && (
                  <div className="flex items-center gap-2"><span>⚡</span> Método: <b className="capitalize">{formData.weightLossMethod === 'fasting' ? 'Ayuno Intermitente' : 'Método Tradicional'}</b></div>
                )}
                <div className="flex items-center gap-2"><span>🥗</span> Dieta adaptada: <b className="capitalize">{formData.dietType}</b></div>
                <div className="flex items-center gap-2"><span>🤖</span> Asistencia 24/7 de Nutricionista IA y Coach Proactivo</div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Correo electrónico para enviarte el plan</label>
                <input type="email" placeholder="tucorreo@gmail.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full p-4 border-2 border-gray-200 rounded-xl text-base focus:border-indigo-600 outline-none shadow-sm transition-all" />
              </div>

              <button startAnalysis disabled={!formData.email || !formData.email.includes('@')} onClick={startAnalysis} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-sm uppercase tracking-wider py-4 rounded-xl disabled:opacity-50 transition-all shadow-lg">
                ¡VAMOS POR TU OBJETIVO! 🚀
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// Forzar actualización de onboarding
