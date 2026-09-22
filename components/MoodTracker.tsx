'use client';
import { useState, useEffect } from 'react';

export default function MoodTracker() {
  const [moodScore, setMoodScore] = useState<number | null>(null);
  const [energyLevel, setEnergyLevel] = useState<number>(5);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [isSaved, setIsSaved] = useState(false);

  const availableSymptoms = ['Dolor de cabeza', 'Claridad mental', 'Mucha hambre', 'Fatiga', 'Antojos dulces', 'Concentración alta'];
  const moods = [
    { score: 1, emoji: '😫', label: 'Agotado' },
    { score: 2, emoji: '😕', label: 'Regular' },
    { score: 3, emoji: '😐', label: 'Normal' },
    { score: 4, emoji: '🙂', label: 'Bien' },
    { score: 5, emoji: '🤩', label: 'Excelente' },
  ];

  useEffect(() => {
    const fetchMood = async () => {
      const email = localStorage.getItem('user_email');
      if (!email) return;

      try {
        const res = await fetch(`/api/mood?email=${encodeURIComponent(email)}`);
        const data = await res.json();
        if (data.mood) {
          setMoodScore(data.mood.mood_score);
          setEnergyLevel(data.mood.energy_level);
          setSelectedSymptoms(data.mood.symptoms ? data.mood.symptoms.split(',') : []);
          setIsSaved(true);
        }
      } catch (err) {
        console.error('Error cargando estado de ánimo:', err);
      }
    };
    fetchMood();
  }, []);

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom]
    );
    setIsSaved(false);
  };

  const handleSave = async () => {
    const email = localStorage.getItem('user_email');
    if (!email || !moodScore) return;

    try {
      await fetch('/api/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          moodScore,
          energyLevel,
          symptoms: selectedSymptoms.join(',')
        }),
      });
      setIsSaved(true);
    } catch (err) {
      console.error('Error guardando:', err);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-sm mx-auto mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-800">🧠 Diario Biológico</h2>
        {isSaved && <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">Guardado</span>}
      </div>

      {/* Selector de Ánimo */}
      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-2 font-medium">¿Cómo te sientes hoy?</p>
        <div className="flex justify-between">
          {moods.map(m => (
            <button
              key={m.score}
              onClick={() => { setMoodScore(m.score); setIsSaved(false); }}
              className={`text-3xl transition-transform ${moodScore === m.score ? 'scale-125 drop-shadow-md' : 'opacity-50 hover:opacity-100'}`}
              title={m.label}
            >
              {m.emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Selector de Energía */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2 font-medium">
          <span>Nivel de Energía</span>
          <span>{energyLevel}/10</span>
        </div>
        <input 
          type="range" min="1" max="10" 
          value={energyLevel}
          onChange={(e) => { setEnergyLevel(Number(e.target.value)); setIsSaved(false); }}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
      </div>

      {/* Etiquetas de Síntomas */}
      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-2 font-medium">Síntomas / Sensaciones</p>
        <div className="flex flex-wrap gap-2">
          {availableSymptoms.map(symp => (
            <button
              key={symp}
              onClick={() => toggleSymptom(symp)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                selectedSymptoms.includes(symp) 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              {symp}
            </button>
          ))}
        </div>
      </div>

      {!isSaved && moodScore && (
        <button 
          onClick={handleSave}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-md animate-fade-in-up"
        >
          Guardar Registro
        </button>
      )}
    </div>
  );
}
