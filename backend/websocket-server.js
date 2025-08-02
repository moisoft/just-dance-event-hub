const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Criar servidor HTTP
const server = http.createServer(app);

// Criar servidor WebSocket
const wss = new WebSocket.Server({ server });

// Armazenar conexões ativas
const connections = new Map();
const rooms = new Map(); // Para diferentes eventos

// Estado global compartilhado
let globalState = {
  queue: [],
  connectedUsers: 0,
  notifications: [],
  events: []
};

// Função para broadcast para todos os clientes
function broadcast(message, excludeConnection = null) {
  const messageStr = JSON.stringify(message);
  connections.forEach((connectionData, ws) => {
    if (ws !== excludeConnection && ws.readyState === WebSocket.OPEN) {
      ws.send(messageStr);
    }
  });
}

// Função para enviar para usuários específicos
function sendToUserType(userType, message) {
  const messageStr = JSON.stringify(message);
  connections.forEach((connectionData, ws) => {
    if (connectionData.userType === userType && ws.readyState === WebSocket.OPEN) {
      ws.send(messageStr);
    }
  });
}

// Função para enviar para usuário específico
function sendToUser(userName, message) {
  const messageStr = JSON.stringify(message);
  connections.forEach((connectionData, ws) => {
    if (connectionData.userName === userName && ws.readyState === WebSocket.OPEN) {
      ws.send(messageStr);
    }
  });
}

wss.on('connection', (ws, req) => {
  console.log('Nova conexão WebSocket estabelecida');
  
  // Incrementar contador de usuários conectados
  globalState.connectedUsers++;
  
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('Mensagem recebida:', message);
      
      switch (message.type) {
        case 'USER_CONNECT':
          // Registrar informações do usuário
          connections.set(ws, {
            userName: message.payload.userName,
            userType: message.payload.userType,
            eventCode: message.payload.eventCode || 'default'
          });
          
          // Enviar estado atual para o novo usuário
          ws.send(JSON.stringify({
            type: 'INITIAL_STATE',
            payload: globalState
          }));
          
          // Notificar outros usuários sobre nova conexão
          broadcast({
            type: 'USER_JOINED',
            payload: {
              userName: message.payload.userName,
              userType: message.payload.userType,
              connectedUsers: globalState.connectedUsers
            }
          }, ws);
          break;
          
        case 'QUEUE_UPDATE':
          // Atualizar fila e notificar todos
          const queueUpdate = message.payload;
          
          // Encontrar e atualizar item na fila
          const queueIndex = globalState.queue.findIndex(item => item.id === queueUpdate.itemId);
          if (queueIndex !== -1) {
            globalState.queue[queueIndex].status = queueUpdate.status;
          }
          
          // Broadcast para todos os usuários
          broadcast({
            type: 'QUEUE_UPDATED',
            payload: {
              queue: globalState.queue,
              update: queueUpdate
            }
          });
          
          // Notificação específica para players
          if (queueUpdate.playerName) {
            sendToUserType('player', {
              type: 'NOTIFICATION',
              payload: {
                id: Date.now().toString(),
                message: `🎵 ${queueUpdate.songName} - ${queueUpdate.status === 'playing' ? 'tocando agora' : 'atualizada'}`,
                type: 'info',
                from: 'staff',
                timestamp: new Date()
              }
            });
          }
          break;
          
        case 'CHAT_MESSAGE':
          // Funcionalidade de chat removida
          console.log('Mensagem de chat recebida, mas a funcionalidade foi desativada');
          break;
          
        case 'ADMIN_ANNOUNCEMENT':
          // Anúncio do admin para todos
          const announcement = {
            id: Date.now().toString(),
            message: `📢 Admin: ${message.payload.message}`,
            type: 'info',
            from: 'admin',
            timestamp: new Date()
          };
          
          globalState.notifications.push(announcement);
          
          broadcast({
            type: 'NOTIFICATION',
            payload: announcement
          });
          break;
          
        case 'STAFF_UPDATE':
          // Atualização do staff
          const staffUpdate = {
            id: Date.now().toString(),
            message: `👨‍💼 Staff: ${message.payload.message}`,
            type: 'info',
            from: 'staff',
            timestamp: new Date()
          };
          
          globalState.notifications.push(staffUpdate);
          
          broadcast({
            type: 'NOTIFICATION',
            payload: staffUpdate
          });
          break;
          
        case 'PLAYER_JOIN_QUEUE':
          // Player se juntou à fila
          const newQueueItem = message.payload;
          globalState.queue.push(newQueueItem);
          
          // Enviar atualização da fila completa
          broadcast({
            type: 'QUEUE_UPDATED',
            payload: {
              queue: globalState.queue,
              update: {
                type: 'player_joined',
                playerName: newQueueItem.player?.nickname,
                songName: newQueueItem.song.name
              }
            }
          });
          
          // Enviar notificação específica de item adicionado
          broadcast({
            type: 'QUEUE_ITEM_ADDED',
            payload: newQueueItem
          });
          
          // Notificar staff sobre novo player na fila
          sendToUserType('staff', {
            type: 'NOTIFICATION',
            payload: {
              id: Date.now().toString(),
              message: `🎮 ${newQueueItem.player?.nickname} entrou na fila com "${newQueueItem.song.name}"`,
              type: 'info',
              from: 'system',
              timestamp: new Date()
            }
          });
          break;
          
        case 'HEARTBEAT':
          // Responder ao heartbeat
          ws.send(JSON.stringify({ type: 'HEARTBEAT_ACK' }));
          break;
          
        default:
          console.log('Tipo de mensagem desconhecido:', message.type);
      }
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
    }
  });
  
  ws.on('close', () => {
    console.log('Conexão WebSocket fechada');
    
    // Remover da lista de conexões
    const connectionData = connections.get(ws);
    connections.delete(ws);
    
    // Decrementar contador
    globalState.connectedUsers = Math.max(0, globalState.connectedUsers - 1);
    
    // Notificar outros usuários sobre desconexão
    if (connectionData) {
      broadcast({
        type: 'USER_LEFT',
        payload: {
          userName: connectionData.userName,
          userType: connectionData.userType,
          connectedUsers: globalState.connectedUsers
        }
      });
    }
  });
  
  ws.on('error', (error) => {
    console.error('Erro na conexão WebSocket:', error);
  });
});

// Rotas REST para integração com o frontend existente
app.get('/api/status', (req, res) => {
  res.json({
    connectedUsers: globalState.connectedUsers,
    queueLength: globalState.queue.length,
    notifications: globalState.notifications.length
  });
});

app.post('/api/queue', (req, res) => {
  const queueItem = req.body;
  globalState.queue.push(queueItem);
  
  // Notificar via WebSocket
  broadcast({
    type: 'QUEUE_UPDATED',
    payload: {
      queue: globalState.queue,
      update: {
        type: 'item_added',
        item: queueItem
      }
    }
  });
  
  res.json({ success: true, queue: globalState.queue });
});

app.put('/api/queue/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const queueIndex = globalState.queue.findIndex(item => item.id === id);
  if (queueIndex !== -1) {
    globalState.queue[queueIndex].status = status;
    
    // Notificar via WebSocket
    broadcast({
      type: 'QUEUE_UPDATED',
      payload: {
        queue: globalState.queue,
        update: {
          type: 'status_changed',
          itemId: id,
          status: status,
          item: globalState.queue[queueIndex]
        }
      }
    });
    
    res.json({ success: true, item: globalState.queue[queueIndex] });
  } else {
    res.status(404).json({ success: false, error: 'Item não encontrado' });
  }
});

app.get('/api/queue', (req, res) => {
  res.json({ success: true, data: globalState.queue });
});

// Limpar notificações antigas a cada hora
setInterval(() => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  globalState.notifications = globalState.notifications.filter(
    notification => new Date(notification.timestamp) > oneHourAgo
  );
}, 60 * 60 * 1000);

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🚀 Servidor WebSocket rodando na porta ${PORT}`);
  console.log(`📡 WebSocket endpoint: ws://localhost:${PORT}`);
  console.log(`🌐 API REST endpoint: http://localhost:${PORT}/api`);
});