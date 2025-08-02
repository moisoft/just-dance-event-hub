import React, { useState, useEffect } from 'react';
import { Competition, Event } from '../types';
import { adminApi } from '../api/api';

interface ManageCompetitionsScreenProps {
  onBack: () => void;
}

const ManageCompetitionsScreen: React.FC<ManageCompetitionsScreenProps> = ({ onBack }) => {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCompetition, setCurrentCompetition] = useState<Partial<Competition>>({});
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Carregar competições
      const competitionsResponse = await adminApi.getCompetitions();
      if (competitionsResponse.success) {
        setCompetitions(competitionsResponse.data as Competition[]);
      } else {
        console.error('Erro ao carregar competições:', competitionsResponse.error);
      }

      // Carregar eventos para associar às competições
      const eventsResponse = await adminApi.getEvents();
      if (eventsResponse.success) {
        setEvents(eventsResponse.data as Event[]);
      } else {
        console.error('Erro ao carregar eventos:', eventsResponse.error);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCompetition = () => {
    setCurrentCompetition({});
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditCompetition = (competition: Competition) => {
    setCurrentCompetition({ ...competition });
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDeleteCompetition = async (competitionId: number) => {
    if (!window.confirm('Tem certeza que deseja excluir esta competição?')) return;

    try {
      const response = await adminApi.deleteCompetition(String(competitionId));
      if (response.success) {
        await loadData();
      } else {
        console.error('Erro ao excluir competição:', response.error);
      }
    } catch (error) {
      console.error('Erro ao excluir competição:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentCompetition(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveCompetition = async () => {
    try {
      let response;
      if (modalMode === 'create') {
        response = await adminApi.createCompetition(currentCompetition as Competition);
      } else {
        response = await adminApi.updateCompetition(String(currentCompetition.id!), currentCompetition as Competition);
      }

      if (response.success) {
        setIsModalOpen(false);
        await loadData();
      } else {
        console.error('Erro ao salvar competição:', response.error);
      }
    } catch (error) {
      console.error('Erro ao salvar competição:', error);
    }
  };

  const getEventName = (eventId: number) => {
    const event = events.find(e => Number(e.id) === eventId);
    return event ? event.name : 'Evento não encontrado';
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open':
        return 'Aberta';
      case 'in_progress':
        return 'Em Andamento';
      case 'closed':
        return 'Encerrada';
      default:
        return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'closed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFormatLabel = (formato: string) => {
    switch (formato) {
      case 'eliminacao_simples':
        return 'Eliminação Simples';
      case 'round_robin':
        return 'Round Robin';
      case 'suico':
        return 'Sistema Suíço';
      default:
        return formato;
    }
  };

  const getTypeLabel = (tipo: string) => {
    switch (tipo) {
      case 'individual':
        return 'Individual';
      case 'team':
        return 'Equipe';
      default:
        return tipo;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-pink-400">Gerenciar Competições</h1>
          <div className="space-x-4">
            <button
              onClick={handleCreateCompetition}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
            >
              Nova Competição
            </button>
            <button
              onClick={onBack}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
            >
              Voltar ao Painel
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <div className="bg-gray-800 shadow-lg rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Evento</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Formato</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Participantes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {competitions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-400">
                      Nenhuma competição encontrada
                    </td>
                  </tr>
                ) : (
                  competitions.map((competition) => (
                    <tr key={competition.id} className="hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-pink-300">{competition.nome}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{getEventName(competition.id_evento)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{getTypeLabel(competition.tipo)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{getFormatLabel(competition.formato)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(competition.status)}`}>
                          {getStatusLabel(competition.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {competition.participantes_atuais || 0} / {competition.max_participantes}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditCompetition(competition)}
                          className="text-indigo-400 hover:text-indigo-300 mr-3"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteCompetition(competition.id)}
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

        {/* Modal para criar/editar competição */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-pink-400 mb-4">
                {modalMode === 'create' ? 'Criar Nova Competição' : 'Editar Competição'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="name">
                    Nome da Competição
                  </label>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    value={currentCompetition.nome || ''}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="id_evento">
                    Evento
                  </label>
                  <select
                    id="id_evento"
                    name="id_evento"
                    value={currentCompetition.id_evento || ''}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Selecione um evento</option>
                    {events.map(event => (
                      <option key={event.id} value={event.id}>{event.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="tipo">
                    Tipo
                  </label>
                  <select
                    id="tipo"
                    name="tipo"
                    value={currentCompetition.tipo || 'individual'}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="individual">Individual</option>
                    <option value="team">Equipe</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="formato">
                    Formato
                  </label>
                  <select
                    id="formato"
                    name="formato"
                    value={currentCompetition.formato || 'eliminacao_simples'}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="eliminacao_simples">Eliminação Simples</option>
                    <option value="round_robin">Round Robin</option>
                    <option value="suico">Sistema Suíço</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="max_participantes">
                    Máximo de Participantes
                  </label>
                  <input
                    type="number"
                    id="max_participantes"
                    name="max_participantes"
                    value={currentCompetition.max_participantes || 16}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="status">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={currentCompetition.status || 'open'}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="open">Aberta</option>
                    <option value="in_progress">Em Andamento</option>
                    <option value="closed">Encerrada</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="premio">
                    Prêmio
                  </label>
                  <input
                    type="text"
                    id="premio"
                    name="premio"
                    value={currentCompetition.premio || ''}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="taxa_inscricao">
                    Taxa de Inscrição
                  </label>
                  <input
                    type="number"
                    id="taxa_inscricao"
                    name="taxa_inscricao"
                    value={currentCompetition.taxa_inscricao || 0}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="regras">
                    Regras
                  </label>
                  <textarea
                    id="regras"
                    name="regras"
                    value={currentCompetition.regras || ''}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 h-32"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="data_inicio">
                    Data de Início
                  </label>
                  <input
                    type="date"
                    id="data_inicio"
                    name="data_inicio"
                    value={currentCompetition.data_inicio || ''}
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
                  onClick={handleSaveCompetition}
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

export default ManageCompetitionsScreen;