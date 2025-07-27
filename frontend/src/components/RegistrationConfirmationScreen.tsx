import React from 'react';
import { Tournament } from '../types';

interface RegistrationConfirmationScreenProps {
  tournament: Tournament;
  onBackToCompetitions: () => void;
}

const RegistrationConfirmationScreen: React.FC<RegistrationConfirmationScreenProps> = ({
  tournament,
  onBackToCompetitions,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 text-white p-4 pt-16 pb-20">
      <div className="max-w-md mx-auto bg-gray-800 p-8 rounded-lg shadow-lg border border-purple-700 text-center">
        <h2 className="text-3xl font-bold mb-4 text-green-400">Inscrição Confirmada!</h2>
        <p className="text-gray-300 text-lg mb-6">
          Você se registrou com sucesso para o torneio:
        </p>
        <h3 className="text-2xl font-semibold text-cyan-400 mb-3">{tournament.name}</h3>
        <p className="text-gray-300 mb-6">
          O torneio começa em: <span className="font-bold">{new Date(tournament.start_time).toLocaleString()}</span>
        </p>
        <button
          onClick={onBackToCompetitions}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-300 text-lg"
        >
          Voltar para Competições
        </button>
      </div>
    </div>
  );
};

export default RegistrationConfirmationScreen;