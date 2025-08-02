import React, { useState, useEffect } from 'react';
import { Tournament, Event } from '../types';
import { adminApi } from '../api/api';

interface ManageTournamentsScreenProps {
  onBack: () => void;
}

const ManageTournamentsScreen: React.FC<ManageTournamentsScreenProps> = ({ onBack }) => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTournament, setCurrentTournament] = useState<Partial<Tournament>>({});
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [tournamentsResponse, eventsResponse] = await Promise.all([
        adminApi.tournament.getTournaments(),
        adminApi.event.getEvents()
      ]);

      if (tournamentsResponse.success) {
        setTournaments(tournamentsResponse.data as Tournament[] || []);
      }

      if (eventsResponse.success) {
        setEvents(eventsResponse.data as Event[] || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTournament = () => {
    setCurrentTournament({});
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditTournament = (tournament: Tournament) => {
    setCurrentTournament({ ...tournament });
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDeleteTournament = async (tournamentId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este torneio?')) return;

    try {
      const response = await adminApi.tournament.deleteTournament(tournamentId);
      if (response.success) {
        await loadData();
      } else {
        console.error('Erro ao excluir torneio:', response.error);
      }
    } catch (error) {
      console.error('Erro ao excluir torneio:', error);
    }
  };

  const handleSaveTournament = async () => {
    try {
      let response;

      if (modalMode === 'create') {
        response = await adminApi.tournament.createTournament(currentTournament);
      } else {
        response = await adminApi.tournament.updateTournament(currentTournament.id!, currentTournament);
      }

      if (response.success) {
        setIsModalOpen(false);
        await loadData();
      } else {
        console.error('Erro ao salvar torneio:', response.error);
      }
    } catch (error) {
      console.error('Erro ao salvar torneio:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentTournament(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentTournament(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const getEventName = (eventId?: string) => {
    if (!eventId) return 'Sem evento';
    const event = events.find(e => e.id === eventId);
    return event ? event.name : 'Evento não encontrado';
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'inscricoes':
      case 'Open for Registration':
        return 'Inscrições Abertas';
      case 'em_andamento':
      case 'Coming Soon':
        return 'Em Andamento';
      case 'finalizado':
      case 'Closed':
        return 'Finalizado';
      default:
        return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'inscricoes':
      case 'Open for Registration':
        return 'bg-blue-100 text-blue-800';
      case 'em_andamento':
      case 'Coming Soon':
        return 'bg-yellow-100 text-yellow-800';
      case 'finalizado':
      case 'Closed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 text-white p-4 pt-16 pb-20">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-8 text-pink-400">Gerenciar Torneios</h2>

        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={handleCreateTournament}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
          >
            Criar Novo Torneio
          </button>

          <button
            onClick={onBack}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
          >
            Voltar
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Evento</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Participantes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {tournaments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-400">
                      Nenhum torneio encontrado
                    </td>
                  </tr>
                ) : (
                  tournaments.map((tournament) => (
                    <tr key={tournament.id} className="hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-pink-300">{tournament.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{getEventName(tournament.event_id)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(tournament.status)}`}>
                          {getStatusLabel(tournament.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {tournament.registered_players?.length || 0} / {tournament.max_participants}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditTournament(tournament)}
                          className="text-indigo-400 hover:text-indigo-300 mr-3"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteTournament(tournament.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal para criar/editar torneio */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-pink-400 mb-4">
                {modalMode === 'create' ? 'Criar Novo Torneio' : 'Editar Torneio'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="name">
                    Nome do Torneio
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={currentTournament.name || ''}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="event_id">
                    Evento
                  </label>
                  <select
                    id="event_id"
                    name="event_id"
                    value={currentTournament.event_id || ''}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    <option value="">Selecione um evento</option>
                    {events.map(event => (
                      <option key={event.id} value={event.id}>{event.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="status">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={currentTournament.status || 'Open for Registration'}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Open for Registration">Inscrições Abertas</option>
                    <option value="Coming Soon">Em Andamento</option>
                    <option value="Closed">Finalizado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="max_participants">
                    Número Máximo de Participantes
                  </label>
                  <input
                    type="number"
                    id="max_participants"
                    name="max_participants"
                    value={currentTournament.max_participants || ''}
                    onChange={handleNumberInputChange}
                    min="2"
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="start_time">
                    Data e Hora de Início
                  </label>
                  <input
                    type="datetime-local"
                    id="start_time"
                    name="start_time"
                    value={currentTournament.start_time || ''}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveTournament}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageTournamentsScreen;