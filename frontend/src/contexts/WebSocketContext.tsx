import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { useAuth } from './AuthContext';

interface WebSocketContextType {
  socket: WebSocket | null;
  isConnected: boolean;
  sendMessage: (type: string, data: any) => void;
  emit: (type: string, data: any) => void; // Alias for sendMessage for compatibility
  on: (event: string, callback: (data: any) => void) => void;
  off: (event: string, callback: (data: any) => void) => void;
  lastMessage: any;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

interface WebSocketProviderProps {
  children: ReactNode;
  url?: string;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ 
  children, 
  url = process.env['REACT_APP_WS_URL'] || 'ws://localhost:8080'
}) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const { token, isAuthenticated } = useAuth();
  const socketRef = useRef<WebSocket | null>(null);

  const connectWebSocket = useCallback(() => {
    if (!isAuthenticated || !token) return;

    const wsUrl = `${url}?token=${token}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        setLastMessage(message);
        
        // Notify all registered listeners for this event type
        if (message.type && eventListeners.current.has(message.type)) {
          eventListeners.current.get(message.type)?.forEach(callback => {
            callback(message.data);
          });
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      // Clear the socket reference
      if (socketRef.current === ws) {
        socketRef.current = null;
        setSocket(null);
      }
      // Attempt to reconnect after a delay only if still authenticated
      setTimeout(() => {
        if (isAuthenticated && !socketRef.current) {
          connectWebSocket();
        }
      }, 5000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      ws.close();
    };

    setSocket(ws);
    socketRef.current = ws;

    return () => {
      if (socketRef.current === ws) {
        socketRef.current = null;
      }
      ws.close();
    };
  }, [url, token, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && !socketRef.current) {
      const cleanup = connectWebSocket();
      return cleanup;
    } else if (!isAuthenticated && socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    }
    return undefined;
  }, [isAuthenticated, connectWebSocket]);

  const sendMessage = useCallback(
    (type: string, data: any) => {
      if (socket && isConnected) {
        const message = JSON.stringify({ type, data });
        socket.send(message);
      } else {
        console.warn('Cannot send message: WebSocket is not connected');
      }
    },
    [socket, isConnected]
  );

  // Event listeners map to track registered callbacks
  const eventListeners = React.useRef<Map<string, Set<(data: any) => void>>>(new Map());

  const on = useCallback(
    (event: string, callback: (data: any) => void) => {
      if (!eventListeners.current.has(event)) {
        eventListeners.current.set(event, new Set());
      }
      eventListeners.current.get(event)?.add(callback);
    },
    []
  );

  const off = useCallback(
    (event: string, callback: (data: any) => void) => {
      eventListeners.current.get(event)?.delete(callback);
    },
    []
  );

  const value = {
    socket,
    isConnected,
    sendMessage,
    emit: sendMessage, // Alias for sendMessage for compatibility
    on,
    off,
    lastMessage,
  };

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
};

export default WebSocketContext;