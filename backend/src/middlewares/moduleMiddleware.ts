import { Request, Response, NextFunction } from 'express';
import { ModuleService } from '../services/moduleService';

/**
 * Middleware para verificar se um módulo específico está ativo
 */
export const requireModule = (moduleName: string) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const eventId = req.params['eventId'] || req.body['eventId'] || req.query['eventId'];
            
            if (!eventId) {
                res.status(400).json({
                    success: false,
                    error: 'ID do evento não fornecido'
                });
                return;
            }

            const isActive = await ModuleService.isModuleActive(eventId, moduleName);
            
            if (!isActive) {
                res.status(403).json({
                    success: false,
                    error: `Módulo '${moduleName}' não está ativo para este evento`
                });
                return;
            }

            // Adiciona a configuração do módulo ao request para uso posterior
            req.moduleConfig = await ModuleService.getModuleConfig(eventId, moduleName);
            next();
        } catch (error) {
            console.error(`Erro ao verificar módulo ${moduleName}:`, error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor'
            });
        }
    };
};

/**
 * Middleware para verificar múltiplos módulos
 */
export const requireModules = (modules: string[]) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const eventId = req.params['eventId'] || req.body['eventId'] || req.query['eventId'];
            
            if (!eventId) {
                res.status(400).json({
                    success: false,
                    error: 'ID do evento não fornecido'
                });
                return;
            }

            const inactiveModules = [];
            
            for (const module of modules) {
                const isActive = await ModuleService.isModuleActive(eventId, module);
                if (!isActive) {
                    inactiveModules.push(module);
                }
            }

            if (inactiveModules.length > 0) {
                res.status(403).json({
                    success: false,
                    error: `Módulos não ativos: ${inactiveModules.join(', ')}`
                });
                return;
            }

            // Adiciona as configurações dos módulos ao request
            req.moduleConfigs = {};
            for (const module of modules) {
                req.moduleConfigs[module] = await ModuleService.getModuleConfig(eventId, module);
            }
            
            next();
        } catch (error) {
            console.error('Erro ao verificar módulos:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor'
            });
        }
    };
};

// Extender o tipo Request para incluir as configurações dos módulos
declare global {
    namespace Express {
        interface Request {
            moduleConfig?: any;
            moduleConfigs?: { [key: string]: any };
        }
    }
} 