import React, { useState } from 'react';
import { useEvent } from '../contexts/EventContext';

interface NotificationCenterProps {
  className?: string;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ className = '' }) => {
  const { state, dispatch } = useEvent();
  const [isExpanded, setIsExpanded] = useState(false);
  const [filter, setFilter] = useState<'all' | 'admin' | 'staff' | 'system'>('all');

  const filteredNotifications = state.notifications.filter(notification => {
    if (filter === 'all') return true;
    return notification.from === filter;
  });

  const unreadCount = state.notifications.length;

  const getNotificationIcon = (type: string, from: string) => {
    if (from === 'admin') return '👑';
    if (from === 'staff') return '👨‍💼';
    if (from === 'system') return '🤖';
    
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  const getNotificationColor = (type: string, from: string) => {
    if (from === 'admin') return 'from-purple-600/20 to-purple-800/20 border-purple-500/30';
    if (from === 'staff') return 'from-blue-600/20 to-blue-800/20 border-blue-500/30';
    
    switch (type) {
      case 'success': return 'from-green-600/20 to-green-800/20 border-green-500/30';
      case 'error': return 'from-red-600/20 to-red-800/20 border-red-500/30';
      case 'warning': return 'from-yellow-600/20 to-yellow-800/20 border-yellow-500/30';
      case 'info': return 'from-cyan-600/20 to-cyan-800/20 border-cyan-500/30';
      default: return 'from-gray-600/20 to-gray-800/20 border-gray-500/30';
    }
  };

  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const clearNotification = (id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  };

  const clearAllNotifications = () => {
    state.notifications.forEach(notification => {
      dispatch({ type: 'REMOVE_NOTIFICATION', payload: notification.id });
    });
  };

  return (
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      {/* Notification Bell */}
      <div className="relative">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-full p-3 text-white hover:bg-white/20 transition-all duration-300 shadow-lg"
        >
          <div className="relative">
            <span className="text-xl">🔔</span>
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>
        </button>

        {/* Connection Status Indicator */}
        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${
          state.isConnected ? 'bg-green-500' : 'bg-red-500'
        }`} title={state.isConnected ? 'Conectado' : 'Desconectado'} />
      </div>

      {/* Notification Panel */}
      {isExpanded && (
        <div className="absolute top-16 right-0 w-96 max-h-96 bg-gray-900/95 backdrop-blur-lg border border-white/20 rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <span>📢</span>
                Notificações
              </h3>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  state.isConnected ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span className="text-xs text-white/60">
                  {state.isConnected ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-1">
              {['all', 'admin', 'staff', 'system'].map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType as any)}
                  className={`px-2 py-1 text-xs rounded-lg transition-all ${
                    filter === filterType
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {filterType === 'all' ? 'Todas' : 
                   filterType === 'admin' ? 'Admin' :
                   filterType === 'staff' ? 'Staff' : 'Sistema'}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-64 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="p-6 text-center text-white/60">
                <span className="text-2xl mb-2 block">📭</span>
                <p>Nenhuma notificação</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border-b border-white/10 bg-gradient-to-r ${getNotificationColor(notification.type, notification.from)} hover:bg-white/5 transition-all`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-lg">
                        {getNotificationIcon(notification.type, notification.from)}
                      </span>
                      <div className="flex-1">
                        <p className="text-white text-sm">{notification.message}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-white/60">
                            {formatTime(notification.timestamp)}
                          </span>
                          <span className="text-xs px-2 py-0.5 bg-white/20 rounded-full text-white/80">
                            {notification.from === 'admin' ? 'Admin' :
                             notification.from === 'staff' ? 'Staff' : 'Sistema'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => clearNotification(notification.id)}
                      className="text-white/40 hover:text-white/80 transition-colors ml-2"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {filteredNotifications.length > 0 && (
            <div className="p-3 border-t border-white/10">
              <button
                onClick={clearAllNotifications}
                className="w-full text-xs text-white/60 hover:text-white/80 transition-colors"
              >
                Limpar todas
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;