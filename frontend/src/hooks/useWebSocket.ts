import { useEffect, useRef, useCallback } from 'react';
import { useEvent } from '../contexts/EventContext';
import { QueueItem, User, Tournament } from '../types';

interface WebSocketMessage {
  type: string;
  payload: any;
  from: 'admin' | 'staff' | 'player';
  timestamp: string;
  eventId?: string;
}

interface UseWebSocketProps {
  eventId?: string;
  userRole: 'admin' | 'staff' | 'player';
  userId: string;
}

export const useWebSocket = ({ eventId, userRole, userId }: UseWebSocketProps) => {
  const { state, dispatch, addNotification } = useEvent();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Função para conectar ao WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:5000';
      const url = eventId 
        ? `${wsUrl}/ws?eventId=${eventId}&role=${userRole}&userId=${userId}`
        : `${wsUrl}/ws?role=${userRole}&userId=${userId}`;
      
      wsRef.current = new WebSocket(url);

      wsRef.current.onopen = () => {
        console.log('WebSocket conectado');
        dispatch({ type: 'SET_CONNECTION_STATUS', payload: true });
        reconnectAttempts.current = 0;
        addNotification('success', 'Conectado ao sistema em tempo real', 'system');
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          handleMessage(message);
        } catch (error) {
          console.error('Erro ao processar mensagem WebSocket:', error);
        }
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket desconectado');
        dispatch({ type: 'SET_CONNECTION_STATUS', payload: false });
        
        // Tentar reconectar se não foi um fechamento intencional
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        } else {
          addNotification('error', 'Conexão perdida. Recarregue a página.', 'system');
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('Erro WebSocket:', error);
        addNotification('error', 'Erro de conexão', 'system');
      };

    } catch (error) {
      console.error('Erro ao conectar WebSocket:', error);
      addNotification('error', 'Falha ao conectar', 'system');
    }
  }, [eventId, userRole, userId, dispatch, addNotification]);

  // Função para processar mensagens recebidas
  const handleMessage = useCallback((message: WebSocketMessage) => {
    console.log('Mensagem recebida:', message);

    switch (message.type) {
      case 'QUEUE_UPDATED':
        dispatch({ type: 'UPDATE_QUEUE', payload: message.payload });
        if (message.from !== userRole) {
          const from = message.from === 'player' ? 'system' : message.from as 'admin' | 'staff' | 'system';
          addNotification('info', 'Fila atualizada', from);
        }
        break;

      case 'QUEUE_ITEM_ADDED':
        dispatch({ type: 'ADD_QUEUE_ITEM', payload: message.payload });
        if (message.from !== userRole) {
          const item = message.payload as QueueItem;
          const from = message.from === 'player' ? 'system' : message.from as 'admin' | 'staff' | 'system';
          addNotification('info', `Nova música adicionada: ${item.song.name}`, from);
        }
        break;

      case 'QUEUE_ITEM_STATUS_CHANGED':
        const { id, status, updates } = message.payload;
        dispatch({ type: 'UPDATE_QUEUE_ITEM', payload: { id, updates: { status, ...updates } } });
        
        if (message.from !== userRole) {
          const statusMessages = {
            playing: 'Música iniciada',
            completed: 'Música concluída',
            skipped: 'Música pulada',
            pending: 'Música voltou para pendente'
          };
          const from = message.from === 'player' ? 'system' : message.from as 'admin' | 'staff' | 'system';
          addNotification('info', statusMessages[status as keyof typeof statusMessages] || 'Status atualizado', from);
        }
        break;

      case 'CURRENTLY_PLAYING_CHANGED':
        dispatch({ type: 'SET_CURRENTLY_PLAYING', payload: message.payload });
        if (message.payload && message.from !== userRole) {
          const item = message.payload as QueueItem;
          const from = message.from === 'player' ? 'system' : message.from as 'admin' | 'staff' | 'system';
          addNotification('info', `Tocando agora: ${item.song.name}`, from);
        }
        break;

      case 'TOURNAMENT_UPDATED':
        dispatch({ type: 'UPDATE_TOURNAMENTS', payload: message.payload });
        if (message.from !== userRole) {
          const from = message.from === 'player' ? 'system' : message.from as 'admin' | 'staff' | 'system';
          addNotification('info', 'Torneios atualizados', from);
        }
        break;

      case 'USER_JOINED':
        const joinedUser = message.payload as User;
        dispatch({ 
          type: 'UPDATE_CONNECTED_USERS', 
          payload: [...state.connectedUsers, joinedUser]
        });
        if (userRole === 'admin' || userRole === 'staff') {
          addNotification('info', `${joinedUser.nickname} entrou no evento`, 'system');
        }
        break;

      case 'USER_LEFT':
        const leftUserId = message.payload as string;
        dispatch({ 
          type: 'UPDATE_CONNECTED_USERS', 
          payload: state.connectedUsers.filter(u => u.id !== leftUserId)
        });
        break;

      case 'ADMIN_ANNOUNCEMENT':
        addNotification('info', message.payload.message, 'admin');
        break;

      case 'STAFF_NOTIFICATION':
        if (userRole === 'staff' || userRole === 'admin') {
          addNotification('info', message.payload.message, 'staff');
        }
        break;

      case 'SYSTEM_NOTIFICATION':
        addNotification(message.payload.type || 'info', message.payload.message, 'system');
        break;

      default:
        console.log('Tipo de mensagem não reconhecido:', message.type);
    }
  }, [dispatch, addNotification, userRole, state.connectedUsers]);

  // Função para enviar mensagens
  const sendMessage = useCallback((type: string, payload: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type,
        payload,
        from: userRole,
        timestamp: new Date().toISOString(),
        eventId,
      };
      wsRef.current.send(JSON.stringify(message));
    } else {
      addNotification('error', 'Não conectado. Tentando reconectar...', 'system');
      connect();
    }
  }, [userRole, eventId, addNotification, connect]);

  // Funções específicas para diferentes ações
  const updateQueueItemStatus = useCallback((itemId: string, status: string, additionalUpdates?: any) => {
    sendMessage('UPDATE_QUEUE_ITEM_STATUS', {
      id: itemId,
      status,
      updates: additionalUpdates || {},
    });
  }, [sendMessage]);

  const addQueueItem = useCallback((item: QueueItem) => {
    sendMessage('ADD_QUEUE_ITEM', item);
  }, [sendMessage]);

  const removeQueueItem = useCallback((itemId: string) => {
    sendMessage('REMOVE_QUEUE_ITEM', itemId);
  }, [sendMessage]);

  const setCurrentlyPlaying = useCallback((item: QueueItem | null) => {
    sendMessage('SET_CURRENTLY_PLAYING', item);
  }, [sendMessage]);

  const sendAnnouncement = useCallback((message: string, targetRole?: 'all' | 'staff' | 'players') => {
    if (userRole === 'admin') {
      sendMessage('ADMIN_ANNOUNCEMENT', { message, targetRole: targetRole || 'all' });
    }
  }, [sendMessage, userRole]);

  const sendStaffNotification = useCallback((message: string) => {
    if (userRole === 'admin' || userRole === 'staff') {
      sendMessage('STAFF_NOTIFICATION', { message });
    }
  }, [sendMessage, userRole]);

  // Conectar quando o hook é montado
  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  // Reconectar quando eventId muda
  useEffect(() => {
    if (wsRef.current) {
      wsRef.current.close();
      setTimeout(connect, 100);
    }
  }, [eventId, connect]);

  return {
    isConnected: state.isConnected,
    sendMessage,
    updateQueueItemStatus,
    addQueueItem,
    removeQueueItem,
    setCurrentlyPlaying,
    sendAnnouncement,
    sendStaffNotification,
    connect,
  };
};

export default useWebSocket;