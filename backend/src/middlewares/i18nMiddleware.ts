import { Request, Response, NextFunction } from 'express';
import { getLanguageFromHeader, translate } from '../utils/i18n';

declare global {
    namespace Express {
        interface Response {
            __: (key: string) => string;
        }
        interface Locals {
            lang: string;
        }
    }
}

export function i18nMiddleware(req: Request, res: Response, next: NextFunction): void {
    try {
        const lang = getLanguageFromHeader(req);
        res.locals.lang = lang;
        
        // Adiciona função de tradução ao objeto response
        res.__ = (key: string): string => {
            if (!key) return '';
            return translate(key, lang);
        };
        
        next();
    } catch (error) {
        console.error('Erro no middleware de internacionalização:', error);
        res.locals.lang = 'en';
        res.__ = (key: string): string => key || '';
        next();
    }
}