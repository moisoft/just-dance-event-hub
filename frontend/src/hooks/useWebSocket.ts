import { useEffect, useRef, useCallback } from 'react';
import { useEvent } from '../contexts/EventContext';
import { QueueItem, User } from '../types';

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
  const { state, dispatch } = useEvent();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Gerenciamento de listeners de eventos
  const eventListeners = useRef<Record<string, Array<(data: any) => void>>>({});

  // Função para processar mensagens recebidas
  const handleMessageWithListeners = useCallback((message: WebSocketMessage) => {
    console.log('Mensagem recebida:', message);

    switch (message.type) {
      case 'QUEUE_UPDATED':
        // O backend envia { queue: [...], update: {...} }
        // Precisamos extrair apenas a fila
        const queueData = message.payload.queue || message.payload;
        dispatch({ type: 'UPDATE_QUEUE', payload: queueData });
        break;

      case 'QUEUE_ITEM_ADDED':
        dispatch({ type: 'ADD_QUEUE_ITEM', payload: message.payload });
        break;

      case 'QUEUE_ITEM_STATUS_CHANGED':
        const { id, status, updates } = message.payload;
        dispatch({ type: 'UPDATE_QUEUE_ITEM', payload: { id, updates: { status, ...updates } } });
        break;

      case 'CURRENTLY_PLAYING_CHANGED':
        dispatch({ type: 'SET_CURRENTLY_PLAYING', payload: message.payload });
        break;

      case 'TOURNAMENT_UPDATED':
        dispatch({ type: 'UPDATE_TOURNAMENTS', payload: message.payload });
        break;

      case 'USER_JOINED':
        const joinedUser = message.payload as User;
        dispatch({ 
          type: 'UPDATE_CONNECTED_USERS', 
          payload: [...state.connectedUsers, joinedUser]
        });
        break;

      case 'USER_LEFT':
        const leftUserId = message.payload as string;
        dispatch({ 
          type: 'UPDATE_CONNECTED_USERS', 
          payload: state.connectedUsers.filter(u => u.id !== leftUserId)
        });
        break;

      case 'ADMIN_ANNOUNCEMENT':
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            type: 'info',
            message: message.payload.message,
            timestamp: new Date(),
            from: 'admin'
          }
        });
        break;

      case 'STAFF_NOTIFICATION':
        if (userRole === 'staff' || userRole === 'admin') {
          dispatch({
            type: 'ADD_NOTIFICATION',
            payload: {
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              type: 'info',
              message: message.payload.message,
              timestamp: new Date(),
              from: 'staff'
            }
          });
        }
        break;

      case 'SYSTEM_NOTIFICATION':
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            type: message.payload.type || 'info',
            message: message.payload.message,
            timestamp: new Date(),
            from: 'system'
          }
        });
        break;

      default:
         console.log('Tipo de mensagem não reconhecido:', message.type);
     }
     
     // Depois, dispara os listeners registrados para este tipo de mensagem
     const listeners = eventListeners.current[message.type];
     if (listeners && listeners.length > 0) {
       listeners.forEach(listener => listener(message.payload));
     }
   }, [dispatch, userRole, state.connectedUsers]);

  // Função para conectar ao WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const wsUrl = process.env['REACT_APP_WS_URL'] || 'ws://localhost:8080';
      const url = eventId 
        ? `${wsUrl}?eventId=${eventId}&role=${userRole}&userId=${userId}`
        : `${wsUrl}?role=${userRole}&userId=${userId}`;
      
      wsRef.current = new WebSocket(url);

      wsRef.current.onopen = () => {
        console.log('WebSocket conectado');
        dispatch({ type: 'SET_CONNECTION_STATUS', payload: true });
        reconnectAttempts.current = 0;
        // Não chamar addNotification aqui para evitar possíveis loops
        // Apenas atualizar o estado de conexão
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          handleMessageWithListeners(message);
        } catch (error) {
          console.error('Erro ao processar mensagem WebSocket:', error);
        }
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket desconectado');
        
        // Apenas atualizar o status se realmente mudou
        if (state.isConnected) {
          dispatch({ type: 'SET_CONNECTION_STATUS', payload: false });
        }
        
        // Tentar reconectar se não foi um fechamento intencional
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            // Verificar se ainda precisamos reconectar antes de chamar connect
            if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
              connect();
            }
          }, delay);
        } else {
          console.error('Máximo de tentativas de reconexão atingido');
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('Erro WebSocket:', error);
        // Não chamar addNotification aqui para evitar loop infinito
        // Em vez disso, apenas registrar o erro no console
      };

    } catch (error) {
      console.error('Erro ao conectar WebSocket:', error);
      // Não chamar addNotification aqui para evitar loop infinito
    }
  }, [eventId, userRole, userId, dispatch, handleMessageWithListeners, state]);



  // Função para enviar mensagens
  const sendMessage = useCallback((type: string, payload: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type,
        payload,
        from: userRole,
        timestamp: new Date().toISOString(),
        eventId: eventId || '',
      };
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket não está conectado. Tentando reconectar...');
      // Não chamar addNotification aqui para evitar loop infinito
      connect();
    }
  }, [userRole, eventId, connect]);

  // Funções específicas para diferentes ações
  const updateQueueItemStatus = useCallback((itemId: string, status: string, additionalUpdates?: any) => {
    sendMessage('UPDATE_QUEUE_ITEM_STATUS', {
      id: itemId,
      status,
      updates: additionalUpdates || {},
    });
  }, [sendMessage]);

  const addQueueItem = useCallback((item: QueueItem) => {
    sendMessage('PLAYER_JOIN_QUEUE', item);
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

  // Função para registrar um listener de evento
  const on = useCallback((eventType: string, callback: (data: any) => void) => {
    if (!eventListeners.current[eventType]) {
      eventListeners.current[eventType] = [];
    }
    eventListeners.current[eventType]!.push(callback);
  }, []);

  // Função para remover um listener de evento
  const off = useCallback((eventType: string, callback: (data: any) => void) => {
    if (!eventListeners.current[eventType]) return;
    eventListeners.current[eventType] = eventListeners.current[eventType]!.filter(
      listener => listener !== callback
    );
  }, []);

  // Atualizar a função onmessage para usar handleMessageWithListeners
  useEffect(() => {
    if (wsRef.current) {
      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          handleMessageWithListeners(message);
        } catch (error) {
          console.error('Erro ao processar mensagem WebSocket:', error);
        }
      };
    }
  }, [handleMessageWithListeners]);

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
    on,
    off
  };
};

export default useWebSocket;