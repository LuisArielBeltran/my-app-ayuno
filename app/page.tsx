export const dynamic = 'force-dynamic';

import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col justify-between py-10 px-4">
      <div className="max-w-5xl mx-auto w-full space-y-10 my-auto text-center">

        {/* Encabezados Principales */}
        <div className="space-y-6">
          <span className="bg-indigo-600 text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
            TIENES EL CONTROL
          </span>

          <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tight leading-tight">
            Tu Coach Personal <br />
            <span className="text-indigo-600 text-3xl md:text-5xl mt-3 block">te ayuda a obtener los resultados que necesitas.</span>
          </h1>

          <p className="text-xl md:text-2xl font-bold text-gray-800 pt-2">
            Domina el Ayuno Intermitente entre otros con Ciencia y Bienestar
          </p>

          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Controla tus ventanas de ayuno, realiza seguimiento de tu evolución de peso, hidrátate correctamente y resuelve tus dudas al instante con nuestro ayudante online virtual, es un experto en acompañamiento y recomendación.
          </p>

          {/* Banner Promocional - 7 Días Gratis */}
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-5 rounded-2xl max-w-3xl mx-auto mt-6 shadow-sm">
            <p className="font-medium text-sm md:text-base">
              🎁 Tienes <strong className="font-black text-emerald-600 text-lg">7 días totalmente gratis</strong> para gozar de todos los beneficios del programa, luego te invitaremos a continuar con tu programa y te ayudaremos para que alcances todos tus objetivos.
            </p>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <Link href="/onboarding" className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-lg px-8 py-4 rounded-2xl shadow-lg transition-all hover:shadow-xl transform hover:-translate-y-1">
            Comenzar mi Test Gratuito 🚀
          </Link>
          <Link href="/login" className="bg-white border-2 border-gray-200 hover:border-indigo-600 text-gray-800 font-extrabold text-lg px-8 py-4 rounded-2xl shadow-sm transition-all hover:bg-gray-50">
            Ya tengo cuenta (Iniciar Sesión)
          </Link>
        </div>

        {/* Lista de Beneficios del Programa */}
        <div className="pt-12">
          <h3 className="text-2xl font-black text-gray-900 mb-8">Todo lo que incluye tu programa</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3 hover:border-indigo-300 transition-all hover:shadow-md">
              <span className="text-4xl">🤖</span>
              <h4 className="font-bold text-gray-900 text-lg">Coach Virtual 24/7</h4>
              <p className="text-xs text-gray-500 leading-relaxed">Un experto online virtual siempre disponible para guiarte, motivarte y responder tus dudas al instante.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3 hover:border-indigo-300 transition-all hover:shadow-md">
              <span className="text-4xl">⏱</span>
              <h4 className="font-bold text-gray-900 text-lg">Control de Ayuno</h4>
              <p className="text-xs text-gray-500 leading-relaxed">Cronómetro inteligente para tus ventanas metabólicas, adaptado a tu plan personalizado.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3 hover:border-indigo-300 transition-all hover:shadow-md">
              <span className="text-4xl">📸</span>
              <h4 className="font-bold text-gray-900 text-lg">Análisis de Alimentos</h4>
              <p className="text-xs text-gray-500 leading-relaxed">Conoce qué puedes comer o beber sin romper el ayuno gracias a la validación por IA.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3 hover:border-indigo-300 transition-all hover:shadow-md">
              <span className="text-4xl">📈</span>
              <h4 className="font-bold text-gray-900 text-lg">Evolución Médica</h4>
              <p className="text-xs text-gray-500 leading-relaxed">Seguimiento detallado de tu peso y cálculo dinámico de la hidratación que necesita tu cuerpo.</p>
            </div>

          </div>
        </div>

      </div>

      <footer className="text-center text-xs text-gray-400 pt-12 pb-4">
        TIENES EL CONTROL • Diseñado para transformar tus hábitos con ciencia y bienestar.
      </footer>
    </div>
  );
}