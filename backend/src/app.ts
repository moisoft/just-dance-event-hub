import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Importar rotas
import authRoutes from './routes/authRoutes';
import eventRoutes from './routes/eventRoutes';
import queueRoutes from './routes/queueRoutes';
import tournamentRoutes from './routes/tournamentRoutes';
import moduleRoutes from './routes/moduleRoutes';
import mockRoutes from './routes/mockRoutes';

// Importar middlewares
import { errorHandler } from './middlewares/errorHandler';

// Importar modelos para sincronização
import './models/user';
import './models/event';
import './models/music';
import './models/avatar';
import './models/tournament';
import './models/queue';
import './models/eventConfig';

// Importar configuração do banco
import { connectDB } from './utils/database';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();

// Configuração de rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // limite de 100 requests por IP
    message: {
        success: false,
        error: 'Muitas requisições, tente novamente mais tarde'
    }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // limite de 5 tentativas de login por IP
    message: {
        success: false,
        error: 'Muitas tentativas de login, tente novamente mais tarde'
    }
});

// Middleware de segurança
app.use(helmet());

// Configuração do CORS
app.use(cors({
    origin: process.env['FRONTEND_URL'] || 'http://localhost:3000',
    credentials: true
}));

// Rate limiting
app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);

// Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/queues', queueRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/modules', moduleRoutes);

// Rotas Mock (para teste sem banco de dados)
app.use('/api/mock', mockRoutes);

// Middleware de erro 404
app.use('*', (_req, res) => {
    res.status(404).json({
        success: false,
        error: 'Rota não encontrada'
    });
});

// Middleware de tratamento de erros (deve ser o último)
app.use(errorHandler);

// Rota de health check
app.get('/health', (_req, res) => {
    res.status(200).json({
        success: true,
        message: 'Just Dance Event Hub API está funcionando!',
        timestamp: new Date().toISOString(),
        environment: process.env['NODE_ENV'] || 'development'
    });
});

// Inicializar aplicação
const PORT = process.env['PORT'] || 3001;

const startServer = async () => {
    try {
        // Não conectar ao banco em ambiente de teste
        if (process.env['NODE_ENV'] !== 'test') {
            await connectDB();
        }
        
        app.listen(PORT, () => {
            console.log(`🚀 Servidor rodando na porta ${PORT}`);
            console.log(`📊 Health check: http://localhost:${PORT}/health`);
            console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
        });
    } catch (error) {
        console.error('❌ Erro ao iniciar servidor:', error);
        process.exit(1);
    }
};

// Só iniciar o servidor se não estiver em ambiente de teste
if (process.env['NODE_ENV'] !== 'test') {
    startServer();
}

export default app;