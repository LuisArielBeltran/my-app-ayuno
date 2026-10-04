'use client';
import { useState } from 'react';
import { compressAndResizeImage } from '@/lib/imageUtils';

export default function FoodAnalyzer({ email }: { email: string }) {
  const [loading, setLoading] = useState(false);
  const [analysisText, setAnalysisText] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Mostrar previsualización local en el dispositivo del usuario
    setPreview(URL.createObjectURL(file));
    setLoading(true);
    setAnalysisText(null);

    try {
      // 1. Comprimir y reducir la imagen en el cliente (< 720x720)
      const compressedBase64 = await compressAndResizeImage(file);

      // 2. Enviar a la API de análisis de IA incluyendo el email y la imagen optimizada
      const res = await fetch('/api/ai/analyze-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          imageBase64: compressedBase64,
          email: email || (typeof window !== 'undefined' ? localStorage.getItem('user_email') : '') || 'usuario@ayuno.com'
        }),
      });

      const data = await res.json();
      if (data.success) {
        setAnalysisText(data.reply || data.text);
      } else {
        alert('Error al analizar la imagen: ' + (data.error || data.reply));
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Ocurrió un error al procesar la foto.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-sm mx-auto mb-6">
      <div className="mb-4 text-center">
        <h2 className="text-lg font-bold text-gray-800">📸 Nutricionista IA</h2>
        <p className="text-xs text-gray-500">Sube o fotografía tu plato para analizarlo con tu coach</p>
      </div>

      {/* Botón de Cámara / Selector de Archivos */}
      <label className="flex flex-col items-center justify-center border-2 border-dashed border-indigo-200 rounded-xl p-4 bg-indigo-50/50 cursor-pointer hover:bg-indigo-50 transition-colors">
        <span className="text-2xl mb-1">📷</span>
        <span className="text-xs font-bold text-indigo-600">Tomar foto o seleccionar plato</span>
        <input 
          type="file" 
          accept="image/*" 
          capture="environment" 
          className="hidden" 
          onChange={handleFileChange} 
        />
      </label>

      {/* Previsualización local */}
      {preview && (
        <div className="mt-4">
          <img src={preview} alt="Plato seleccionado" className="w-full h-40 object-cover rounded-xl border" />
        </div>
      )}

      {/* Estado de Carga */}
      {loading && (
        <div className="text-center py-6 text-xs text-indigo-600 font-semibold animate-pulse">
          Optimizando imagen y analizando composición metabólica con IA...
        </div>
      )}

      {/* Resultado de la IA */}
      {analysisText && (
        <div className="mt-4 p-4 rounded-xl border bg-indigo-50 border-indigo-200 text-indigo-900">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🤖</span>
            <span className="font-bold text-xs uppercase tracking-wider">
              Análisis del Coach IA
            </span>
          </div>
          <p className="text-xs leading-relaxed whitespace-pre-line">{analysisText}</p>
        </div>
      )}
    </div>
  );
}
