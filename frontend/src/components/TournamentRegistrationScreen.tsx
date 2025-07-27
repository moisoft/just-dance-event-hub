import React from 'react';
import { Tournament, User } from '../types';

interface TournamentRegistrationScreenProps {
  tournament: Tournament;
  user: User;
  onRegister: (tournamentId: string) => void;
  onBack: () => void;
}

const TournamentRegistrationScreen: React.FC<TournamentRegistrationScreenProps> = ({
  tournament,
  user,
  onRegister,
  onBack,
}) => {
  const isRegistered = tournament.registered_players.includes(user.id);

  const handleRegister = () => {
    if (!isRegistered) {
      onRegister(tournament.id);
    } else {
      alert('Você já está registrado neste torneio!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 text-white p-4 pt-16 pb-20">
      <div className="max-w-md mx-auto bg-gray-800 p-8 rounded-lg shadow-lg border border-purple-700 text-center">
        <h2 className="text-3xl font-bold mb-4 text-pink-400">Registrar para Torneio</h2>
        <h3 className="text-2xl font-semibold text-cyan-400 mb-3">{tournament.name}</h3>
        <p className="text-gray-300 mb-2">Status: <span className="font-bold">{tournament.status}</span></p>
        <p className="text-gray-300 mb-6">Início: {new Date(tournament.start_time).toLocaleString()}</p>

        {isRegistered ? (
          <p className="text-green-400 text-xl font-bold mb-6">Você já está registrado!</p>
        ) : (
          <button
            onClick={handleRegister}
            className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-300 text-lg mb-4"
            disabled={tournament.status !== 'Open for Registration'}
          >
            {tournament.status === 'Open for Registration' ? 'Confirmar Inscrição' : 'Inscrições Fechadas'}
          </button>
        )}

        <button
          onClick={onBack}
          className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-300 text-lg"
        >
          Voltar para Competições
        </button>
      </div>
    </div>
  );
};

export default TournamentRegistrationScreen;