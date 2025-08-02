import React, { useState, useEffect } from 'react';
import { QueueItem, Song, User } from '../types';
import { adminApi } from '../api/api';

interface ManageQueueScreenProps {
  onBack: () => void;
}

const ManageQueueScreen: React.FC<ManageQueueScreenProps> = ({ onBack }) => {
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [musics, setMusics] = useState<Song[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentQueueItem, setCurrentQueueItem] = useState<Partial<QueueItem>>({});
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [queueResponse, musicsResponse, usersResponse] = await Promise.all([
        adminApi.queue.getQueueItems(),
        adminApi.music.getMusics(),
        adminApi.user.getUsers()
      ]);

      if (queueResponse.success) {
        setQueueItems(queueResponse.data as QueueItem[] || []);
      }

      if (musicsResponse.success) {
        setMusics(musicsResponse.data as Song[] || []);
      }

      if (usersResponse.success) {
        setUsers(usersResponse.data as User[] || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateQueueItem = () => {
    setCurrentQueueItem({ status: 'pendente' });
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditQueueItem = (queueItem: QueueItem) => {
    setCurrentQueueItem({ ...queueItem });
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDeleteQueueItem = async (queueItemId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este item da fila?')) return;

    try {
      const response = await adminApi.queue.deleteQueueItem(queueItemId);
      if (response.success) {
        await loadData();
      } else {
        console.error('Erro ao excluir item da fila:', response.error);
      }
    } catch (error) {
      console.error('Erro ao excluir item da fila:', error);
    }
  };

  const handleSaveQueueItem = async () => {
    try {
      let response;
      
      // Prepare the data with the correct field names
      const queueItemData = {
        ...currentQueueItem,
        players: currentQueueItem.player_ids || currentQueueItem.players,
        song: currentQueueItem.music_id || currentQueueItem.song
      };

      if (modalMode === 'create') {
        response = await adminApi.queue.createQueueItem(queueItemData);
      } else {
        response = await adminApi.queue.updateQueueItem(currentQueueItem.id!, queueItemData);
      }

      if (response.success) {
        setIsModalOpen(false);
        await loadData();
      } else {
        console.error('Erro ao salvar item da fila:', response.error);
      }
    } catch (error) {
      console.error('Erro ao salvar item da fila:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentQueueItem(prev => ({ ...prev, [name]: value }));
  };

  const getMusicName = (musicIdOrObject: string | Song) => {
    if (typeof musicIdOrObject === 'object' && musicIdOrObject !== null) {
      return `${musicIdOrObject.name} - ${musicIdOrObject.artist}`;
    }
    
    const music = musics.find(m => m.id === musicIdOrObject);
    return music ? `${music.name} - ${music.artist}` : 'Música não encontrada';
  };

  const getUserName = (userIdOrObject: string | User) => {
    if (typeof userIdOrObject === 'object' && userIdOrObject !== null) {
      return userIdOrObject.nickname;
    }
    
    const user = users.find(u => u.id === userIdOrObject);
    return user ? user.nickname : 'Usuário não encontrado';
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'Pendente';
      case 'em_andamento':
        return 'Em Andamento';
      case 'concluido':
        return 'Concluído';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'em_andamento':
        return 'bg-blue-100 text-blue-800';
      case 'concluido':
        return 'bg-green-100 text-green-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'solo':
        return 'Solo';
      case 'duo':
        return 'Duo';
      case 'trio':
        return 'Trio';
      case 'quarteto':
        return 'Quarteto';
      default:
        return type;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 text-white p-4 pt-16 pb-20">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-8 text-pink-400">Gerenciar Fila</h2>

        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={handleCreateQueueItem}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
          >
            Adicionar à Fila
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Jogador(es)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Música</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {queueItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-400">
                      Nenhum item na fila
                    </td>
                  </tr>
                ) : (
                  queueItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-pink-300">#{item.id.substring(0, 8)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{getTypeLabel(item.type)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {item.players && Array.isArray(item.players) ? 
                          item.players.map(id => getUserName(id)).join(', ') : 
                          item.player_ids && Array.isArray(item.player_ids) ? 
                          item.player_ids.map(id => getUserName(id)).join(', ') : 
                          'Nenhum jogador'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {item.song ? getMusicName(item.song) : 
                         item.music_id ? getMusicName(item.music_id) : 'Nenhuma música'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(item.status)}`}>
                          {getStatusLabel(item.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditQueueItem(item)}
                          className="text-indigo-400 hover:text-indigo-300 mr-3"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteQueueItem(item.id)}
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

        {/* Modal para criar/editar item da fila */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-pink-400 mb-4">
                {modalMode === 'create' ? 'Adicionar à Fila' : 'Editar Item da Fila'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="type">
                    Tipo
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={currentQueueItem.type || 'solo'}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="solo">Solo</option>
                    <option value="duo">Duo</option>
                    <option value="trio">Trio</option>
                    <option value="quarteto">Quarteto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="music_id">
                    Música
                  </label>
                  <select
                    id="music_id"
                    name="music_id"
                    value={currentQueueItem.music_id || (currentQueueItem.song ? currentQueueItem.song.id : '') || ''}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    <option value="">Selecione uma música</option>
                    {musics.map(music => (
                      <option key={music.id} value={music.id}>{music.name} - {music.artist}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="player_ids">
                    Jogador(es)
                  </label>
                  <select
                    id="player_ids"
                    name="player_ids"
                    value={currentQueueItem.player_ids?.[0] || ''}
                    onChange={(e) => {
                      setCurrentQueueItem(prev => ({
                        ...prev,
                        player_ids: e.target.value ? [e.target.value] : []
                      }));
                    }}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2"
                    required
                  >
                    <option value="">Selecione o jogador principal</option>
                    {users
                      .filter(user => user.role === 'jogador' || user.papel === 'jogador')
                      .map(user => (
                        <option key={user.id} value={user.id}>{user.nickname}</option>
                      ))}
                  </select>

                  {(currentQueueItem.type === 'duo' || currentQueueItem.type === 'trio' || currentQueueItem.type === 'quarteto') && (
                    <select
                      id="player_ids_2"
                      name="player_ids_2"
                      value={currentQueueItem.player_ids?.[1] || ''}
                      onChange={(e) => {
                        setCurrentQueueItem(prev => ({
                          ...prev,
                          player_ids: [
                            prev.player_ids?.[0] || '',
                            e.target.value,
                            ...(prev.player_ids?.slice(2) || [])
                          ].filter(Boolean)
                        }));
                      }}
                      className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2"
                      required
                    >
                      <option value="">Selecione o segundo jogador</option>
                      {users
                        .filter(user => (user.role === 'jogador' || user.papel === 'jogador') && user.id !== currentQueueItem.player_ids?.[0])
                        .map(user => (
                          <option key={user.id} value={user.id}>{user.nickname}</option>
                        ))}
                    </select>
                  )}

                  {(currentQueueItem.type === 'trio' || currentQueueItem.type === 'quarteto') && (
                    <select
                      id="player_ids_3"
                      name="player_ids_3"
                      value={currentQueueItem.player_ids?.[2] || ''}
                      onChange={(e) => {
                        setCurrentQueueItem(prev => ({
                          ...prev,
                          player_ids: [
                            prev.player_ids?.[0] || '',
                            prev.player_ids?.[1] || '',
                            e.target.value,
                            ...(prev.player_ids?.slice(3) || [])
                          ].filter(Boolean)
                        }));
                      }}
                      className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2"
                      required
                    >
                      <option value="">Selecione o terceiro jogador</option>
                      {users
                        .filter(user => 
                          (user.role === 'jogador' || user.papel === 'jogador') && 
                          user.id !== currentQueueItem.player_ids?.[0] && 
                          user.id !== currentQueueItem.player_ids?.[1]
                        )
                        .map(user => (
                          <option key={user.id} value={user.id}>{user.nickname}</option>
                        ))}
                    </select>
                  )}

                  {currentQueueItem.type === 'quarteto' && (
                    <select
                      id="player_ids_4"
                      name="player_ids_4"
                      value={currentQueueItem.player_ids?.[3] || ''}
                      onChange={(e) => {
                        setCurrentQueueItem(prev => ({
                          ...prev,
                          player_ids: [
                            prev.player_ids?.[0] || '',
                            prev.player_ids?.[1] || '',
                            prev.player_ids?.[2] || '',
                            e.target.value
                          ].filter(Boolean)
                        }));
                      }}
                      className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    >
                      <option value="">Selecione o quarto jogador</option>
                      {users
                        .filter(user => 
                          (user.role === 'jogador' || user.papel === 'jogador') && 
                          user.id !== currentQueueItem.player_ids?.[0] && 
                          user.id !== currentQueueItem.player_ids?.[1] && 
                          user.id !== currentQueueItem.player_ids?.[2]
                        )
                        .map(user => (
                          <option key={user.id} value={user.id}>{user.nickname}</option>
                        ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="status">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={currentQueueItem.status || 'pendente'}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="pendente">Pendente</option>
                    <option value="em_andamento">Em Andamento</option>
                    <option value="concluido">Concluído</option>
                    <option value="cancelado">Cancelado</option>
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
                  onClick={handleSaveQueueItem}
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

export default ManageQueueScreen;