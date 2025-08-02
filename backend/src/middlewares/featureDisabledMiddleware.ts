import { Request, Response, NextFunction } from 'express';

/**
 * Middleware para bloquear acesso a funcionalidades desativadas
 * Este middleware é usado para bloquear temporariamente o acesso a funcionalidades
 * que foram desativadas para priorizar o desenvolvimento de outras funcionalidades.
 */
export const featureDisabledMiddleware = (featureName: string) => {
    return (_req: Request, res: Response, _next: NextFunction): void => {
        res.status(403).json({
            success: false,
            error: `A funcionalidade '${featureName}' está temporariamente desativada para priorizar o desenvolvimento de outras funcionalidades.`
        });
    };
};

export default featureDisabledMiddleware;