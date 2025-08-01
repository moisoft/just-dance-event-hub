import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { Request, Response } from 'express';

// Importar rotas
import authRoutes from './routes/authRoutes';
import eventRoutes from './routes/eventRoutes';
import queueRoutes from './routes/queueRoutes';
import tournamentRoutes from './routes/tournamentRoutes';
import moduleRoutes from './routes/moduleRoutes';
import mockRoutes from './routes/mockRoutes';
import pluginRoutes from './routes/pluginRoutes';
import adminRoutes from './routes/adminRoutes';
import teamRoutes from './routes/teamRoutes';
import competitionRoutes from './routes/competitionRoutes';

// Importar middlewares
import { errorHandler } from './middlewares/errorHandler';
import { i18nMiddleware } from './middlewares/i18nMiddleware';

// Importar modelos para sincronização
import './models/user';
import './models/event';
import './models/music';
import './models/avatar';
import './models/tournament';
import './models/queue';
import './models/eventConfig';
import './models/team';
import './models/teamMember';
import './models/competition';
import './models/competitionParticipant';

// Importar configuração do banco
import { connectDB } from './utils/database';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();

// Middleware de segurança
app.use(helmet());

// Middleware de internacionalização (deve vir antes dos rate limiters)
app.use(i18nMiddleware);

// Configuração de rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // limite de 100 requests por IP
    message: (_req: Request, res: Response) => ({
        success: false,
        error: res.__('error.rate_limit')
    })
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // limite de 5 tentativas de login por IP
    message: (_req: Request, res: Response) => ({
        success: false,
        error: res.__('error.auth_rate_limit')
    })
});

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
app.use('/api/teams', teamRoutes);
app.use('/api/competitions', competitionRoutes);
app.use('/admin', adminRoutes);

// Rotas Mock (para teste sem banco de dados)
app.use('/api/mock', mockRoutes);

// Rotas de plugins
app.use('/api/plugins', pluginRoutes);

// Rota de health check
app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: res.__('system.health_check')
    });
});

// Middleware de erro 404
app.use('*', (_req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        error: res.__('error.route_not_found')
    });
});

// Middleware de tratamento de erros (deve ser o último)
app.use(errorHandler);

// Conectar ao banco de dados e iniciar servidor
connectDB().then(() => {
    const port = process.env['PORT'] || 3001;
    app.listen(port, () => {
        console.log(`Servidor rodando na porta ${port}`);
    });
}).catch(error => {
    console.error('Erro ao conectar ao banco de dados:', error);
    process.exit(1);
});

export default app;