import FastingTimer from '@/components/FastingTimer';
import FoodSearch from '@/components/FoodSearch';
import WaterTracker from '@/components/WaterTracker';
import UserProfile from '@/components/UserProfile';
import InstructionsModal from '@/components/InstructionsModal';
import UserDashboard from '@/components/UserDashboard';
import RecipeGuide from '@/components/RecipeGuide';
import MoodTracker from '@/components/MoodTracker';
import LearningCenter from '@/components/LearningCenter';
import CommunityCircles from '@/components/CommunityCircles';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <InstructionsModal />
      <div className="w-full max-w-md mx-auto space-y-6 pb-12">
        <header className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Mi Ayuno</h1>
          <p className="text-sm text-gray-500 mt-1">Ecosistema Nutricional Integral</p>
        </header>

        <UserProfile />
        <UserDashboard />
        
        <FastingTimer />
        <RecipeGuide />
        <MoodTracker />
        <CommunityCircles />
        <LearningCenter />
        
        <FoodSearch />
        <WaterTracker />
      </div>
    </main>
  );
}

