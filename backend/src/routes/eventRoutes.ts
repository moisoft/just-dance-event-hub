import { Router } from 'express';
import EventController from '../controllers/eventController';
import authMiddleware from '../middlewares/authMiddleware';

const router = Router();

// Rota para criar um novo evento (protegida)
router.post('/', authMiddleware, EventController.createEvent);

// Rota para obter detalhes de um evento
router.get('/:code', EventController.getEvent);

// Rota para listar todos os eventos
router.get('/', EventController.getAllEvents);

// Rota para atualizar um evento (protegida)
router.put('/:id', authMiddleware, EventController.updateEvent);

// Rota para deletar um evento (protegida)
router.delete('/:id', authMiddleware, EventController.deleteEvent);

export default router;