'use client';

export default function RecipeGuide() {
  const recipes = [
    {
      id: 1,
      category: 'Ideal para Romper Ayuno',
      title: 'Omelette de Espinaca y Palta',
      macros: 'Grasas saludables y Proteína',
      impact: 'Bajo impacto insulínico',
      icon: '🍳',
      desc: 'Evita el pico de azúcar en sangre. Los huevos aportan proteína de alta calidad para mantener la masa muscular, y la palta grasas que prolongan la saciedad por horas.'
    },
    {
      id: 2,
      category: 'Ayunos Largos (+16h)',
      title: 'Caldo de Huesos Nutritivo',
      macros: 'Colágeno y Minerales',
      impact: 'Reparación intestinal',
      icon: '🍲',
      desc: 'Perfecto si hiciste un ayuno profundo. Prepara tu sistema digestivo de forma muy suave, repone los electrolitos perdidos y ayuda a sellar la pared intestinal.'
    },
    {
      id: 3,
      category: 'Comida Principal',
      title: 'Pollo al Horno con Vegetales Fibrosos',
      macros: 'Alta Proteína y Fibra',
      impact: 'Nutrición completa',
      icon: '🥗',
      desc: 'Una excelente opción para la mitad de tu ventana de alimentación. La fibra de los vegetales (brócoli, espárragos) ralentiza la absorción de los nutrientes.'
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block mb-1">Módulo de Nutrición</span>
          <h3 className="text-xl font-bold text-gray-900">¿Cómo romper el ayuno?</h3>
          <p className="text-sm text-gray-500 mt-1">Opciones estratégicas para no disparar tu insulina.</p>
        </div>
        <span className="text-4xl">🥑</span>
      </div>

      <div className="space-y-4">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="border border-gray-100 rounded-xl p-4 md:p-5 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="text-4xl bg-gray-50 p-3 rounded-xl border border-gray-100 shrink-0">
                {recipe.icon}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-full inline-block mb-2">
                  {recipe.category}
                </span>
                <h4 className="text-lg font-bold text-gray-900">{recipe.title}</h4>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">{recipe.desc}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-md">
                    ✓ {recipe.macros}
                  </span>
                  <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-1 rounded-md">
                    ⚡ {recipe.impact}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-400">💡 La regla de oro: rompe el ayuno con proteínas y grasas, y deja los carbohidratos para tu última comida.</p>
      </div>
    </div>
  );
}
