// backend/src/routes/teamRoutes.ts
import { Router } from 'express';
import { TeamController } from '../controllers/teamController';
import authMiddleware from '../middlewares/authMiddleware';
import { validateTeamCreation, validateTeamJoin } from '../middlewares/validation';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Criar uma nova equipe
router.post('/events/:eventId/teams', validateTeamCreation, TeamController.createTeam);

// Listar equipes de um evento
router.get('/events/:eventId/teams', TeamController.getEventTeams);

// Entrar em uma equipe usando código de convite
router.post('/teams/join', validateTeamJoin, TeamController.joinTeam);

// Sair de uma equipe
router.delete('/teams/:teamId/leave', TeamController.leaveTeam);

// Obter detalhes de uma equipe específica
router.get('/teams/:teamId', TeamController.getTeamDetails);

// Dissolver uma equipe (apenas líder)
router.delete('/teams/:teamId', TeamController.dissolveTeam);

// Promover membro a líder
router.patch('/teams/:teamId/promote/:memberId', TeamController.promoteMember);

// Remover membro da equipe (apenas líder)
router.delete('/teams/:teamId/members/:memberId', TeamController.removeMember);

// Atualizar configurações da equipe
router.patch('/teams/:teamId', TeamController.updateTeam);

// Gerar novo código de convite
router.post('/teams/:teamId/regenerate-invite', TeamController.regenerateInviteCode);

export default router;