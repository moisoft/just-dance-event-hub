import { Request, Response } from 'express';
import Queue from '../models/queue';
import Event from '../models/event';
import User from '../models/user';
import Music from '../models/music';
import { ModuleService } from '../services/moduleService';

export class QueueController {
    // Adicionar música à fila
    async addToQueue(req: Request, res: Response): Promise<void> {
        const { id_musica } = req.body;
        const userId = req.user?.id;
        const eventId = req.params['eventId'] || req.body['eventId'];

        if (!userId) {
            res.status(401).json({ 
                success: false,
                message: 'Usuário não autenticado' 
            });
            return;
        }

        if (!eventId || typeof eventId !== 'string') {
            res.status(400).json({ 
                success: false,
                message: 'ID do evento não fornecido' 
            });
            return;
        }

        try {
            // Verificar se o módulo queue está ativo
            const isQueueActive = await ModuleService.isModuleActive(eventId, 'queue');
            if (!isQueueActive) {
                res.status(403).json({ 
                    success: false,
                    message: 'Sistema de fila não está ativo para este evento' 
                });
                return;
            }

            // Obter configurações do módulo queue
            const queueConfig = await ModuleService.getModuleConfig(eventId, 'queue');
            
            // Verificar se a música existe
            const music = await Music.findByPk(id_musica);
            if (!music) {
                res.status(404).json({ 
                    success: false,
                    message: 'Música não encontrada' 
                });
                return;
            }

            // Verificar se a música está aprovada
            if (!music.aprovada) {
                res.status(400).json({ 
                    success: false,
                    message: 'Música não está aprovada para uso' 
                });
                return;
            }

            // Verificar limite de músicas por usuário
            const userQueueCount = await Queue.count({
                where: { 
                    id_evento: eventId, 
                    id_jogador: userId,
                    status: 'pendente'
                }
            });

            if (userQueueCount >= queueConfig.max_songs_per_user) {
                res.status(400).json({ 
                    success: false,
                    message: `Limite de ${queueConfig.max_songs_per_user} músicas por usuário atingido` 
                });
                return;
            }

            // Verificar se não permite duplicatas (se configurado)
            if (!queueConfig.allow_duplicates) {
                const existingSong = await Queue.findOne({
                    where: { 
                        id_evento: eventId, 
                        id_musica: id_musica,
                        status: 'pendente'
                    }
                });

                if (existingSong) {
                    res.status(400).json({ 
                        success: false,
                        message: 'Esta música já está na fila' 
                    });
                    return;
                }
            }

            // Verificar cooldown (se configurado)
            if (queueConfig.cooldown_minutes > 0) {
                const lastSongTime = await Queue.findOne({
                    where: { 
                        id_evento: eventId, 
                        id_jogador: userId 
                    },
                    order: [['created_at', 'DESC']]
                });

                if (lastSongTime) {
                    const timeDiff = Date.now() - lastSongTime.created_at.getTime();
                    const cooldownMs = queueConfig.cooldown_minutes * 60 * 1000;
                    
                    if (timeDiff < cooldownMs) {
                        const remainingTime = Math.ceil((cooldownMs - timeDiff) / 1000 / 60);
                        res.status(400).json({ 
                            success: false,
                            message: `Aguarde ${remainingTime} minutos antes de adicionar outra música` 
                        });
                        return;
                    }
                }
            }

            const newQueueItem = await Queue.create({
                id_evento: eventId,
                id_jogador: userId,
                id_musica: id_musica,
                status: 'pendente'
            });

            res.status(201).json({ 
                success: true,
                message: 'Música adicionada à fila com sucesso',
                queueItem: newQueueItem 
            });
        } catch (error) {
            console.error('Erro ao adicionar à fila:', error);
            res.status(500).json({ 
                success: false,
                message: 'Erro interno do servidor' 
            });
        }
    }

    // Obter fila de um evento
    async getEventQueue(req: Request, res: Response): Promise<void> {
        const eventId = req.params['eventId'] || req.query['eventId'];

        if (!eventId || typeof eventId !== 'string') {
            res.status(400).json({ 
                success: false,
                message: 'ID do evento não fornecido' 
            });
            return;
        }

        try {
            // Verificar se o módulo queue está ativo
            const isQueueActive = await ModuleService.isModuleActive(eventId, 'queue');
            if (!isQueueActive) {
                res.status(403).json({ 
                    success: false,
                    message: 'Sistema de fila não está ativo para este evento' 
                });
                return;
            }

            const queue = await Queue.findAll({
                where: { id_evento: eventId },
                include: [
                    {
                        model: User,
                        as: 'jogador',
                        attributes: ['id', 'nickname', 'avatar_ativo_url']
                    },
                    {
                        model: Music,
                        as: 'musica',
                        attributes: ['id', 'titulo', 'artista', 'duracao', 'dificuldade', 'url_thumbnail']
                    }
                ],
                order: [['created_at', 'ASC']]
            });

            res.status(200).json({ 
                success: true,
                queue 
            });
        } catch (error) {
            console.error('Erro ao obter fila:', error);
            res.status(500).json({ 
                success: false,
                message: 'Erro interno do servidor' 
            });
        }
    }

    // Remover música da fila
    async removeFromQueue(req: Request, res: Response): Promise<void> {
        const { queueId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ 
                success: false,
                message: 'Usuário não autenticado' 
            });
            return;
        }

        try {
            const queueItem = await Queue.findByPk(queueId);
            if (!queueItem) {
                res.status(404).json({ 
                    success: false,
                    message: 'Item da fila não encontrado' 
                });
                return;
            }

            // Verificar se o módulo queue está ativo
            const isQueueActive = await ModuleService.isModuleActive(queueItem.id_evento, 'queue');
            if (!isQueueActive) {
                res.status(403).json({ 
                    success: false,
                    message: 'Sistema de fila não está ativo para este evento' 
                });
                return;
            }

            // Verificar se o usuário é o dono do item ou organizador/admin
            const user = await User.findByPk(userId);
            const event = await Event.findByPk(queueItem.id_evento);
            
            if (!user || (queueItem.id_jogador !== userId && 
                         event?.id_organizador !== userId && 
                         user.papel !== 'admin')) {
                res.status(403).json({ 
                    success: false,
                    message: 'Sem permissão para remover este item' 
                });
                return;
            }

            await queueItem.destroy();

            res.status(200).json({ 
                success: true,
                message: 'Item removido da fila com sucesso' 
            });
        } catch (error) {
            console.error('Erro ao remover da fila:', error);
            res.status(500).json({ 
                success: false,
                message: 'Erro interno do servidor' 
            });
        }
    }

    // Marcar música como tocada
    async markAsPlayed(req: Request, res: Response): Promise<void> {
        const { queueId } = req.params;
        const { pontuacao } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ 
                success: false,
                message: 'Usuário não autenticado' 
            });
            return;
        }

        try {
            const queueItem = await Queue.findByPk(queueId);
            if (!queueItem) {
                res.status(404).json({ 
                    success: false,
                    message: 'Item da fila não encontrado' 
                });
                return;
            }

            // Verificar se o módulo queue está ativo
            const isQueueActive = await ModuleService.isModuleActive(queueItem.id_evento, 'queue');
            if (!isQueueActive) {
                res.status(403).json({ 
                    success: false,
                    message: 'Sistema de fila não está ativo para este evento' 
                });
                return;
            }

            // Verificar se o usuário é organizador ou admin
            const user = await User.findByPk(userId);
            const event = await Event.findByPk(queueItem.id_evento);
            
            if (!user || (event?.id_organizador !== userId && user.papel !== 'admin')) {
                res.status(403).json({ 
                    success: false,
                    message: 'Sem permissão para marcar como tocada' 
                });
                return;
            }

            await queueItem.update({
                status: 'finalizado',
                pontuacao: pontuacao || null
            });

            res.status(200).json({ 
                success: true,
                message: 'Música marcada como tocada com sucesso',
                queueItem 
            });
        } catch (error) {
            console.error('Erro ao marcar como tocada:', error);
            res.status(500).json({ 
                success: false,
                message: 'Erro interno do servidor' 
            });
        }
    }
}

export default new QueueController();