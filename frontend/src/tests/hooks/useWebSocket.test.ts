import { renderHook, act } from '@testing-library/react';
import { useWebSocket } from '../../hooks/useWebSocket';

// Mock do WebSocket
const mockWebSocket = {
  send: jest.fn(),
  close: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  readyState: WebSocket.OPEN,
};

// Mock do WebSocket global
global.WebSocket = jest.fn(() => mockWebSocket) as any;

// Mock do EventContext
const mockDispatch = jest.fn();
jest.mock('../../contexts/EventContext', () => ({
  useEvent: () => ({
    dispatch: mockDispatch,
  }),
}));

describe('useWebSocket', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.WebSocket as jest.Mock).mockClear();
  });

  it('should connect to WebSocket on mount', () => {
    renderHook(() => useWebSocket('test-event-id'));

    expect(global.WebSocket).toHaveBeenCalledWith('ws://localhost:8080');
  });

  it('should send message when sendMessage is called', () => {
    const { result } = renderHook(() => useWebSocket('test-event-id'));

    act(() => {
      result.current.sendMessage('test-message');
    });

    expect(mockWebSocket.send).toHaveBeenCalledWith('test-message');
  });

  it('should emit event when emit is called', () => {
    const { result } = renderHook(() => useWebSocket('test-event-id'));

    act(() => {
      result.current.emit('test-event', { data: 'test' });
    });

    expect(mockWebSocket.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: 'test-event',
        data: { data: 'test' },
        eventId: 'test-event-id'
      })
    );
  });

  it('should add event listener when on is called', () => {
    const { result } = renderHook(() => useWebSocket('test-event-id'));
    const mockCallback = jest.fn();

    act(() => {
      result.current.on('test-event', mockCallback);
    });

    // Simular recebimento de mensagem
    const messageEvent = new MessageEvent('message', {
      data: JSON.stringify({
        type: 'test-event',
        data: { message: 'test' }
      })
    });

    // Simular chamada do listener
    const messageHandler = mockWebSocket.addEventListener.mock.calls.find(
      call => call[0] === 'message'
    )?.[1];

    if (messageHandler) {
      messageHandler(messageEvent);
    }

    expect(mockCallback).toHaveBeenCalledWith({ message: 'test' });
  });

  it('should remove event listener when off is called', () => {
    const { result } = renderHook(() => useWebSocket('test-event-id'));
    const mockCallback = jest.fn();

    act(() => {
      result.current.on('test-event', mockCallback);
      result.current.off('test-event', mockCallback);
    });

    // Simular recebimento de mensagem
    const messageEvent = new MessageEvent('message', {
      data: JSON.stringify({
        type: 'test-event',
        data: { message: 'test' }
      })
    });

    const messageHandler = mockWebSocket.addEventListener.mock.calls.find(
      call => call[0] === 'message'
    )?.[1];

    if (messageHandler) {
      messageHandler(messageEvent);
    }

    expect(mockCallback).not.toHaveBeenCalled();
  });

  it('should handle connection open', () => {
    const { result } = renderHook(() => useWebSocket('test-event-id'));

    expect(result.current.isConnected).toBe(false);

    // Simular abertura da conexão
    const openHandler = mockWebSocket.addEventListener.mock.calls.find(
      call => call[0] === 'open'
    )?.[1];

    if (openHandler) {
      act(() => {
        openHandler(new Event('open'));
      });
    }

    expect(result.current.isConnected).toBe(true);
  });

  it('should handle connection close', () => {
    const { result } = renderHook(() => useWebSocket('test-event-id'));

    // Simular abertura da conexão
    const openHandler = mockWebSocket.addEventListener.mock.calls.find(
      call => call[0] === 'open'
    )?.[1];

    if (openHandler) {
      act(() => {
        openHandler(new Event('open'));
      });
    }

    expect(result.current.isConnected).toBe(true);

    // Simular fechamento da conexão
    const closeHandler = mockWebSocket.addEventListener.mock.calls.find(
      call => call[0] === 'close'
    )?.[1];

    if (closeHandler) {
      act(() => {
        closeHandler(new Event('close'));
      });
    }

    expect(result.current.isConnected).toBe(false);
  });

  it('should handle connection error', () => {
    const { result } = renderHook(() => useWebSocket('test-event-id'));

    // Simular erro da conexão
    const errorHandler = mockWebSocket.addEventListener.mock.calls.find(
      call => call[0] === 'error'
    )?.[1];

    if (errorHandler) {
      act(() => {
        errorHandler(new Event('error'));
      });
    }

    expect(result.current.isConnected).toBe(false);
  });

  it('should dispatch queue update when receiving queue_update message', () => {
    const { result } = renderHook(() => useWebSocket('test-event-id'));

    const messageEvent = new MessageEvent('message', {
      data: JSON.stringify({
        type: 'queue_update',
        data: { queue: ['item1', 'item2'] }
      })
    });

    const messageHandler = mockWebSocket.addEventListener.mock.calls.find(
      call => call[0] === 'message'
    )?.[1];

    if (messageHandler) {
      act(() => {
        messageHandler(messageEvent);
      });
    }

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'UPDATE_QUEUE',
      payload: { queue: ['item1', 'item2'] }
    });
  });

  it('should dispatch notification when receiving notification message', () => {
    const { result } = renderHook(() => useWebSocket('test-event-id'));

    const messageEvent = new MessageEvent('message', {
      data: JSON.stringify({
        type: 'notification',
        data: { message: 'Test notification', type: 'info' }
      })
    });

    const messageHandler = mockWebSocket.addEventListener.mock.calls.find(
      call => call[0] === 'message'
    )?.[1];

    if (messageHandler) {
      act(() => {
        messageHandler(messageEvent);
      });
    }

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'ADD_NOTIFICATION',
      payload: { message: 'Test notification', type: 'info' }
    });
  });

  it('should dispatch currently playing update when receiving currently_playing message', () => {
    const { result } = renderHook(() => useWebSocket('test-event-id'));

    const messageEvent = new MessageEvent('message', {
      data: JSON.stringify({
        type: 'currently_playing',
        data: { song: 'Test Song', artist: 'Test Artist' }
      })
    });

    const messageHandler = mockWebSocket.addEventListener.mock.calls.find(
      call => call[0] === 'message'
    )?.[1];

    if (messageHandler) {
      act(() => {
        messageHandler(messageEvent);
      });
    }

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_CURRENTLY_PLAYING',
      payload: { song: 'Test Song', artist: 'Test Artist' }
    });
  });

  it('should dispatch connected users update when receiving connected_users message', () => {
    const { result } = renderHook(() => useWebSocket('test-event-id'));

    const messageEvent = new MessageEvent('message', {
      data: JSON.stringify({
        type: 'connected_users',
        data: { users: ['user1', 'user2'] }
      })
    });

    const messageHandler = mockWebSocket.addEventListener.mock.calls.find(
      call => call[0] === 'message'
    )?.[1];

    if (messageHandler) {
      act(() => {
        messageHandler(messageEvent);
      });
    }

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'UPDATE_CONNECTED_USERS',
      payload: { users: ['user1', 'user2'] }
    });
  });

  it('should clean up WebSocket connection on unmount', () => {
    const { unmount } = renderHook(() => useWebSocket('test-event-id'));

    unmount();

    expect(mockWebSocket.close).toHaveBeenCalled();
  });

  it('should handle invalid JSON messages gracefully', () => {
    const { result } = renderHook(() => useWebSocket('test-event-id'));

    const messageEvent = new MessageEvent('message', {
      data: 'invalid json'
    });

    const messageHandler = mockWebSocket.addEventListener.mock.calls.find(
      call => call[0] === 'message'
    )?.[1];

    if (messageHandler) {
      act(() => {
        messageHandler(messageEvent);
      });
    }

    // Should not throw error or crash
    expect(result.current.isConnected).toBe(false);
  });
});

