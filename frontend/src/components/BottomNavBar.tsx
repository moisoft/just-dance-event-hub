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
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 backdrop-blur-lg p-2 sm:p-3 rounded-t-3xl shadow-2xl border-t border-white/20 z-50" style={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}>
      <nav className="flex justify-around items-center max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.name;
          
          // Definir gradientes específicos para cada item do menu
          const gradients = {
            dashboard: 'from-pink-500 to-purple-600',
            music: 'from-cyan-500 to-blue-600',
            competitions: 'from-yellow-500 to-orange-600',
            settings: 'from-purple-500 to-indigo-600'
          };
          
          const gradient = gradients[item.name as keyof typeof gradients];
          
          return (
            <button
              key={item.name}
              onClick={() => onScreenChange(item.name as InEventScreen)}
              className={`flex flex-col items-center p-1 xs:p-2 rounded-xl transition-all duration-300 transform hover:scale-110
                ${isActive 
                  ? `bg-gradient-to-r ${gradient} text-white shadow-lg` 
                  : 'text-white/70 hover:text-white hover:bg-white/10'}`}
            >
              <Icon className={`w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 mb-1 ${isActive ? '' : 'opacity-70'}`} />
              <span className="text-xxs xs:text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default BottomNavBar;