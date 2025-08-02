import React, { useState, useEffect } from 'react';
import { Event } from '../types';
import { adminApi } from '../api/api';

interface ManageEventsScreenProps {
  onBack: () => void;
}

const ManageEventsScreen: React.FC<ManageEventsScreenProps> = ({ onBack }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Partial<Event>>({});
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.getEvents();
      if (response.success) {
        setEvents(response.data as Event[] || []);
      } else {
        console.error('Erro ao carregar eventos:', response.error);
      }
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEvent = () => {
    setCurrentEvent({});
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditEvent = (event: Event) => {
    setCurrentEvent({ ...event });
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este evento?')) return;

    try {
      const response = await adminApi.deleteEvent(eventId);
      if (response.success) {
        await loadEvents();
      } else {
        console.error('Erro ao excluir evento:', response.error);
      }
    } catch (error) {
      console.error('Erro ao excluir evento:', error);
    }
  };

  const handleSaveEvent = async () => {
    try {
      let response;

      if (modalMode === 'create') {
        response = await adminApi.createEvent(currentEvent);
      } else {
        response = await adminApi.updateEvent(currentEvent.id!, currentEvent);
      }

      if (response.success) {
        setIsModalOpen(false);
        await loadEvents();
      } else {
        console.error('Erro ao salvar evento:', response.error);
      }
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentEvent(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 text-white p-4 pt-16 pb-20">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-8 text-pink-400">Gerenciar Eventos</h2>

        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={handleCreateEvent}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
          >
            Criar Novo Evento
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Código</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Organizador</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {events.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-400">
                      Nenhum evento encontrado
                    </td>
                  </tr>
                ) : (
                  events.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-pink-300">{event.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{event.event_code}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{event.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${event.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {event.status === 'active' ? 'Ativo' : event.status === 'inactive' ? 'Inativo' : event.status === 'finished' ? 'Finalizado' : event.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{event.organizer_id || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditEvent(event)}
                          className="text-indigo-400 hover:text-indigo-300 mr-3"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
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

        {/* Modal para criar/editar evento */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-pink-400 mb-4">
                {modalMode === 'create' ? 'Criar Novo Evento' : 'Editar Evento'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="name">
                    Nome do Evento
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={currentEvent.name || ''}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="event_code">
                    Código do Evento
                  </label>
                  <input
                    type="text"
                    id="event_code"
                    name="event_code"
                    value={currentEvent.event_code || ''}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="type">
                    Tipo de Evento
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={currentEvent.type || 'casual'}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="casual">Casual</option>
                    <option value="workshop">Workshop</option>
                    <option value="party">Party</option>
                    <option value="practice">Prática</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="status">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={currentEvent.status || 'active'}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                    <option value="finished">Finalizado</option>
                  </select>
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
                  onClick={handleSaveEvent}
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

export default ManageEventsScreen;