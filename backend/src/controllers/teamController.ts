// backend/src/controllers/teamController.ts
import { Request, Response } from 'express';
import Team from '../models/team';
import TeamMember from '../models/teamMember';
import User from '../models/user';
import Event from '../models/event';

import '../types';

// Função auxiliar para gerar código de convite
function generateInviteCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export class TeamController {
    // Criar uma nova equipe
    static async createTeam(req: Request, res: Response): Promise<void> {
        const { eventId } = req.params;
        const { nome, max_membros } = req.body;
        const userId = req.user?.id;

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

            // Verificar se o usuário já é líder de alguma equipe neste evento
            const existingTeam = await Team.findOne({
                where: {
                    id_evento: eventId,
                    lider_id: userId,
                    status: ['formacao', 'completa', 'ativa']
                } as any
            });

            if (existingTeam) {
                res.status(400).json({ 
                    success: false,
                    message: 'Você já é líder de uma equipe neste evento' 
                });
                return;
            }

            // Verificar se o usuário já é membro de alguma equipe neste evento
            const existingMembership = await TeamMember.findOne({
                include: [{
                    model: Team,
                    as: 'team',
                    where: {
                        id_evento: eventId,
                        status: ['formacao', 'completa', 'ativa']
                    }
                }],
                where: {
                    id_usuario: userId,
                    status: ['ativo', 'convidado']
                } as any
            });

            if (existingMembership) {
                res.status(400).json({ 
                    success: false,
                    message: 'Você já faz parte de uma equipe neste evento' 
                });
                return;
            }

            // Gerar código de convite único
            const codigoConvite = Math.random().toString(36).substring(2, 8).toUpperCase();

            // Criar a equipe
            const team = await Team.create({
                id_evento: eventId!,
                nome,
                lider_id: userId!,
                max_membros: max_membros || 4,
                codigo_convite: codigoConvite,
                status: 'formacao'
            });

            // Adicionar o líder como membro da equipe
            await TeamMember.create({
                id_team: team.id,
                id_usuario: userId,
                papel: 'lider',
                status: 'ativo'
            });

            res.status(201).json({ 
                success: true,
                message: 'Equipe criada com sucesso',
                data: team
            });
        } catch (error) {
            console.error('Erro ao criar equipe:', error);
            res.status(500).json({ 
                success: false,
                message: 'Erro interno do servidor' 
            });
        }
    }

    // Listar equipes de um evento
    static async getEventTeams(req: Request, res: Response): Promise<void> {
        const { eventId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        try {
            const offset = (Number(page) - 1) * Number(limit);

            const { count, rows: teams } = await Team.findAndCountAll({
                where: {
                    id_evento: eventId
                } as any,
                include: [
                    {
                        model: User,
                        as: 'lider',
                        attributes: ['id', 'nickname', 'avatar_ativo_url']
                    },
                    {
                        model: TeamMember,
                        as: 'membros',
                        include: [{
                            model: User,
                            as: 'usuario',
                            attributes: ['id', 'nickname', 'avatar_ativo_url', 'nivel', 'xp']
                        }]
                    }
                ],
                limit: Number(limit),
                offset,
                order: [['created_at', 'DESC']]
            });

            res.json({ 
                success: true,
                data: teams,
                pagination: {
                    total: count,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(count / Number(limit))
                }
            });
        } catch (error) {
            console.error('Erro ao buscar equipes:', error);
            res.status(500).json({ 
                success: false,
                message: 'Erro interno do servidor' 
            });
        }
    }

    // Entrar em uma equipe usando código de convite
    static async joinTeam(req: Request, res: Response): Promise<void> {
        const { codigo_convite } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ 
                success: false,
                message: 'Usuário não autenticado' 
            });
            return;
        }

        try {
            // Buscar a equipe pelo código de convite
            const team = await Team.findOne({
                where: {
                    codigo_convite,
                    status: ['formacao', 'completa']
                } as any,
                include: [{
                    model: TeamMember,
                    as: 'membros'
                }]
            });

            if (!team) {
                res.status(404).json({ 
                    success: false,
                    message: 'Código de convite inválido ou equipe não encontrada' 
                });
                return;
            }

            // Verificar se a equipe ainda tem vagas
            const currentMembers = team.membros?.length || 0;
            if (currentMembers >= team.max_membros) {
                res.status(400).json({ 
                    success: false,
                    message: 'Equipe já está completa' 
                });
                return;
            }

            // Verificar se o usuário já faz parte da equipe
            const existingMember = team.membros?.find(member => member.id_usuario === userId);
            if (existingMember) {
                res.status(400).json({ 
                    success: false,
                    message: 'Você já faz parte desta equipe' 
                });
                return;
            }

            // Verificar se o usuário já faz parte de outra equipe no mesmo evento
            const existingMembership = await TeamMember.findOne({
                include: [{
                    model: Team,
                    as: 'team',
                    where: {
                        id_evento: team.id_evento,
                        status: ['formacao', 'completa', 'ativa']
                    }
                }],
                where: {
                    id_usuario: userId,
                    status: ['ativo', 'convidado']
                }
            });

            if (existingMembership) {
                res.status(400).json({ 
                    success: false,
                    message: 'Você já faz parte de uma equipe neste evento' 
                });
                return;
            }

            // Adicionar o usuário à equipe
            await TeamMember.create({
                id_team: team.id,
                id_usuario: userId,
                papel: 'membro',
                status: 'ativo'
            });

            // Verificar se a equipe ficou completa
            const newMemberCount = currentMembers + 1;
            if (newMemberCount >= team.max_membros) {
                await team.update({ status: 'completa' });
            }

            res.json({ 
                success: true,
                message: 'Você entrou na equipe com sucesso',
                data: team
            });
        } catch (error) {
            console.error('Erro ao entrar na equipe:', error);
            res.status(500).json({ 
                success: false,
                message: 'Erro interno do servidor' 
            });
        }
    }

    // Sair de uma equipe
    static async leaveTeam(req: Request, res: Response): Promise<void> {
        const { teamId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ 
                success: false,
                message: 'Usuário não autenticado' 
            });
            return;
        }

        try {
            const team = await Team.findByPk(teamId);
            if (!team) {
                res.status(404).json({ 
                    success: false,
                    message: 'Equipe não encontrada' 
                });
                return;
            }

            const membership = await TeamMember.findOne({
                where: {
                    id_team: teamId,
                    id_usuario: userId,
                    status: 'ativo'
                } as any
            });

            if (!membership) {
                res.status(404).json({ 
                    success: false,
                    message: 'Você não faz parte desta equipe' 
                });
                return;
            }

            // Se for o líder, não pode sair (deve transferir liderança ou dissolver equipe)
            if (membership.papel === 'lider') {
                res.status(400).json({ 
                    success: false,
                    message: 'Líderes não podem sair da equipe. Transfira a liderança ou dissolva a equipe.' 
                });
                return;
            }

            // Remover o membro
            await membership.destroy();

            // Atualizar status da equipe se necessário
            const remainingMembers = await TeamMember.count({
                where: {
                    id_team: teamId,
                    status: 'ativo'
                } as any
            });

            if (remainingMembers < team.max_membros && team.status === 'completa') {
                await team.update({ status: 'formacao' });
            }

            res.json({ 
                success: true,
                message: 'Você saiu da equipe com sucesso'
            });
        } catch (error) {
            console.error('Erro ao sair da equipe:', error);
            res.status(500).json({ 
                success: false,
                message: 'Erro interno do servidor' 
            });
        }
    }

    // Obter detalhes de uma equipe
    static async getTeamDetails(req: Request, res: Response): Promise<void> {
        const { teamId } = req.params;

        try {
            const team = await Team.findByPk(teamId, {
                include: [
                    {
                        model: User,
                        as: 'lider',
                        attributes: ['id', 'nickname', 'avatar_ativo_url', 'nivel', 'xp']
                    },
                    {
                        model: TeamMember,
                        as: 'membros',
                        include: [{
                            model: User,
                            as: 'usuario',
                            attributes: ['id', 'nickname', 'avatar_ativo_url', 'nivel', 'xp']
                        }],
                        where: {
                            status: 'ativo'
                        }
                    },
                    {
                        model: Event,
                        as: 'evento',
                        attributes: ['id', 'nome_evento', 'codigo_evento']
                    }
                ]
            });

            if (!team) {
                res.status(404).json({ 
                    success: false,
                    message: 'Equipe não encontrada' 
                });
                return;
            }

            res.json({ 
                success: true,
                data: team
            });
        } catch (error) {
            console.error('Erro ao buscar detalhes da equipe:', error);
            res.status(500).json({ 
                success: false,
                message: 'Erro interno do servidor' 
            });
        }
    }

    // Dissolver equipe (apenas líder)
    static async dissolveTeam(req: Request, res: Response): Promise<void> {
        const { teamId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ 
                success: false,
                message: 'Usuário não autenticado' 
            });
            return;
        }

        try {
            const team = await Team.findByPk(teamId);
            if (!team) {
                res.status(404).json({ 
                    success: false,
                    message: 'Equipe não encontrada' 
                });
                return;
            }

            if (team.lider_id !== userId) {
                res.status(403).json({ 
                    success: false,
                    message: 'Apenas o líder pode dissolver a equipe' 
                });
                return;
            }

            // Remover todos os membros
            await TeamMember.destroy({
                where: {
                    id_team: teamId
                } as any
            });

            // Marcar equipe como eliminada
            await team.update({ status: 'eliminada' });

            res.json({ 
                success: true,
                message: 'Equipe dissolvida com sucesso'
            });
        } catch (error) {
            console.error('Erro ao dissolver equipe:', error);
            res.status(500).json({ 
                success: false,
                message: 'Erro interno do servidor' 
            });
        }
    }

    // Promover membro a líder
    static async promoteMember(req: Request, res: Response): Promise<void> {
        const { teamId, memberId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ 
                success: false,
                message: 'Usuário não autenticado' 
            });
            return;
        }

        try {
            const team = await Team.findByPk(teamId);
            if (!team) {
                res.status(404).json({ 
                    success: false,
                    message: 'Equipe não encontrada' 
                });
                return;
            }

            // Verificar se o usuário é o líder atual
            if (team.lider_id !== userId) {
                res.status(403).json({ 
                    success: false,
                    message: 'Apenas o líder pode promover membros' 
                });
                return;
            }

            // Verificar se o membro existe na equipe
            const member = await TeamMember.findOne({
                where: {
                    id_team: teamId,
                    id_usuario: memberId,
                    status: 'ativo'
                } as any
            });

            if (!member) {
                res.status(404).json({ 
                    success: false,
                    message: 'Membro não encontrado na equipe' 
                });
                return;
            }

            // Atualizar líder da equipe
            await team.update({ lider_id: memberId! });

            // Atualizar papel do antigo líder para membro
            await TeamMember.update(
                { papel: 'membro' },
                {
                    where: {
                        id_team: teamId,
                        id_usuario: userId
                    } as any
                }
            );

            // Atualizar papel do novo líder
            await member.update({ papel: 'lider' });

            res.json({ 
                success: true,
                message: 'Membro promovido a líder com sucesso'
            });
        } catch (error) {
            console.error('Erro ao promover membro:', error);
            res.status(500).json({ 
                success: false,
                message: 'Erro interno do servidor' 
            });
        }
    }

    // Remover membro da equipe (apenas líder)
    static async removeMember(req: Request, res: Response): Promise<void> {
        const { teamId, memberId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ 
                success: false,
                message: 'Usuário não autenticado' 
            });
            return;
        }

        try {
            const team = await Team.findByPk(teamId);
            if (!team) {
                res.status(404).json({ 
                    success: false,
                    message: 'Equipe não encontrada' 
                });
                return;
            }

            // Verificar se o usuário é o líder
            if (team.lider_id !== userId) {
                res.status(403).json({ 
                    success: false,
                    message: 'Apenas o líder pode remover membros' 
                });
                return;
            }

            // Não permitir que o líder se remova
            if (memberId === userId) {
                res.status(400).json({ 
                    success: false,
                    message: 'O líder não pode se remover da equipe. Transfira a liderança primeiro.' 
                });
                return;
            }

            // Verificar se o membro existe na equipe
            const member = await TeamMember.findOne({
                where: {
                    id_team: teamId,
                    id_usuario: memberId,
                    status: 'ativo'
                } as any
            });

            if (!member) {
                res.status(404).json({ 
                    success: false,
                    message: 'Membro não encontrado na equipe' 
                });
                return;
            }

            // Remover membro
            await member.destroy();

            res.json({ 
                success: true,
                message: 'Membro removido da equipe com sucesso'
            });
        } catch (error) {
            console.error('Erro ao remover membro:', error);
            res.status(500).json({ 
                success: false,
                message: 'Erro interno do servidor' 
            });
        }
    }

    // Atualizar configurações da equipe
    static async updateTeam(req: Request, res: Response): Promise<void> {
        const { teamId } = req.params;
        const { nome, max_membros } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ 
                success: false,
                message: 'Usuário não autenticado' 
            });
            return;
        }

        try {
            const team = await Team.findByPk(teamId);
            if (!team) {
                res.status(404).json({ 
                    success: false,
                    message: 'Equipe não encontrada' 
                });
                return;
            }

            // Verificar se o usuário é o líder
            if (team.lider_id !== userId) {
                res.status(403).json({ 
                    success: false,
                    message: 'Apenas o líder pode atualizar a equipe' 
                });
                return;
            }

            // Verificar se o novo nome já existe no evento (se fornecido)
            if (nome && nome !== team.nome) {
                const existingTeam = await Team.findOne({
                    where: {
                        id_evento: team.id_evento,
                        nome,
                        status: 'ativa'
                    } as any
                });

                if (existingTeam) {
                    res.status(400).json({ 
                        success: false,
                        message: 'Já existe uma equipe com este nome no evento' 
                    });
                    return;
                }
            }

            // Se diminuindo max_membros, verificar se não há mais membros que o novo limite
            if (max_membros && max_membros < team.max_membros) {
                const currentMembersCount = await TeamMember.count({
                    where: {
                        id_team: teamId,
                        status: 'ativo'
                    } as any
                });

                if (currentMembersCount > max_membros) {
                    res.status(400).json({ 
                        success: false,
                        message: `Não é possível reduzir o limite para ${max_membros}. A equipe possui ${currentMembersCount} membros ativos.` 
                    });
                    return;
                }
            }

            // Atualizar equipe
            const updateData: any = {};
            if (nome) updateData.nome = nome;
            if (max_membros) updateData.max_membros = max_membros;

            await team.update(updateData);

            res.json({ 
                success: true,
                message: 'Equipe atualizada com sucesso',
                data: team
            });
        } catch (error) {
            console.error('Erro ao atualizar equipe:', error);
            res.status(500).json({ 
                success: false,
                message: 'Erro interno do servidor' 
            });
        }
    }

    // Gerar novo código de convite
    static async regenerateInviteCode(req: Request, res: Response): Promise<void> {
        const { teamId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ 
                success: false,
                message: 'Usuário não autenticado' 
            });
            return;
        }

        try {
            const team = await Team.findByPk(teamId);
            if (!team) {
                res.status(404).json({ 
                    success: false,
                    message: 'Equipe não encontrada' 
                });
                return;
            }

            // Verificar se o usuário é o líder
            if (team.lider_id !== userId) {
                res.status(403).json({ 
                    success: false,
                    message: 'Apenas o líder pode regenerar o código de convite' 
                });
                return;
            }

            // Gerar novo código
            const newInviteCode = generateInviteCode();
            await team.update({ codigo_convite: newInviteCode });

            res.json({ 
                success: true,
                message: 'Novo código de convite gerado com sucesso',
                data: {
                    codigo_convite: newInviteCode
                }
            });
        } catch (error) {
            console.error('Erro ao regenerar código de convite:', error);
            res.status(500).json({ 
                success: false,
                message: 'Erro interno do servidor' 
            });
        }
    }
}

export default TeamController;