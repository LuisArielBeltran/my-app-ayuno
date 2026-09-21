'use client';
import { useState, useEffect } from 'react';

export default function InstructionsModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // Al cargar la página, revisamos si el usuario ya pidió ocultarlo
  useEffect(() => {
    const hide = localStorage.getItem('hideInstructions');
    if (hide !== 'true') {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('hideInstructions', 'true');
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-fade-in-up">
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Bienvenido a tu Guía!</h2>
        <p className="text-gray-500 mb-6 text-sm">Sigue estos pasos para sacarle el máximo provecho a tu ayuno:</p>
        
        <div className="space-y-4 text-gray-700 text-sm mb-6">
          <div className="bg-gray-50 p-3 rounded-lg">
            <strong>👤 1. Identificación:</strong> Ingresa tu email y presiona Guardar. Así la app te reconocerá mañana y guardará tu progreso de hidratación.
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <strong>⏱️ 2. Cronómetro:</strong> Toca "Iniciar Ayuno" justo después de tu última comida. Toca "Romper" al día siguiente en tu primera comida.
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <strong>🔍 3. Buscador Inteligente:</strong> Si tienes dudas sobre qué beber durante tu ayuno (ej. Café, Té, Jugo), escríbelo aquí y te diremos si corta el ayuno.
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <strong>💧 4. Hidratación:</strong> Toca un vaso de agua por cada 250ml que bebas para alcanzar tu meta de 2 litros y evitar la deshidratación.
          </div>
        </div>
        
        <label className="flex items-center space-x-3 text-sm text-gray-600 mb-6 cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors">
          <input 
            type="checkbox" 
            checked={dontShowAgain} 
            onChange={(e) => setDontShowAgain(e.target.checked)}
            className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
          />
          <span className="font-medium">No volver a mostrar esta guía</span>
        </label>

        <button 
          onClick={handleClose}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-md"
        >
          ¡Entendido, a empezar!
        </button>
      </div>
    </div>
  );
}
