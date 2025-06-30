import { Request, Response } from 'express';
import Event from '../models/event';
import User from '../models/user';
import { ModuleService } from '../services/moduleService';

export class EventController {
    // Método para criar um novo evento
    async createEvent(req: Request, res: Response): Promise<void> {
        const { nome_evento, tipo, codigo_evento } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ 
                success: false,
                message: res.__('auth.unauthorized')
            });
            return;
        }

        try {
            // Verificar se o usuário tem permissão para criar eventos
            const user = await User.findByPk(userId);
            if (!user || !['organizador', 'admin'].includes(user.papel)) {
                res.status(403).json({ 
                    success: false,
                    message: res.__('auth.forbidden')
                });
                return;
            }

            // Verificar se o código do evento já existe
            const existingEvent = await Event.findOne({ where: { codigo_evento } });
            if (existingEvent) {
                res.status(400).json({ 
                    success: false,
                    message: res.__('error.invalid_input')
                });
                return;
            }

            const newEvent = await Event.create({
                nome_evento,
                id_organizador: userId,
                tipo,
                codigo_evento,
                status: 'ativo'
            });

            // Inicializar configurações dos módulos para o novo evento
            await ModuleService.initializeEventConfigs(newEvent.id);

            res.status(201).json({ 
                success: true,
                message: res.__('event.created'),
                event: newEvent 
            });
        } catch (error) {
            console.error('Erro ao criar evento:', error);
            res.status(500).json({ 
                success: false,
                message: res.__('error.internal')
            });
        }
    }

    // Método para obter detalhes de um evento
    async getEvent(req: Request, res: Response): Promise<void> {
        const { code } = req.params;

        try {
            const event = await Event.findOne({ 
                where: { codigo_evento: code || '' },
                include: [{
                    model: User,
                    as: 'organizador',
                    attributes: ['id', 'nickname', 'email']
                }]
            });

            if (!event) {
                res.status(404).json({ 
                    success: false,
                    message: res.__('event.not_found')
                });
                return;
            }

            // Buscar configurações dos módulos
            const moduleConfigs = await ModuleService.getEventConfigs(event.id);

            res.status(200).json({ 
                success: true,
                event: {
                    ...event.toJSON(),
                    modules: moduleConfigs
                }
            });
        } catch (error) {
            console.error('Erro ao obter evento:', error);
            res.status(500).json({ 
                success: false,
                message: res.__('error.internal')
            });
        }
    }

    // Método para listar todos os eventos
    async getAllEvents(_req: Request, res: Response): Promise<void> {
        try {
            const events = await Event.findAll({
                include: [{
                    model: User,
                    as: 'organizador',
                    attributes: ['id', 'nickname']
                }],
                order: [['createdAt', 'DESC']]
            });

            res.status(200).json({ 
                success: true,
                events 
            });
        } catch (error) {
            console.error('Erro ao listar eventos:', error);
            res.status(500).json({ 
                success: false,
                message: res.__('error.internal')
            });
        }
    }

    // Método para atualizar um evento
    async updateEvent(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const { nome_evento, tipo, codigo_evento } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ 
                success: false,
                message: res.__('auth.unauthorized')
            });
            return;
        }

        try {
            const event = await Event.findByPk(id);
            if (!event) {
                res.status(404).json({ 
                    success: false,
                    message: res.__('event.not_found')
                });
                return;
            }

            // Verificar se o usuário é o organizador ou admin
            const user = await User.findByPk(userId);
            if (!user || (event.id_organizador !== userId && user.papel !== 'admin')) {
                res.status(403).json({ 
                    success: false,
                    message: res.__('auth.forbidden')
                });
                return;
            }

            // Verificar se o novo código já existe (se foi alterado)
            if (codigo_evento && codigo_evento !== event.codigo_evento) {
                const existingEvent = await Event.findOne({ where: { codigo_evento } });
                if (existingEvent) {
                    res.status(400).json({ 
                        success: false,
                        message: res.__('error.invalid_input')
                    });
                    return;
                }
            }

            await event.update({
                nome_evento: nome_evento || event.nome_evento,
                tipo: tipo || event.tipo,
                codigo_evento: codigo_evento || event.codigo_evento
            });

            res.status(200).json({ 
                success: true,
                message: res.__('event.updated'),
                event 
            });
        } catch (error) {
            console.error('Erro ao atualizar evento:', error);
            res.status(500).json({ 
                success: false,
                message: res.__('error.internal')
            });
        }
    }

    // Método para deletar um evento
    async deleteEvent(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ 
                success: false,
                message: res.__('auth.unauthorized')
            });
            return;
        }

        try {
            const event = await Event.findByPk(id);
            if (!event) {
                res.status(404).json({ 
                    success: false,
                    message: res.__('event.not_found')
                });
                return;
            }

            // Verificar se o usuário é o organizador ou admin
            const user = await User.findByPk(userId);
            if (!user || (event.id_organizador !== userId && user.papel !== 'admin')) {
                res.status(403).json({ 
                    success: false,
                    message: res.__('auth.forbidden')
                });
                return;
            }

            await event.destroy();
            res.status(200).json({ 
                success: true,
                message: res.__('event.deleted')
            });
        } catch (error) {
            console.error('Erro ao deletar evento:', error);
            res.status(500).json({ 
                success: false,
                message: res.__('error.internal')
            });
        }
    }

    // Método para obter módulos disponíveis
    async getAvailableModules(_req: Request, res: Response): Promise<void> {
        try {
            const modules = ModuleService.getAvailableModules();
            res.status(200).json({ 
                success: true,
                modules 
            });
        } catch (error) {
            console.error('Erro ao obter módulos:', error);
            res.status(500).json({ 
                success: false,
                message: res.__('error.internal')
            });
        }
    }
}

export default new EventController();