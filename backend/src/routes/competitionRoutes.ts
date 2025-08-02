// backend/src/routes/competitionRoutes.ts
import { Router } from 'express';
import { CompetitionController } from '../controllers/competitionController';
import authMiddleware from '../middlewares/authMiddleware';
import { validateCompetitionCreation, validateCompetitionRegistration } from '../middlewares/validation';
import featureDisabledMiddleware from '../middlewares/featureDisabledMiddleware';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Aplicar middleware de funcionalidade desativada a todas as rotas de competições
router.use(featureDisabledMiddleware('Competições'));

// Criar uma nova competição
router.post('/events/:eventId/competitions', validateCompetitionCreation, CompetitionController.createCompetition);

// Listar competições de um evento
router.get('/events/:eventId/competitions', CompetitionController.getEventCompetitions);

// Inscrever-se em uma competição
router.post('/competitions/:competitionId/register', validateCompetitionRegistration, CompetitionController.registerForCompetition);

// Obter detalhes de uma competição
router.get('/competitions/:competitionId', CompetitionController.getCompetitionDetails);

// Iniciar competição (gerar chaveamento)
router.post('/competitions/:competitionId/start', CompetitionController.startCompetition);

// Atualizar resultado de uma partida
router.patch('/competitions/:competitionId/matches/:matchId', CompetitionController.updateMatchResult);

// Finalizar competição
router.post('/competitions/:competitionId/finish', CompetitionController.finishCompetition);

// Cancelar competição
router.delete('/competitions/:competitionId', CompetitionController.cancelCompetition);

// Obter ranking da competição
router.get('/competitions/:competitionId/ranking', CompetitionController.getCompetitionRanking);

export default router;