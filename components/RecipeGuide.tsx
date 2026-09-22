'use client';
import { useState, useEffect } from 'react';

export default function RecipeGuide() {
  const [recipes, setRecipes] = useState<any[]>([]);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const res = await fetch('/api/recipes');
        const data = await res.json();
        if (data.recipes) setRecipes(data.recipes);
      } catch (err) {
        console.error('Error cargando recetas:', err);
      }
    };
    fetchRecipes();
  }, []);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-sm mx-auto mb-6">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-800">🥗 Guía de Recetas</h2>
        <p className="text-xs text-gray-500">Nutrición inteligente</p>
      </div>
      
      <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
        {recipes.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">Cargando recetas...</p>
        ) : (
          recipes.map(recipe => (
            <div key={recipe.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{recipe.icon_symbol}</span>
                <h3 className="text-sm font-bold text-gray-800">{recipe.title}</h3>
              </div>
              
              <div className="flex flex-wrap gap-2 text-[10px] mb-3">
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">{recipe.category}</span>
                <span className="text-gray-500 font-medium px-2 py-1 bg-white border border-gray-100 rounded-full">⏱️ {recipe.prep_time} min</span>
                <span className="text-gray-500 font-medium px-2 py-1 bg-white border border-gray-100 rounded-full">🔥 {recipe.calories} kcal</span>
              </div>
              
              <p className="text-xs text-gray-600 mb-2"><strong>Ingredientes:</strong> {recipe.ingredients}</p>
              <p className="text-xs text-gray-600 line-clamp-2 hover:line-clamp-none transition-all"><strong>Preparación:</strong> {recipe.instructions}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
