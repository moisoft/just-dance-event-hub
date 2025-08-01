import React, { useState, useEffect, useMemo } from 'react';
import { staffApi } from '../api/api';
import { QueueItem } from '../types';

interface StaffPanelScreenProps {
  onLogout: () => void;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

const StaffPanelScreen: React.FC<StaffPanelScreenProps> = ({ onLogout }) => {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchQueue();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchQueue(true);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchQueue = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const response = await staffApi.getQueue();
      if (response.success && response.data) {
        setQueue(response.data as QueueItem[]);
        if (isRefresh) {
          showToast('Fila atualizada com sucesso!', 'success');
        }
      } else {
        setError(response.error || 'Falha ao carregar a fila');
      }
    } catch (err: any) {
      setError(err.message || 'Erro de rede');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const showToast = (message: string, type: Toast['type']) => {
    const id = Date.now().toString();
    const newToast: Toast = { id, message, type };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 4000);
  };

  const handleUpdateQueueItem = async (itemId: string, status: string) => {
    try {
      const response = await staffApi.updateQueueItem(itemId, status);
      if (response.success) {
        showToast('Item da fila atualizado com sucesso!', 'success');
        fetchQueue(true);
      } else {
        showToast(response.error || 'Falha ao atualizar item da fila', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Erro de rede', 'error');
    }
  };

  const filteredQueue = useMemo(() => {
    return queue.filter(item => {
      const matchesSearch = 
        item.player?.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.song.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.song.artist.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [queue, searchTerm, statusFilter]);

  const queueStats = useMemo(() => {
    const total = queue.length;
    const pending = queue.filter(item => item.status === 'pending').length;
    const playing = queue.filter(item => item.status === 'playing').length;
    const completed = queue.filter(item => item.status === 'completed').length;
    const skipped = queue.filter(item => item.status === 'skipped').length;
    
    return { total, pending, playing, completed, skipped };
  }, [queue]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'playing': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'skipped': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'playing': return '▶️';
      case 'completed': return '✅';
      case 'skipped': return '⏭️';
      default: return '❓';
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-400 mx-auto mb-4"></div>
        <p className="text-white text-xl">Carregando fila...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex items-center justify-center">
      <div className="text-center bg-red-900/50 backdrop-blur-lg p-8 rounded-2xl border border-red-500/50">
        <div className="text-6xl mb-4">❌</div>
        <h2 className="text-2xl font-bold text-red-400 mb-2">Erro</h2>
        <p className="text-red-300 mb-4">{error}</p>
        <button 
          onClick={() => fetchQueue()}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 text-white p-4 md:p-8">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-6 py-3 rounded-lg shadow-lg backdrop-blur-lg border transform transition-all duration-300 animate-slide-in ${
              toast.type === 'success' ? 'bg-green-900/80 border-green-500/50 text-green-100' :
              toast.type === 'error' ? 'bg-red-900/80 border-red-500/50 text-red-100' :
              'bg-blue-900/80 border-blue-500/50 text-blue-100'
            }`}
          >
            <div className="flex items-center space-x-2">
              <span className="text-lg">
                {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'}
              </span>
              <span className="font-medium">{toast.message}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent mb-2">
            🎵 Painel Staff
          </h1>
          <p className="text-gray-300 text-lg">Gerencie a fila de músicas em tempo real</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => fetchQueue(true)}
            disabled={refreshing}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 flex items-center space-x-2"
          >
            <span className={refreshing ? 'animate-spin' : ''}>
              {refreshing ? '🔄' : '🔄'}
            </span>
            <span>{refreshing ? 'Atualizando...' : 'Atualizar'}</span>
          </button>
          <button
            onClick={onLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 flex items-center space-x-2"
          >
            <span>🚪</span>
            <span>Sair</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-lg p-4 rounded-xl border border-blue-500/30">
          <div className="text-2xl font-bold text-blue-400">{queueStats.total}</div>
          <div className="text-blue-300 text-sm">Total</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 backdrop-blur-lg p-4 rounded-xl border border-yellow-500/30">
          <div className="text-2xl font-bold text-yellow-400">{queueStats.pending}</div>
          <div className="text-yellow-300 text-sm">Pendentes</div>
        </div>
        <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 backdrop-blur-lg p-4 rounded-xl border border-green-500/30">
          <div className="text-2xl font-bold text-green-400">{queueStats.playing}</div>
          <div className="text-green-300 text-sm">Tocando</div>
        </div>
        <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-lg p-4 rounded-xl border border-blue-500/30">
          <div className="text-2xl font-bold text-blue-400">{queueStats.completed}</div>
          <div className="text-blue-300 text-sm">Concluídas</div>
        </div>
        <div className="bg-gradient-to-br from-red-600/20 to-red-800/20 backdrop-blur-lg p-4 rounded-xl border border-red-500/30">
          <div className="text-2xl font-bold text-red-400">{queueStats.skipped}</div>
          <div className="text-red-300 text-sm">Puladas</div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-gray-800/50 backdrop-blur-lg p-6 rounded-xl border border-purple-500/30 mb-8">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-2">🔍 Buscar</label>
            <input
              type="text"
              placeholder="Buscar por jogador, música ou artista..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-700/50 border border-gray-600 rounded-lg py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="md:w-48">
            <label className="block text-sm font-medium text-gray-300 mb-2">📊 Filtrar por Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-gray-700/50 border border-gray-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            >
              <option value="all">Todos os Status</option>
              <option value="pending">Pendentes</option>
              <option value="playing">Tocando</option>
              <option value="completed">Concluídas</option>
              <option value="skipped">Puladas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Queue Content */}
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-purple-500/30 overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-2xl font-semibold text-purple-400 flex items-center space-x-2">
            <span>🎵</span>
            <span>Fila Atual ({filteredQueue.length} itens)</span>
          </h2>
        </div>
        
        {filteredQueue.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">🎵</div>
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              {queue.length === 0 ? 'Nenhum item na fila' : 'Nenhum resultado encontrado'}
            </h3>
            <p className="text-gray-500">
              {queue.length === 0 ? 'A fila está vazia no momento.' : 'Tente ajustar os filtros de busca.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="py-4 px-6 text-left text-gray-300 font-semibold">Jogador</th>
                  <th className="py-4 px-6 text-left text-gray-300 font-semibold">Música</th>
                  <th className="py-4 px-6 text-left text-gray-300 font-semibold">Tipo</th>
                  <th className="py-4 px-6 text-left text-gray-300 font-semibold">Status</th>
                  <th className="py-4 px-6 text-left text-gray-300 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredQueue.map((item, index) => (
                  <tr key={item.id} className={`border-t border-gray-700 hover:bg-gray-700/30 transition-colors ${index % 2 === 0 ? 'bg-gray-800/20' : ''}`}>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                          {item.player?.nickname?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{item.player?.nickname || 'Jogador Desconhecido'}</div>
                          <div className="text-sm text-gray-400">#{item.id.slice(-6)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={item.song.artwork_url} 
                          alt={item.song.name}
                          className="w-12 h-12 rounded-lg object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iOCIgZmlsbD0iIzM3NDE1MSIvPgo8cGF0aCBkPSJNMjQgMTJDMjYuMjA5MSAxMiAyOCAxMy43OTA5IDI4IDE2VjMyQzI4IDM0LjIwOTEgMjYuMjA5MSAzNiAyNCAzNkMyMS43OTA5IDM2IDIwIDM0LjIwOTEgMjAgMzJWMTZDMjAgMTMuNzkwOSAyMS43OTA5IDEyIDI0IDEyWiIgZmlsbD0iIzZCNzI4MCIvPgo8L3N2Zz4K';
                          }}
                        />
                        <div>
                          <div className="font-semibold text-white">{item.song.name}</div>
                          <div className="text-sm text-gray-400">{item.song.artist}</div>
                          <div className="text-xs text-purple-400">{item.song.game_mode}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        item.type === 'solo' ? 'bg-blue-900/50 text-blue-300 border border-blue-500/30' :
                        item.type === 'team' ? 'bg-green-900/50 text-green-300 border border-green-500/30' :
                        'bg-purple-900/50 text-purple-300 border border-purple-500/30'
                      }`}>
                        {item.type === 'solo' ? '👤 Solo' : 
                         item.type === 'team' ? '👥 Equipe' : 
                         '🏆 Torneio'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getStatusIcon(item.status)}</span>
                        <select
                          value={item.status}
                          onChange={(e) => handleUpdateQueueItem(item.id, e.target.value)}
                          className={`bg-gray-700/50 border border-gray-600 rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${getStatusColor(item.status)}/20`}
                        >
                          <option value="pending">⏳ Pendente</option>
                          <option value="playing">▶️ Tocando</option>
                          <option value="completed">✅ Concluída</option>
                          <option value="skipped">⏭️ Pulada</option>
                        </select>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleUpdateQueueItem(item.id, 'playing')}
                          disabled={item.status === 'playing'}
                          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 flex items-center space-x-1"
                        >
                          <span>▶️</span>
                          <span>Tocar</span>
                        </button>
                        <button
                          onClick={() => handleUpdateQueueItem(item.id, 'completed')}
                          disabled={item.status === 'completed'}
                          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 flex items-center space-x-1"
                        >
                          <span>✅</span>
                          <span>Concluir</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffPanelScreen;