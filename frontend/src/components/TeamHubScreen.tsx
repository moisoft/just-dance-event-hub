import React from 'react';

interface TeamHubScreenProps {
  onBack: () => void;
}

const TeamHubScreen: React.FC<TeamHubScreenProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-purple-900 text-white p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md border border-purple-700 text-center">
        <h2 className="text-4xl font-bold mb-4 text-pink-400">Hub da Equipe</h2>
        <p className="text-lg text-gray-300 mb-6">
          Aqui você pode organizar suas danças em grupo!
        </p>
        <button
          onClick={onBack}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-300 text-xl"
        >
          Voltar para Seleção de Música
        </button>
      </div>
    </div>
  );
};

export default TeamHubScreen;