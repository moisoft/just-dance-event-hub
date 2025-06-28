import { Router } from 'express';
import queueController from '../controllers/queueController';
import authMiddleware from '../middlewares/authMiddleware';
import { requireModule } from '../middlewares/moduleMiddleware';
import { validate } from '../middlewares/validation';
import { queueSchemas } from '../middlewares/validation';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Adicionar música à fila (requer módulo queue ativo)
router.post('/:eventId', 
    requireModule('queue'),
    validate(queueSchemas.add),
    queueController.addToQueue
);

// Obter fila de um evento (requer módulo queue ativo)
router.get('/:eventId', 
    requireModule('queue'),
    queueController.getEventQueue
);

// Remover música da fila (requer módulo queue ativo)
router.delete('/:queueId', 
    requireModule('queue'),
    queueController.removeFromQueue
);

// Marcar música como tocada (requer módulo queue ativo)
router.put('/:queueId/play', 
    requireModule('queue'),
    queueController.markAsPlayed
);

export default router;