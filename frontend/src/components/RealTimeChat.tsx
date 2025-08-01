import React, { useState, useRef, useEffect } from 'react';
import { useEvent } from '../contexts/EventContext';
import { useWebSocket } from '../hooks/useWebSocket';

interface RealTimeChatProps {
  userType: 'admin' | 'staff' | 'player';
  userName: string;
  className?: string;
}

interface ChatMessage {
  id: string;
  from: string;
  userType: 'admin' | 'staff' | 'player';
  message: string;
  timestamp: Date;
  isPrivate?: boolean;
  targetUser?: string;
}

const RealTimeChat: React.FC<RealTimeChatProps> = ({ 
  userType, 
  userName, 
  className = '' 
}) => {
  const { state, dispatch } = useEvent();
  const { sendMessage } = useWebSocket({ 
    eventId: state.currentEvent?.id || '', 
    userRole: userType, 
    userId: userName 
  });
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isPrivateMode, setIsPrivateMode] = useState(false);
  const [targetUser, setTargetUser] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const getUserIcon = (type: string) => {
    switch (type) {
      case 'admin': return '👑';
      case 'staff': return '👨‍💼';
      case 'player': return '🎮';
      default: return '👤';
    }
  };

  const getUserColor = (type: string) => {
    switch (type) {
      case 'admin': return 'text-purple-400';
      case 'staff': return 'text-blue-400';
      case 'player': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'admin': return 'bg-purple-600/20 border-purple-500/30 text-purple-300';
      case 'staff': return 'bg-blue-600/20 border-blue-500/30 text-blue-300';
      case 'player': return 'bg-green-600/20 border-green-500/30 text-green-300';
      default: return 'bg-gray-600/20 border-gray-500/30 text-gray-300';
    }
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      from: userName,
      userType,
      message: message.trim(),
      timestamp: new Date(),
      isPrivate: isPrivateMode,
      targetUser: isPrivateMode ? targetUser : undefined
    };

    // Add to local chat
    setChatMessages(prev => [...prev, newMessage]);

    // Send via WebSocket
    sendMessage('CHAT_MESSAGE', newMessage);

    // Add notification for other users
    if (!isPrivateMode) {
      const from = userType === 'player' ? 'system' : userType as 'admin' | 'staff' | 'system';
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            id: Date.now().toString(),
            message: `${userName} (${userType}): ${message.trim()}`,
            type: 'info',
            from,
            timestamp: new Date()
          }
        });
    }

    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getOnlineUsers = () => {
    // Simulated online users - in real app, this would come from WebSocket
    return [
      { name: 'Admin Principal', type: 'admin' },
      { name: 'Staff João', type: 'staff' },
      { name: 'Staff Maria', type: 'staff' },
      { name: 'Player123', type: 'player' },
      { name: 'DanceMaster', type: 'player' }
    ].filter(user => user.name !== userName);
  };

  return (
    <div className={`fixed bottom-4 right-4 z-40 ${className}`}>
      {/* Chat Toggle Button */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-full p-3 text-white hover:bg-white/20 transition-all duration-300 shadow-lg"
        >
          <div className="relative">
            <span className="text-xl">💬</span>
            {chatMessages.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {chatMessages.length > 99 ? '99+' : chatMessages.length}
              </span>
            )}
          </div>
        </button>

        {/* Connection Status */}
        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${
          state.isConnected ? 'bg-green-500' : 'bg-red-500'
        }`} title={state.isConnected ? 'Chat Online' : 'Chat Offline'} />
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-96 h-96 bg-gray-900/95 backdrop-blur-lg border border-white/20 rounded-xl shadow-2xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-white/10 bg-gradient-to-r from-purple-600/20 to-blue-600/20">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <span>💬</span>
                Chat em Tempo Real
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

            {/* User Info */}
            <div className="flex items-center gap-2">
              <span className="text-lg">{getUserIcon(userType)}</span>
              <span className={`text-sm font-medium ${getUserColor(userType)}`}>
                {userName}
              </span>
              <span className={`text-xs px-2 py-0.5 border rounded-full ${getBadgeColor(userType)}`}>
                {userType === 'admin' ? 'Admin' : userType === 'staff' ? 'Staff' : 'Player'}
              </span>
            </div>

            {/* Private Mode Toggle */}
            {(userType === 'admin' || userType === 'staff') && (
              <div className="mt-2 flex items-center gap-2">
                <label className="flex items-center gap-2 text-xs text-white/70">
                  <input
                    type="checkbox"
                    checked={isPrivateMode}
                    onChange={(e) => setIsPrivateMode(e.target.checked)}
                    className="rounded"
                  />
                  Mensagem privada
                </label>
                {isPrivateMode && (
                  <select
                    value={targetUser}
                    onChange={(e) => setTargetUser(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded px-2 py-1 text-xs text-white"
                  >
                    <option value="">Selecionar usuário</option>
                    {getOnlineUsers().map((user) => (
                      <option key={user.name} value={user.name}>
                        {getUserIcon(user.type)} {user.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.length === 0 ? (
              <div className="text-center text-white/60 py-8">
                <span className="text-3xl mb-2 block">💭</span>
                <p>Nenhuma mensagem ainda</p>
                <p className="text-xs mt-1">Comece uma conversa!</p>
              </div>
            ) : (
              chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${
                    msg.from === userName ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div className="flex-shrink-0">
                    <span className="text-lg">{getUserIcon(msg.userType)}</span>
                  </div>
                  <div className={`flex-1 ${
                    msg.from === userName ? 'text-right' : ''
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium ${getUserColor(msg.userType)}`}>
                        {msg.from}
                      </span>
                      <span className="text-xs text-white/50">
                        {formatTime(msg.timestamp)}
                      </span>
                      {msg.isPrivate && (
                        <span className="text-xs px-1 py-0.5 bg-yellow-600/20 border border-yellow-500/30 rounded text-yellow-300">
                          🔒 Privada
                        </span>
                      )}
                    </div>
                    <div className={`p-2 rounded-lg text-sm ${
                      msg.from === userName
                        ? 'bg-purple-600/30 border border-purple-500/30 text-white'
                        : 'bg-white/10 border border-white/20 text-white/90'
                    }`}>
                      {msg.message}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/10">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isPrivateMode && targetUser ? `Mensagem privada para ${targetUser}...` : "Digite sua mensagem..."}
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:border-purple-500/50 text-sm"
                disabled={!state.isConnected || (isPrivateMode && !targetUser)}
              />
              <button
                onClick={handleSendMessage}
                disabled={!message.trim() || !state.isConnected || (isPrivateMode && !targetUser)}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
              >
                📤
              </button>
            </div>
            {!state.isConnected && (
              <p className="text-xs text-red-400 mt-1">⚠️ Desconectado - não é possível enviar mensagens</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RealTimeChat;