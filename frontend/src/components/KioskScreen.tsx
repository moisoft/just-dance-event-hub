import React from 'react';

interface KioskScreenProps {
  onExitKioskMode: () => void;
}

const KioskScreen: React.FC<KioskScreenProps> = ({ onExitKioskMode }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-purple-900 text-white p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md border border-purple-700 text-center">
        <h2 className="text-4xl font-bold mb-4 text-pink-400">Modo Quiosque Ativo</h2>
        <p className="text-lg text-gray-300 mb-6">
          Este é o modo de exibição pública para o evento.
        </p>
        <p className="text-5xl font-extrabold text-cyan-400 mb-8 animate-pulse">
          JUST DANCE EVENT HUB
        </p>
        <button
          onClick={onExitKioskMode}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-300 text-xl"
        >
          Sair do Modo Quiosque
        </button>
      </div>
    </div>
  );
};

export default KioskScreen;