
import React, { useState } from 'react';
import { Home } from './pages/Home';
import { CryingAnalyzer } from './pages/CryingAnalyzer';
import { FoodLens } from './pages/FoodLens';
import { AskExpert } from './pages/AskExpert';
import { Navigation } from './components/Navigation';
import { AppRoute } from './types';

const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(AppRoute.HOME);

  const renderPage = () => {
    switch (currentRoute) {
      case AppRoute.HOME:
        return <Home onNavigate={setCurrentRoute} />;
      case AppRoute.CRY_ANALYZER:
        return <CryingAnalyzer />;
      case AppRoute.FOOD_LENS:
        return <FoodLens />;
      case AppRoute.CHAT:
        return <AskExpert />;
      default:
        return <Home onNavigate={setCurrentRoute} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-gray-800">
      <main className="w-full">
        {renderPage()}
      </main>
      <Navigation currentRoute={currentRoute} onNavigate={setCurrentRoute} />
    </div>
  );
};

export default App;
