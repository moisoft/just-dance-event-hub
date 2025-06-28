import { Request, Response } from 'express';
import { ModuleService } from '../services/moduleService';
import Event from '../models/event';
import User from '../models/user';

export class ModuleController {
    // Obter configurações de módulos de um evento
    async getEventModules(req: Request, res: Response): Promise<void> {
        const { eventId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ 
                success: false,
                message: 'Usuário não autenticado' 
            });
            return;
        }

        if (!eventId) {
            res.status(400).json({ 
                success: false,
                message: 'ID do evento não fornecido' 
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

            // Verificar se o usuário é o organizador ou admin
            const user = await User.findByPk(userId);
            if (!user || (event.id_organizador !== userId && user.papel !== 'admin')) {
                res.status(403).json({ 
                    success: false,
                    message: 'Sem permissão para acessar configurações deste evento' 
                });
                return;
            }

            const moduleConfigs = await ModuleService.getEventConfigs(eventId);
            const availableModules = ModuleService.getAvailableModules();

            res.status(200).json({ 
                success: true,
                event: {
                    id: event.id,
                    nome_evento: event.nome_evento,
                    codigo_evento: event.codigo_evento
                },
                modules: moduleConfigs,
                availableModules
            });
        } catch (error) {
            console.error('Erro ao obter módulos do evento:', error);
            res.status(500).json({ 
                success: false,
                message: 'Erro interno do servidor' 
            });
        }
    }

    // Atualizar configuração de um módulo
    async updateModuleConfig(req: Request, res: Response): Promise<void> {
        const { eventId, moduleName } = req.params;
        const { ativo, configuracao } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ 
                success: false,
                message: 'Usuário não autenticado' 
            });
            return;
        }

        if (!eventId) {
            res.status(400).json({ 
                success: false,
                message: 'ID do evento não fornecido' 
            });
            return;
        }

        if (!moduleName) {
            res.status(400).json({ 
                success: false,
                message: 'Nome do módulo não fornecido' 
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

            // Verificar se o usuário é o organizador ou admin
            const user = await User.findByPk(userId);
            if (!user || (event.id_organizador !== userId && user.papel !== 'admin')) {
                res.status(403).json({ 
                    success: false,
                    message: 'Sem permissão para atualizar configurações deste evento' 
                });
                return;
            }

            // Validar se o módulo é válido
            const availableModules = ModuleService.getAvailableModules();
            const isValidModule = availableModules.some(m => m.name === moduleName);
            
            if (!isValidModule) {
                res.status(400).json({ 
                    success: false,
                    message: 'Módulo inválido' 
                });
                return;
            }

            await ModuleService.updateModuleConfig(eventId, moduleName, ativo, configuracao);

            res.status(200).json({ 
                success: true,
                message: 'Configuração do módulo atualizada com sucesso'
            });
        } catch (error) {
            console.error('Erro ao atualizar configuração do módulo:', error);
            res.status(500).json({ 
                success: false,
                message: 'Erro interno do servidor' 
            });
        }
    }

    // Atualizar múltiplas configurações de módulos
    async updateMultipleModuleConfigs(req: Request, res: Response): Promise<void> {
        const { eventId } = req.params;
        const { modules } = req.body; // Array de { moduleName, ativo, configuracao }
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ 
                success: false,
                message: 'Usuário não autenticado' 
            });
            return;
        }

        if (!eventId) {
            res.status(400).json({ 
                success: false,
                message: 'ID do evento não fornecido' 
            });
            return;
        }

        if (!Array.isArray(modules)) {
            res.status(400).json({ 
                success: false,
                message: 'Formato inválido: modules deve ser um array' 
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

            // Verificar se o usuário é o organizador ou admin
            const user = await User.findByPk(userId);
            if (!user || (event.id_organizador !== userId && user.papel !== 'admin')) {
                res.status(403).json({ 
                    success: false,
                    message: 'Sem permissão para atualizar configurações deste evento' 
                });
                return;
            }

            // Validar módulos
            const availableModules = ModuleService.getAvailableModules();
            const validModuleNames = availableModules.map(m => m.name);

            for (const moduleConfig of modules) {
                if (!validModuleNames.includes(moduleConfig.moduleName)) {
                    res.status(400).json({ 
                        success: false,
                        message: `Módulo inválido: ${moduleConfig.moduleName}` 
                    });
                    return;
                }
            }

            // Atualizar cada módulo
            for (const moduleConfig of modules) {
                await ModuleService.updateModuleConfig(
                    eventId, 
                    moduleConfig.moduleName, 
                    moduleConfig.ativo, 
                    moduleConfig.configuracao
                );
            }

            res.status(200).json({ 
                success: true,
                message: 'Configurações dos módulos atualizadas com sucesso'
            });
        } catch (error) {
            console.error('Erro ao atualizar configurações dos módulos:', error);
            res.status(500).json({ 
                success: false,
                message: 'Erro interno do servidor' 
            });
        }
    }

    // Resetar configurações para padrão
    async resetModuleConfigs(req: Request, res: Response): Promise<void> {
        const { eventId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ 
                success: false,
                message: 'Usuário não autenticado' 
            });
            return;
        }

        if (!eventId) {
            res.status(400).json({ 
                success: false,
                message: 'ID do evento não fornecido' 
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

            // Verificar se o usuário é o organizador ou admin
            const user = await User.findByPk(userId);
            if (!user || (event.id_organizador !== userId && user.papel !== 'admin')) {
                res.status(403).json({ 
                    success: false,
                    message: 'Sem permissão para resetar configurações deste evento' 
                });
                return;
            }

            // Re-inicializar configurações
            await ModuleService.initializeEventConfigs(eventId);

            res.status(200).json({ 
                success: true,
                message: 'Configurações resetadas para padrão com sucesso'
            });
        } catch (error) {
            console.error('Erro ao resetar configurações:', error);
            res.status(500).json({ 
                success: false,
                message: 'Erro interno do servidor' 
            });
        }
    }
}

export default new ModuleController(); 