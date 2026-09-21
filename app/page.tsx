// app/page.tsx
import FastingTimer from '@/components/FastingTimer';
import FoodSearch from '@/components/FoodSearch';
import WaterTracker from '@/components/WaterTracker';
import UserProfile from '@/components/UserProfile';
import InstructionsModal from '@/components/InstructionsModal';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <InstructionsModal />
      <div className="w-full max-w-md space-y-6 pb-12">
        <header className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Mi Ayuno</h1>
          <p className="text-sm text-gray-500 mt-1">Tu Asistente Interactivo de Nutrición</p>
        </header>

        {/* 0. Identificación del usuario */}
        <UserProfile />

        {/* 1. Cronómetro de Ayuno */}
        <FastingTimer protocolHours={16} />

        {/* 2. Buscador Inteligente de Alimentos */}
        <FoodSearch />

        {/* 3. Rastreador de Hidratación */}
        <WaterTracker />
      </div>
    </main>
  );
}
