import { Router } from 'express';
import TournamentController from '../controllers/tournamentController';
import authMiddleware from '../middlewares/authMiddleware';
import featureDisabledMiddleware from '../middlewares/featureDisabledMiddleware';

const router = Router();

// Aplicar middleware de funcionalidade desativada a todas as rotas de torneios
router.use(featureDisabledMiddleware('Torneios'));

// As rotas abaixo estão mantidas para referência, mas não serão acessíveis devido ao middleware acima

// Route to register a user for a tournament
router.post('/:id/tournaments/register', authMiddleware, TournamentController.register);

// Route to generate tournament bracket
router.post('/:id/tournaments/generate-bracket', authMiddleware, TournamentController.generateBracket);

export default router;