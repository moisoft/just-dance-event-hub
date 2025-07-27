import React from 'react';
import { HomeIcon, MusicalNoteIcon, TrophyIcon, CogIcon } from '@heroicons/react/24/solid';
import { InEventScreen } from '../types';

interface BottomNavBarProps {
  activeScreen: InEventScreen;
  onScreenChange: (screen: InEventScreen) => void;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeScreen, onScreenChange }) => {
  const navItems = [
    { name: 'dashboard', icon: HomeIcon, label: 'Início' },
    { name: 'music', icon: MusicalNoteIcon, label: 'Música' },
    { name: 'competitions', icon: TrophyIcon, label: 'Competições' },
    { name: 'settings', icon: CogIcon, label: 'Configurações' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 bg-opacity-90 backdrop-blur-sm p-3 rounded-t-3xl shadow-lg border-t border-purple-700 z-50">
      <nav className="flex justify-around items-center max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.name;
          return (
            <button
              key={item.name}
              onClick={() => onScreenChange(item.name as InEventScreen)}
              className={`flex flex-col items-center p-2 rounded-xl transition-all duration-300
                ${isActive ? 'text-pink-400 bg-purple-900' : 'text-gray-400 hover:text-cyan-400 hover:bg-gray-700'}`}
            >
              <Icon className="w-7 h-7 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default BottomNavBar;