import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, QueueItem, Tournament } from '../types';

interface EventState {
  currentEvent: {
    id: string;
    name: string;
    code: string;
  } | null;
  queue: QueueItem[];
  tournaments: Tournament[];
  connectedUsers: User[];
  currentlyPlaying: QueueItem | null;
  notifications: Array<{
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    message: string;
    timestamp: Date;
    from: 'admin' | 'staff' | 'system';
  }>;
  isConnected: boolean;
}

type EventAction =
  | { type: 'SET_EVENT'; payload: EventState['currentEvent'] }
  | { type: 'UPDATE_QUEUE'; payload: QueueItem[] }
  | { type: 'ADD_QUEUE_ITEM'; payload: QueueItem }
  | { type: 'UPDATE_QUEUE_ITEM'; payload: { id: string; updates: Partial<QueueItem> } }
  | { type: 'REMOVE_QUEUE_ITEM'; payload: string }
  | { type: 'SET_CURRENTLY_PLAYING'; payload: QueueItem | null }
  | { type: 'UPDATE_TOURNAMENTS'; payload: Tournament[] }
  | { type: 'UPDATE_CONNECTED_USERS'; payload: User[] }
  | { type: 'ADD_NOTIFICATION'; payload: EventState['notifications'][0] }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'SET_CONNECTION_STATUS'; payload: boolean }
  | { type: 'CLEAR_ALL' };

const initialState: EventState = {
  currentEvent: null,
  queue: [],
  tournaments: [],
  connectedUsers: [],
  currentlyPlaying: null,
  notifications: [],
  isConnected: false,
};

function eventReducer(state: EventState, action: EventAction): EventState {
  switch (action.type) {
    case 'SET_EVENT':
      return { ...state, currentEvent: action.payload };
    
    case 'UPDATE_QUEUE':
      return { ...state, queue: action.payload };
    
    case 'ADD_QUEUE_ITEM':
      return { ...state, queue: [...state.queue, action.payload] };
    
    case 'UPDATE_QUEUE_ITEM':
      return {
        ...state,
        queue: state.queue.map(item =>
          item.id === action.payload.id
            ? { ...item, ...action.payload.updates }
            : item
        ),
      };
    
    case 'REMOVE_QUEUE_ITEM':
      return {
        ...state,
        queue: state.queue.filter(item => item.id !== action.payload),
      };
    
    case 'SET_CURRENTLY_PLAYING':
      return { ...state, currentlyPlaying: action.payload };
    
    case 'UPDATE_TOURNAMENTS':
      return { ...state, tournaments: action.payload };
    
    case 'UPDATE_CONNECTED_USERS':
      return { ...state, connectedUsers: action.payload };
    
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications].slice(0, 50), // Manter apenas 50 notificações
      };
    
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
      };
    
    case 'SET_CONNECTION_STATUS':
      return { ...state, isConnected: action.payload };
    
    case 'CLEAR_ALL':
      return initialState;
    
    default:
      return state;
  }
}

interface EventContextType {
  state: EventState;
  dispatch: React.Dispatch<EventAction>;
  // Funções auxiliares
  addNotification: (type: EventState['notifications'][0]['type'], message: string, from?: EventState['notifications'][0]['from']) => void;
  updateQueueItemStatus: (id: string, status: string) => void;
  setCurrentlyPlaying: (item: QueueItem | null) => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

interface EventProviderProps {
  children: ReactNode;
}

export const EventProvider: React.FC<EventProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(eventReducer, initialState);

  // Função para adicionar notificações
  const addNotification = (
    type: EventState['notifications'][0]['type'],
    message: string,
    from: EventState['notifications'][0]['from'] = 'system'
  ) => {
    // Verificar se já existe uma notificação similar para evitar duplicatas
    // que poderiam causar loops infinitos
    const existingSimilar = state.notifications.some(
      n => n.message === message && n.type === type && n.from === from && 
           // Verificar se a notificação foi criada nos últimos 2 segundos
           (new Date().getTime() - new Date(n.timestamp).getTime() < 2000)
    );

    // Se já existe uma notificação similar recente, não adicionar outra
    if (existingSimilar) {
      console.log('Notificação similar já existe, ignorando:', { type, message, from });
      return;
    }

    const notification = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type,
      message,
      timestamp: new Date(),
      from,
    };
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });

    // Auto-remover notificações após 5 segundos (exceto erros)
    if (type !== 'error') {
      setTimeout(() => {
        dispatch({ type: 'REMOVE_NOTIFICATION', payload: notification.id });
      }, 5000);
    }
  };

  // Função para atualizar status de item da fila
  const updateQueueItemStatus = (id: string, status: string) => {
    dispatch({
      type: 'UPDATE_QUEUE_ITEM',
      payload: { id, updates: { status } },
    });

    // Se o status for 'playing', definir como atualmente tocando
    if (status === 'playing') {
      const item = state.queue.find(q => q.id === id);
      if (item) {
        setCurrentlyPlaying({ ...item, status });
      }
    } else if (status === 'completed' || status === 'skipped') {
      // Se completou ou pulou, limpar o atualmente tocando se for o mesmo item
      if (state.currentlyPlaying?.id === id) {
        setCurrentlyPlaying(null);
      }
    }
  };

  // Função para definir música atualmente tocando
  const setCurrentlyPlaying = (item: QueueItem | null) => {
    dispatch({ type: 'SET_CURRENTLY_PLAYING', payload: item });
  };

  const contextValue: EventContextType = {
    state,
    dispatch,
    addNotification,
    updateQueueItemStatus,
    setCurrentlyPlaying,
  };

  return (
    <EventContext.Provider value={contextValue}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvent = (): EventContextType => {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEvent must be used within an EventProvider');
  }
  return context;
};

export default EventContext;