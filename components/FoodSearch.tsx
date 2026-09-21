'use client';

import { useState, useEffect } from 'react';

// Definimos la estructura del alimento
interface Food {
  id: number;
  name: string;
  breaksFast: boolean;
}

export default function FoodSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Food[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFoods = async () => {
      if (searchTerm.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/food?q=${encodeURIComponent(searchTerm)}`);
        const data = await response.json();
        if (data.foods) {
          setResults(data.foods);
        }
      } catch (error) {
        console.error("Error fetching foods", error);
      }
      setLoading(false);
    };

    // Debounce: espera 300ms después de que el usuario deja de escribir para no saturar la base de datos
    const delayDebounceFn = setTimeout(() => {
      fetchFoods();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-sm mx-auto mt-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">¿Rompe el ayuno?</h3>
      
      <input 
        type="text" 
        placeholder="Buscar alimento (ej. Café)..." 
        className="w-full p-3 border border-gray-200 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {loading && <p className="text-sm text-gray-500 text-center">Buscando...</p>}

      <ul className="space-y-3">
        {!loading && results.map(food => (
          <li key={food.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="font-medium text-gray-700">{food.name}</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${food.breaksFast ? 'bg-red-500' : 'bg-green-500'}`}>
              {food.breaksFast ? 'Rompe ayuno' : 'Permitido'}
            </span>
          </li>
        ))}
        {!loading && searchTerm.length >= 2 && results.length === 0 && (
          <p className="text-sm text-gray-500 text-center">No se encontró el alimento en la base de datos.</p>
        )}
      </ul>
    </div>
  );
}