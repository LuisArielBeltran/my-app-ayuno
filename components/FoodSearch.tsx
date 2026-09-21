'use client';
import { useState, useEffect } from 'react';

export default function FoodSearch() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedFood, setSelectedFood] = useState<any | null>(null);

  // Cada vez que el usuario escribe, consultamos a la API en tiempo real
  useEffect(() => {
    const fetchFoods = async () => {
      if (query.trim().length === 0) {
        setSuggestions([]);
        setSelectedFood(null);
        return;
      }

      try {
        const res = await fetch(`/api/food?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.foods) {
          setSuggestions(data.foods);
        }
      } catch (err) {
        console.error('Error en autocompletado:', err);
      }
    };

    const timer = setTimeout(fetchFoods, 300); // Pequeño retraso para optimizar peticiones
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative">
      <h2 className="text-lg font-bold text-gray-800 mb-3">🔍 Buscador Inteligente</h2>
      <p className="text-xs text-gray-500 mb-4">Escribe los primeros caracteres para ver sugerencias instantáneas:</p>

      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedFood(null);
          }}
          placeholder="Ej. ca, man, te..."
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
        />

        {/* Menú desplegable de sugerencias predictivas */}
        {suggestions.length > 0 && !selectedFood && (
          <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-xl mt-1 shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((food) => (
              <li
                key={food.id}
                onClick={() => {
                  setSelectedFood(food);
                  setQuery(food.food_name);
                  setSuggestions([]);
                }}
                className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-none flex justify-between items-center"
              >
                <span className="font-medium text-gray-700">{food.food_name}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${!food.breaks_fast ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {!food.breaks_fast ? 'Permitido' : 'Rompe ayuno'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Tarjeta de resultado seleccionado */}
      {selectedFood && (
        <div className={`mt-4 p-4 rounded-xl border ${!selectedFood.breaks_fast ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex justify-between items-center mb-1">
            <span className="font-bold text-gray-800">{selectedFood.food_name}</span>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${!selectedFood.breaks_fast ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
              {!selectedFood.breaks_fast ? 'PERMITIDO' : 'ROMPE AYUNO'}
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-2">{selectedFood.explanation}</p>
        </div>
      )}
    </div>
  );
}
