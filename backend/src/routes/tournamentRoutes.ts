import { Router } from 'express';
import TournamentController from '../controllers/tournamentController';
import authMiddleware from '../middlewares/authMiddleware';

const router = Router();

// Route to register a user for a tournament
router.post('/:id/tournaments/register', authMiddleware, TournamentController.register);

// Route to generate tournament bracket
router.post('/:id/tournaments/generate-bracket', authMiddleware, TournamentController.generateBracket);

export default router;