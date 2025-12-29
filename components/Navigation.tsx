import React from 'react';
import { Home, Mic, Camera, MessageCircleHeart } from 'lucide-react';
import { AppRoute } from '../types';

interface NavigationProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentRoute, onNavigate }) => {
  const navItems = [
    { route: AppRoute.HOME, label: '首頁', icon: Home },
    { route: AppRoute.CRY_ANALYZER, label: '哭聲翻譯', icon: Mic },
    { route: AppRoute.FOOD_LENS, label: '副食品鏡頭', icon: Camera },
    { route: AppRoute.CHAT, label: '育兒顧問', icon: MessageCircleHeart },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe-area pt-2 px-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
      <div className="flex justify-between items-center max-w-md mx-auto pb-4">
        {navItems.map((item) => {
          const isActive = currentRoute === item.route;
          return (
            <button
              key={item.route}
              onClick={() => onNavigate(item.route)}
              className={`flex flex-col items-center justify-center w-16 transition-all duration-200 ${
                isActive ? 'text-orange-400 scale-105' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <item.icon
                size={isActive ? 28 : 24}
                strokeWidth={isActive ? 2.5 : 2}
                className="mb-1"
              />
              <span className={`text-[10px] font-medium ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};