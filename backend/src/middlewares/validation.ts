import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validate = (schema: Joi.ObjectSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const { error } = schema.validate(req.body);
        
        if (error) {
            const errorMessage = error.details.map((detail: Joi.ValidationErrorItem) => detail.message).join(', ');
            res.status(400).json({
                success: false,
                error: errorMessage
            });
            return;
        }
        
        next();
    };
};

// Validação de parâmetros
export const validateEventId = (req: Request, res: Response, next: NextFunction): void => {
    const { eventId } = req.params;
    
    if (!eventId || !Joi.string().uuid().validate(eventId).error) {
        res.status(400).json({
            success: false,
            error: 'ID do evento inválido'
        });
        return;
    }
    
    next();
};

export const validateModuleName = (req: Request, res: Response, next: NextFunction): void => {
    const { moduleName } = req.params;
    const validModules = ['queue', 'tournament', 'xp_system', 'team_mode', 'music_requests', 'leaderboard', 'chat', 'voting'];
    
    if (!moduleName || !validModules.includes(moduleName)) {
        res.status(400).json({
            success: false,
            error: 'Nome do módulo inválido'
        });
        return;
    }
    
    next();
};

// Schemas de validação
export const userSchemas = {
    register: Joi.object({
        nickname: Joi.string().min(3).max(30).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required()
    }),
    
    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    })
};

export const eventSchemas = {
    create: Joi.object({
        nome_evento: Joi.string().min(3).max(100).required(),
        tipo: Joi.string().valid('casual', 'torneio').required(),
        codigo_evento: Joi.string().min(3).max(20).required()
    }),
    
    update: Joi.object({
        nome_evento: Joi.string().min(3).max(100),
        tipo: Joi.string().valid('casual', 'torneio'),
        codigo_evento: Joi.string().min(3).max(20)
    })
};

export const queueSchemas = {
    add: Joi.object({
        id_musica: Joi.string().uuid().required(),
        id_equipa: Joi.string().uuid().optional()
    })
};

export const tournamentSchemas = {
    create: Joi.object({
        nome: Joi.string().min(3).max(100).required(),
        max_participantes: Joi.number().integer().min(2).max(64).required()
    })
};

export const moduleSchemas = {
    updateConfig: Joi.object({
        ativo: Joi.boolean().required(),
        configuracao: Joi.object().optional()
    }),
    
    updateMultiple: Joi.object({
        modules: Joi.array().items(
            Joi.object({
                moduleName: Joi.string().valid('queue', 'tournament', 'xp_system', 'team_mode', 'music_requests', 'leaderboard', 'chat', 'voting').required(),
                ativo: Joi.boolean().required(),
                configuracao: Joi.object().optional()
            })
        ).required()
    })
}; 