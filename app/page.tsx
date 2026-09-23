import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col justify-between py-10 px-4">
      <div className="max-w-4xl mx-auto w-full space-y-12 my-auto text-center">
        <div className="space-y-4">
          <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Tu Coach Metabólico Personal
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight">
            Domina el Ayuno Intermitente <span className="text-indigo-600">con Ciencia y Bienestar</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Controla tus ventanas de ayuno, realiza seguimiento de tu evolución de peso, hidrátate correctamente y resuelve tus dudas al instante con nuestro validador regional de alimentos.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/onboarding" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-lg transition-all">
            Comenzar mi Test Gratuito 🚀
          </Link>
          <Link href="/login" className="bg-white border-2 border-gray-200 hover:border-indigo-600 text-gray-800 font-bold text-lg px-8 py-4 rounded-2xl shadow-sm transition-all">
            Ya tengo cuenta (Iniciar Sesión)
          </Link>
        </div>

        {/* Tarjetas de Características */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 text-left">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-2">
            <span className="text-2xl">🔥</span>
            <h3 className="font-bold text-gray-900">Cronómetro & Rachas</h3>
            <p className="text-xs text-gray-500">Sincroniza tus horas de ayuno en tiempo real y mantén alta tu motivación con rachas diarias.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-2">
            <span className="text-2xl">🔍</span>
            <h3 className="font-bold text-gray-900">Validador Regional</h3>
            <p className="text-xs text-gray-500">Descubre al instante si el mate, la panela, el cortado o cualquier infusión rompen tu ayuno.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-2">
            <span className="text-2xl">📈</span>
            <h3 className="font-bold text-gray-900">Evolución Corporal</h3>
            <p className="text-xs text-gray-500">Visualiza tu progreso a través de gráficas limpias en SVG frente a tu meta de peso objetivo.</p>
          </div>
        </div>
      </div>

      <footer className="text-center text-xs text-gray-400 pt-10">
        AyunoApp • Diseñado para transformar tus hábitos metabólicos de forma saludable.
      </footer>
    </div>
  );
}
