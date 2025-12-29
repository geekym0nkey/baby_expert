import React from 'react';
import { AppRoute } from '../types';
import { Activity, Moon, Sun, Baby } from 'lucide-react';

interface HomeProps {
  onNavigate: (route: AppRoute) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  return (
    <div className="px-6 py-8 pb-24 max-w-md mx-auto animate-fade-in">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-1">早安，媽媽</h1>
        <p className="text-gray-500">寶寶今天 3 個月又 12 天大了</p>
      </header>

      {/* Status Overview */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
          <div className="flex items-center gap-2 mb-2 text-blue-600">
            <Moon size={18} />
            <span className="font-semibold text-sm">上次睡眠</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">2<span className="text-sm font-normal text-gray-500">小時前</span></p>
        </div>
        <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
          <div className="flex items-center gap-2 mb-2 text-orange-600">
            <Sun size={18} />
            <span className="font-semibold text-sm">上次餵奶</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">45<span className="text-sm font-normal text-gray-500">分鐘前</span></p>
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-800 mb-4">今天需要幫忙嗎？</h2>
      
      <div className="space-y-4">
        <button 
          onClick={() => onNavigate(AppRoute.CRY_ANALYZER)}
          className="w-full bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 active:scale-95 transition-transform"
        >
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-500">
            <Activity size={24} />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-gray-800">寶寶在哭鬧？</h3>
            <p className="text-sm text-gray-500">AI 分析哭聲原因並提供安撫建議</p>
          </div>
        </button>

        <button 
          onClick={() => onNavigate(AppRoute.FOOD_LENS)}
          className="w-full bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 active:scale-95 transition-transform"
        >
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-500">
            <Baby size={24} />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-gray-800">可以吃這個嗎？</h3>
            <p className="text-sm text-gray-500">拍下食物，檢查是否適合寶寶</p>
          </div>
        </button>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">每日小知識</h2>
        <div className="bg-purple-50 p-5 rounded-2xl border border-purple-100">
          <p className="text-purple-900 font-medium mb-2">3-4個月發展里程碑</p>
          <p className="text-purple-700 text-sm leading-relaxed">
            這個階段的寶寶脖子變硬了，俯臥時可以抬頭90度。他們也開始會吃手手，這是自我安撫和探索世界的重要方式喔！
          </p>
        </div>
      </div>
    </div>
  );
};