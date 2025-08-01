// backend/src/controllers/competitionController.ts
import { Request, Response } from 'express';
import Competition from '../models/competition';
import CompetitionParticipant from '../models/competitionParticipant';
import User from '../models/user';
import Team from '../models/team';
import TeamMember from '../models/teamMember';
import Event from '../models/event';

export class CompetitionController {
    // Criar uma nova competição
    static async createCompetition(req: Request, res: Response): Promise<void> {
        const { eventId } = req.params;
        const {
            nome,
            tipo,
            formato,
            max_participantes,
            data_inicio,
            data_fim,
            premio,
            taxa_inscricao,
            regras
        } = req.body;
        const userId = (req as any).user?.id;

        if (!userId) {
            res.status(401).json({ 
                success: false,
                message: 'Usuário não autenticado' 
            });
            return;
        }

        try {
            // Verificar se o evento existe
            const event = await Event.findByPk(eventId);
            if (!event) {
                res.status(404).json({ 
                    success: false,
                    message: 'Evento não encontrado' 
                });
                return;
            }

            // Verificar se o usuário tem permissão (organizador ou admin)
            const user = await User.findByPk(userId);
            if (!user || (event.id_organizador !== userId && user.papel !== 'admin')) {
                res.status(403).json({ 
                    success: false,
                    message: 'Sem permissão para criar competições neste evento' 
                });
                return;
            }

            // Criar a competição
            const competitionData: any = {
                id_evento: eventId!,
                nome,
                tipo: tipo || 'torneio',
                formato: formato || 'individual',
                max_participantes,
                participantes_atuais: 0,
                data_inicio: new Date(data_inicio),
                premio,
                taxa_inscricao: taxa_inscricao || 0,
                regras,
                status: 'inscricoes'
            };

            if (data_fim) {
                competitionData.data_fim = new Date(data_fim);
            }

            const competition = await Competition.create(competitionData);

            res.status(201).json({ 
                success: true,
                message: 'Competição criada com sucesso',
                data: competition
            });
        } catch (error) {
            console.error('Erro ao criar competição:', error);
            res.status(500).json({ 
                success: false,
                message: 'Erro interno do servidor' 
            });
        }
    }

    // Listar competições de um evento
    static async getEventCompetitions(req: Request, res: Response): Promise<void> {
        const { eventId } = req.params;
        const { page = 1, limit = 10, status, tipo } = req.query;

        try {
            const whereClause: any = {
                id_evento: eventId
            };

            if (status) {
                whereClause.status = status;
            }

            if (tipo) {
                whereClause.tipo = tipo;
            }

            const offset = (Number(page) - 1) * Number(limit);

            const { count, rows: competitions } = await Competition.findAndCountAll({
                where: whereClause,
                include: [
                    {
                        model: Event,
                        as: 'evento',
                        attributes: ['id', 'nome_evento', 'codigo_evento']
                    }
                ],
                limit: Number(limit),
                offset,
                order: [['data_inicio', 'ASC']]
            });

            res.json({ 
                success: true,
                data: competitions,
                pagination: {
                    total: count,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(count / Number(limit))
                }
            });
        } catch (error) {
            console.error('Erro ao buscar competições:', error);
            res.status(500).json({ 
                success: false,
                message: 'Erro interno do servidor' 
            });
        }
    }

    // Inscrever-se em uma competição
    static async registerForCompetition(req: Request, res: Response): Promise<void> {
        const { competitionId } = req.params;
        const { team_id } = req.body; // Opcional, para competições em equipe
        const userId = (req as any).user?.id;

        if (!userId) {
            res.status(401).json({ 
                success: false,
                message: 'Usuário não autenticado' 
            });
            return;
        }

        try {
            const competition = await Competition.findByPk(competitionId);
            if (!competition) {
                res.status(404).json({ 
                    success: false,
                    message: 'Competição não encontrada' 
                });
                return;
            }

            // Verificar se as inscrições estão abertas
            if (competition.status !== 'inscricoes') {
                res.status(400).json({ 
                    success: false,
                    message: 'Inscrições não estão abertas para esta competição' 
                });
                return;
            }

            // Verificar se ainda há vagas
            if (competition.participantes_atuais >= competition.max_participantes) {
                res.status(400).json({ 
                    success: false,
                    message: 'Competição já está lotada' 
                });
                return;
            }

            let tipoParticipacao: 'individual' | 'equipe';
            let teamToRegister = null;

            if (competition.formato === 'equipe') {
                if (!team_id) {
                    res.status(400).json({ 
                        success: false,
                        message: 'ID da equipe é obrigatório para competições em equipe' 
                    });
                    return;
                }

                // Verificar se a equipe existe e se o usuário é membro
                teamToRegister = await Team.findByPk(team_id, {
                    include: [{
                        model: TeamMember,
                        as: 'membros',
                        where: {
                            id_usuario: userId,
                            status: 'ativo'
                        }
                    }]
                });

                if (!teamToRegister || !teamToRegister.membros?.length) {
                    res.status(403).json({ 
                        success: false,
                        message: 'Você não faz parte desta equipe' 
                    });
                    return;
                }

                // Verificar se a equipe já está inscrita
                const existingTeamRegistration = await CompetitionParticipant.findOne({
                    where: {
                        id_competition: competitionId!,
                        id_team: team_id
                    } as any
                });

                if (existingTeamRegistration) {
                    res.status(400).json({ 
                        success: false,
                        message: 'Esta equipe já está inscrita na competição' 
                    });
                    return;
                }

                tipoParticipacao = 'equipe';
            } else {
                // Competição individual
                // Verificar se o usuário já está inscrito
                const existingRegistration = await CompetitionParticipant.findOne({
                    where: {
                        id_competition: competitionId!,
                        id_usuario: userId
                    } as any
                });

                if (existingRegistration) {
                    res.status(400).json({ 
                        success: false,
                        message: 'Você já está inscrito nesta competição' 
                    });
                    return;
                }

                tipoParticipacao = 'individual';
            }

            // Criar a inscrição
            const participantData: any = {
                id_competition: competitionId!,
                tipo_participacao: tipoParticipacao,
                status: 'inscrito',
                data_inscricao: new Date()
            };

            if (tipoParticipacao === 'individual') {
                participantData.id_usuario = userId!;
            } else {
                participantData.id_team = team_id;
            }

            const participant = await CompetitionParticipant.create(participantData);

            // Atualizar contador de participantes
            await competition.increment('participantes_atuais');

            res.status(201).json({ 
                success: true,
                message: 'Inscrição realizada com sucesso',
                data: participant
            });
        } catch (error) {
            console.error('Erro ao inscrever na competição:', error);
            res.status(500).json({ 
                success: false,
                message: 'Erro interno do servidor' 
            });
        }
    }

    // Obter detalhes de uma competição
    static async getCompetitionDetails(req: Request, res: Response): Promise<void> {
        const { competitionId } = req.params;

        try {
            const competition = await Competition.findByPk(competitionId, {
                include: [
                    {
                        model: Event,
                        as: 'evento',
                        attributes: ['id', 'nome_evento', 'codigo_evento']
                    },
                    {
                        model: CompetitionParticipant,
                        as: 'participantes',
                        include: [
                            {
                                model: User,
                                as: 'usuario',
                                attributes: ['id', 'nickname', 'avatar_ativo_url', 'nivel', 'xp']
                            },
                            {
                                model: Team,
                                as: 'team',
                                attributes: ['id', 'nome', 'status'],
                                include: [{
                                    model: TeamMember,
                                    as: 'membros',
                                    include: [{
                                        model: User,
                                        as: 'usuario',
                                        attributes: ['id', 'nickname', 'avatar_ativo_url']
                                    }]
                                }]
                            }
                        ]
                    }
                ]
            });

            if (!competition) {
                res.status(404).json({ 
                    success: false,
                    message: 'Competição não encontrada' 
                });
                return;
            }

            res.json({ 
                success: true,
                data: competition
            });
        } catch (error) {
            console.error('Erro ao buscar detalhes da competição:', error);
            res.status(500).json({ 
                success: false,
                message: 'Erro interno do servidor' 
            });
        }
    }

    // Iniciar competição (gerar chaveamento)
    static async startCompetition(req: Request, res: Response): Promise<void> {
        const { competitionId } = req.params;
        const userId = (req as any).user?.id;

        if (!userId) {
            res.status(401).json({ 
                success: false,
                message: 'Usuário não autenticado' 
            });
            return;
        }

        try {
            const competition = await Competition.findByPk(competitionId, {
                include: [{
                    model: Event,
                    as: 'evento'
                }]
            });

            if (!competition) {
                res.status(404).json({ 
                    success: false,
                    message: 'Competição não encontrada' 
                });
                return;
            }

            // Verificar permissões
            const user = await User.findByPk(userId);
            if (!user || (competition.evento?.id_organizador !== userId && user.papel !== 'admin')) {
                res.status(403).json({ 
                    success: false,
                    message: 'Sem permissão para iniciar esta competição' 
                });
                return;
            }

            if (competition.status !== 'inscricoes') {
                res.status(400).json({ 
                    success: false,
                    message: 'Competição não está em fase de inscrições' 
                });
                return;
            }

            // Verificar se há participantes suficientes
            if (competition.participantes_atuais < 2) {
                res.status(400).json({ 
                    success: false,
                    message: 'Número insuficiente de participantes para iniciar a competição' 
                });
                return;
            }

            // Buscar todos os participantes
            const participants = await CompetitionParticipant.findAll({
                where: {
                    id_competition: competitionId,
                    status: 'inscrito'
                } as any,
                include: [
                    {
                        model: User,
                        as: 'usuario',
                        attributes: ['id', 'nickname']
                    },
                    {
                        model: Team,
                        as: 'team',
                        attributes: ['id', 'nome']
                    }
                ]
            });

            // Gerar chaveamento simples (eliminação simples)
            const bracket = generateSimpleBracket(participants);

            // Atualizar competição
            await competition.update({
                status: 'em_andamento',
                chaveamento: bracket
            });

            // Confirmar todos os participantes
            await CompetitionParticipant.update(
                { status: 'confirmado' },
                {
                    where: {
                        id_competicao: competitionId,
                        status: 'inscrito'
                    } as any
                }
            );

            res.json({ 
                success: true,
                message: 'Competição iniciada com sucesso',
                data: {
                    competition,
                    bracket
                }
            });
        } catch (error) {
            console.error('Erro ao iniciar competição:', error);
            res.status(500).json({ 
                success: false,
                message: 'Erro interno do servidor' 
            });
        }
    }

    // Atualizar resultado de uma partida
    static async updateMatchResult(req: Request, res: Response): Promise<void> {
        const { competitionId, matchId } = req.params;
        const { winner_id, score } = req.body;
        const userId = (req as any).user?.id;

        if (!userId) {
            res.status(401).json({ 
                success: false,
                message: 'Usuário não autenticado' 
            });
            return;
        }

        try {
            const competition = await Competition.findByPk(competitionId, {
                include: [{
                    model: Event,
                    as: 'evento'
                }]
            });

            if (!competition) {
                res.status(404).json({ 
                    success: false,
                    message: 'Competição não encontrada' 
                });
                return;
            }

            // Verificar permissões
            const user = await User.findByPk(userId);
            if (!user || (competition.evento?.id_organizador !== userId && user.papel !== 'admin' && user.papel !== 'staff')) {
                res.status(403).json({ 
                    success: false,
                    message: 'Sem permissão para atualizar resultados desta competição' 
                });
                return;
            }

            // Atualizar chaveamento com o resultado
            const bracket = competition.chaveamento || {};
            if (bracket.matches && matchId && bracket.matches[matchId]) {
                bracket.matches[matchId].winner_id = winner_id;
                bracket.matches[matchId].score = score;
                bracket.matches[matchId].completed = true;
            }

            await competition.update({ chaveamento: bracket });

            res.json({ 
                success: true,
                message: 'Resultado atualizado com sucesso',
                data: bracket
            });
        } catch (error) {
            console.error('Erro ao atualizar resultado:', error);
            res.status(500).json({ 
                success: false,
                message: 'Erro interno do servidor' 
            });
        }
    }

    // Finalizar competição
    static async finishCompetition(req: Request, res: Response): Promise<void> {
        const { competitionId } = req.params;
        const { final_ranking } = req.body;
        const userId = (req as any).user?.id;

        if (!userId) {
            res.status(401).json({ 
                success: false,
                message: 'Usuário não autenticado' 
            });
            return;
        }

        try {
            const competition = await Competition.findByPk(competitionId, {
                include: [{
                    model: Event,
                    as: 'evento'
                }]
            });

            if (!competition) {
                res.status(404).json({ 
                    success: false,
                    message: 'Competição não encontrada' 
                });
                return;
            }

            // Verificar permissões
            const user = await User.findByPk(userId);
            if (!user || (competition.evento?.id_organizador !== userId && user.papel !== 'admin')) {
                res.status(403).json({ 
                    success: false,
                    message: 'Sem permissão para finalizar esta competição' 
                });
                return;
            }

            if (competition.status !== 'em_andamento') {
                res.status(400).json({ 
                    success: false,
                    message: 'Competição não está em andamento' 
                });
                return;
            }

            // Atualizar posições finais dos participantes
            if (final_ranking && Array.isArray(final_ranking)) {
                for (const ranking of final_ranking) {
                    await CompetitionParticipant.update(
                        { 
                            posicao_final: ranking.position,
                            pontuacao_total: ranking.score || 0,
                            status: ranking.position === 1 ? 'vencedor' : 'eliminado'
                        },
                        {
                            where: {
                                id_competition: competitionId,
                                id: ranking.participant_id
                            } as any
                        }
                    );
                }
            }

            // Finalizar competição
            await competition.update({
                status: 'finalizado',
                data_fim: new Date()
            });

            res.json({ 
                success: true,
                message: 'Competição finalizada com sucesso',
                data: competition
            });
        } catch (error) {
            console.error('Erro ao finalizar competição:', error);
            res.status(500).json({ 
                success: false,
                message: 'Erro interno do servidor' 
            });
        }
    }

    // Cancelar competição
    static async cancelCompetition(req: Request, res: Response): Promise<void> {
        const { competitionId } = req.params;
        const { motivo } = req.body;
        const userId = (req as any).user?.id;

        if (!userId) {
            res.status(401).json({ 
                success: false,
                message: 'Usuário não autenticado' 
            });
            return;
        }

        try {
            const competition = await Competition.findByPk(competitionId, {
                include: [{
                    model: Event,
                    as: 'evento'
                }]
            });

            if (!competition) {
                res.status(404).json({ 
                    success: false,
                    message: 'Competição não encontrada' 
                });
                return;
            }

            // Verificar permissões
            const user = await User.findByPk(userId);
            if (!user || (competition.evento?.id_organizador !== userId && user.papel !== 'admin')) {
                res.status(403).json({ 
                    success: false,
                    message: 'Sem permissão para cancelar esta competição' 
                });
                return;
            }

            if (competition.status === 'finalizado' || competition.status === 'cancelado') {
                res.status(400).json({ 
                    success: false,
                    message: 'Competição já foi finalizada ou cancelada' 
                });
                return;
            }

            // Cancelar competição
            await competition.update({
                status: 'cancelado',
                regras: competition.regras ? `${competition.regras}\n\nMotivo do cancelamento: ${motivo || 'Não informado'}` : `Motivo do cancelamento: ${motivo || 'Não informado'}`
            });

            // Atualizar status dos participantes
            await CompetitionParticipant.update(
                { status: 'desistente' },
                {
                    where: {
                        id_competition: competitionId
                    } as any
                }
            );

            res.json({ 
                success: true,
                message: 'Competição cancelada com sucesso',
                data: competition
            });
        } catch (error) {
            console.error('Erro ao cancelar competição:', error);
            res.status(500).json({ 
                success: false,
                message: 'Erro interno do servidor' 
            });
        }
    }

    // Obter ranking da competição
    static async getCompetitionRanking(req: Request, res: Response): Promise<void> {
        const { competitionId } = req.params;

        try {
            const competition = await Competition.findByPk(competitionId);
            if (!competition) {
                res.status(404).json({ 
                    success: false,
                    message: 'Competição não encontrada' 
                });
                return;
            }

            const participants = await CompetitionParticipant.findAll({
                where: {
                    id_competition: competitionId
                } as any,
                include: [
                    {
                        model: User,
                        as: 'usuario',
                        attributes: ['id', 'nickname', 'avatar_ativo_url', 'nivel', 'xp']
                    },
                    {
                        model: Team,
                        as: 'team',
                        attributes: ['id', 'nome'],
                        include: [{
                            model: TeamMember,
                            as: 'membros',
                            include: [{
                                model: User,
                                as: 'usuario',
                                attributes: ['id', 'nickname', 'avatar_ativo_url']
                            }]
                        }]
                    }
                ],
                order: [
                    ['posicao_final', 'ASC'],
                    ['pontuacao_total', 'DESC'],
                    ['data_inscricao', 'ASC']
                ]
            });

            const ranking = participants.map((participant, index) => ({
                posicao: participant.posicao_final || index + 1,
                participante: participant.tipo_participacao === 'individual' 
                    ? participant.usuario 
                    : participant.team,
                tipo: participant.tipo_participacao,
                pontuacao: participant.pontuacao_total || 0,
                status: participant.status
            }));

            res.json({ 
                success: true,
                data: {
                    competition: {
                        id: competition.id,
                        nome: competition.nome,
                        status: competition.status,
                        formato: competition.formato
                    },
                    ranking
                }
            });
        } catch (error) {
            console.error('Erro ao buscar ranking da competição:', error);
            res.status(500).json({ 
                success: false,
                message: 'Erro interno do servidor' 
            });
        }
    }
}

// Função auxiliar para gerar chaveamento simples
function generateSimpleBracket(participants: any[]): any {
    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    const matches: any[] = [];
    
    for (let i = 0; i < shuffled.length; i += 2) {
        if (i + 1 < shuffled.length) {
            matches.push({
                id: `match_${i / 2 + 1}`,
                participant1: shuffled[i],
                participant2: shuffled[i + 1],
                winner_id: null,
                score: null,
                completed: false,
                round: 1
            });
        } else {
            // Participante ímpar passa direto
            matches.push({
                id: `match_${i / 2 + 1}`,
                participant1: shuffled[i],
                participant2: null,
                winner_id: shuffled[i].id,
                score: 'BYE',
                completed: true,
                round: 1
            });
        }
    }
    
    return {
        matches,
        currentRound: 1,
        totalRounds: Math.ceil(Math.log2(participants.length))
    };
}

export default CompetitionController;