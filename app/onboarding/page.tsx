'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Memoria temporal del cuestionario (incluyendo el email)
  const [formData, setFormData] = useState({
    goal: '',
    gender: '',
    height: '',
    weight: '',
    targetWeight: '',
    water: '',
    email: ''
  });

  const totalSteps = 6;
  const progress = (step / totalSteps) * 100;

  const handleSelect = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    setTimeout(() => nextStep(), 300);
  };

  const nextStep = () => {
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
          // Redirigir al registro para que establezca su contraseña segura, 
          // llevando ya precargado su correo del onboarding
          router.push(`/register?email=${encodeURIComponent(formData.email)}`);
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Analizando parámetros...</h2>
        <p className="text-gray-500">Diseñando tu plan de acción personalizado basado en tus respuestas.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white md:bg-gray-50">
      <div className="max-w-md mx-auto md:mt-10 min-h-screen md:min-h-0 bg-white md:rounded-2xl md:shadow-lg overflow-hidden flex flex-col">
        
        {/* Header y Barra de Progreso */}
        <div className="px-6 pt-6 pb-2">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevStep} disabled={step === 1} className={`text-gray-400 hover:text-gray-800 ${step === 1 ? 'invisible' : ''}`}>
              ← Volver
            </button>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mi Perfil</span>
            <div className="w-10"></div>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-indigo-600 h-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        {/* Contenido Dinámico */}
        <div className="flex-1 px-6 py-8 overflow-y-auto">
          
          {step === 1 && (
            <div className="animate-fade-in-up">
              <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Para empezar, cuéntanos qué quieres lograr:</h2>
              <div className="space-y-3">
                {['Bajar peso y mantenerme', 'Ganar masa muscular', 'Retrasar el envejecimiento', 'Desintoxicación celular'].map((opcion) => (
                  <button key={opcion} onClick={() => handleSelect('goal', opcion)} className="w-full text-left p-4 rounded-xl border-2 border-gray-100 hover:border-indigo-600 hover:bg-indigo-50 transition-all font-medium text-gray-700">
                    {opcion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
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

          {step === 3 && (
            <div className="animate-fade-in-up">
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Tus medidas actuales</h2>
              <p className="text-gray-500 mb-6 text-sm">Usaremos estos datos para determinar el ritmo al que te conviene avanzar.</p>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Altura (cm)</label>
                  <input type="number" placeholder="Ej. 175" value={formData.height} onChange={(e) => setFormData({...formData, height: e.target.value})} className="w-full p-4 border-2 border-gray-200 rounded-xl text-xl focus:border-indigo-600 focus:ring-0 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Peso actual (kg)</label>
                  <input type="number" placeholder="Ej. 85" value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} className="w-full p-4 border-2 border-gray-200 rounded-xl text-xl focus:border-indigo-600 focus:ring-0 outline-none transition-all" />
                </div>
                <button onClick={nextStep} disabled={!formData.height || !formData.weight} className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all">
                  Continuar
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="animate-fade-in-up">
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">¿Cuál es tu peso objetivo?</h2>
              <div className="bg-green-50 p-4 rounded-xl border border-green-100 mb-6">
                <p className="text-sm text-green-800 font-medium">💡 Perder un 5% de tu peso corporal ya mejora significativamente la presión arterial y la energía diaria.</p>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Peso meta (kg)</label>
                  <input type="number" placeholder="Ej. 75" value={formData.targetWeight} onChange={(e) => setFormData({...formData, targetWeight: e.target.value})} className="w-full p-4 border-2 border-gray-200 rounded-xl text-xl focus:border-indigo-600 focus:ring-0 outline-none transition-all" />
                </div>
                <button onClick={nextStep} disabled={!formData.targetWeight} className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all">
                  Siguiente
                </button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="animate-fade-in-up">
              <div className="w-full h-40 bg-gray-100 rounded-xl mb-6 flex items-center justify-center text-4xl">💧</div>
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

          {step === 6 && (
            <div className="animate-fade-in-up">
              <span className="text-5xl mb-4 block text-center">✉️</span>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2 text-center">¿Dónde enviamos tu plan?</h2>
              <p className="text-gray-500 mb-6 text-sm text-center">Introduce tu correo electrónico para guardar tus resultados y ver tu proyección personalizada.</p>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Correo electrónico</label>
                  <input 
                    type="email" 
                    placeholder="tucorreo@gmail.com" 
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                    className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg focus:border-indigo-600 focus:ring-0 outline-none transition-all" 
                  />
                </div>
                <button onClick={nextStep} disabled={!formData.email || !formData.email.includes('@')} className="w-full bg-indigo-600 text-white font-bold text-lg py-4 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg">
                  Generar mi plan personalizado
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
