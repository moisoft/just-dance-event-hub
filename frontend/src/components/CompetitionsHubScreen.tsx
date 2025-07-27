import React from 'react';
import { Tournament } from '../types';
import { mockTournaments } from '../data/mockData';

interface CompetitionsHubScreenProps {
  onSelectTournament: (tournament: Tournament) => void;
}

const CompetitionsHubScreen: React.FC<CompetitionsHubScreenProps> = ({ onSelectTournament }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 text-white p-4 pt-16 pb-20">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-8 text-pink-400">Competições</h2>

        <div className="space-y-6">
          {mockTournaments.map((tournament) => (
            <div
              key={tournament.id}
              className="bg-gray-800 p-6 rounded-lg shadow-lg border border-purple-700 flex flex-col md:flex-row justify-between items-center"
            >
              <div>
                <h3 className="text-2xl font-semibold text-cyan-400 mb-2">{tournament.name}</h3>
                <p className="text-gray-300 mb-1">Status: <span className="font-bold">{tournament.status}</span></p>
                <p className="text-gray-400 text-sm">Início: {new Date(tournament.start_time).toLocaleString()}</p>
              </div>
              {tournament.status === 'Open for Registration' ? (
                <button
                  onClick={() => onSelectTournament(tournament)}
                  className="mt-4 md:mt-0 bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-5 rounded-lg transition-colors duration-300 text-lg"
                >
                  Registrar
                </button>
              ) : (
                <span className="mt-4 md:mt-0 text-gray-500 italic text-lg">{tournament.status}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompetitionsHubScreen;