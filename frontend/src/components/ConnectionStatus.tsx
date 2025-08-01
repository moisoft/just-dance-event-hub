import React from 'react';
import { useEvent } from '../contexts/EventContext';

interface ConnectionStatusProps {
  className?: string;
  showDetails?: boolean;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  className = '', 
  showDetails = false 
}) => {
  const { state } = useEvent();

  const getStatusColor = () => {
    if (state.isConnected) {
      return 'bg-green-500';
    }
    return 'bg-red-500';
  };

  const getStatusText = () => {
    if (state.isConnected) {
      return 'Conectado';
    }
    return 'Desconectado';
  };

  const getStatusIcon = () => {
    if (state.isConnected) {
      return '🟢';
    }
    return '🔴';
  };

  const formatLastUpdate = () => {
    // Para agora, vamos mostrar o status atual
    return state.isConnected ? 'Agora' : 'Desconectado';
  };

  if (!showDetails) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className={`w-2 h-2 rounded-full ${getStatusColor()} animate-pulse`} />
        <span className="text-xs text-white/70">{getStatusText()}</span>
      </div>
    );
  }

  return (
    <div className={`bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <span>🔗</span>
          Status da Conexão
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-lg">{getStatusIcon()}</span>
          <span className={`text-sm font-medium ${
            state.isConnected ? 'text-green-400' : 'text-red-400'
          }`}>
            {getStatusText()}
          </span>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-white/70">Última atualização:</span>
          <span className="text-white">{formatLastUpdate()}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-white/70">Usuários online:</span>
          <span className="text-white">{state.connectedUsers.length}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-white/70">Fila atual:</span>
          <span className="text-white">{state.queue.length} pessoas</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-white/70">Notificações:</span>
          <span className="text-white">{state.notifications.length} não lidas</span>
        </div>
      </div>

      {!state.isConnected && (
        <div className="mt-3 p-2 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p className="text-red-300 text-xs">
            ⚠️ Conexão perdida. Tentando reconectar...
          </p>
        </div>
      )}

      {state.isConnected && (
        <div className="mt-3 p-2 bg-green-500/20 border border-green-500/30 rounded-lg">
          <p className="text-green-300 text-xs">
            ✅ Comunicação em tempo real ativa
          </p>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;