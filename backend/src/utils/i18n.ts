import { Request } from 'express';

interface Translations {
    [key: string]: {
        [key: string]: string;
    };
}

interface TranslationCache {
    [key: string]: {
        [key: string]: string;
    };
}

const translations: Translations = {
    'pt-BR': {
        'error.rate_limit': 'Muitas requisições, tente novamente mais tarde',
        'error.auth_rate_limit': 'Muitas tentativas de login, tente novamente mais tarde',
        'error.route_not_found': 'Rota não encontrada',
        'system.health_check': 'Just Dance Event Hub API está funcionando!',
        'event.not_found': 'Evento não encontrado',
        'event.created': 'Evento criado com sucesso',
        'event.updated': 'Evento atualizado com sucesso',
        'event.deleted': 'Evento deletado com sucesso',
        'auth.invalid_credentials': 'Email ou senha incorretos',
        'auth.user_not_found': 'Usuário não encontrado',
        'auth.unauthorized': 'Não autorizado',
        'auth.forbidden': 'Acesso negado',
        'user.created': 'Usuário criado com sucesso',
        'user.updated': 'Usuário atualizado com sucesso',
        'user.deleted': 'Usuário deletado com sucesso',
        'error.internal': 'Erro interno do servidor',
        'error.invalid_input': 'Dados inválidos',
        'error.not_found': 'Recurso não encontrado',
        'auth.login_success': 'Login realizado com sucesso'
    },
    'en': {
        'error.rate_limit': 'Too many requests, please try again later',
        'error.auth_rate_limit': 'Too many login attempts, please try again later',
        'error.route_not_found': 'Route not found',
        'system.health_check': 'Just Dance Event Hub API is working!',
        'event.not_found': 'Event not found',
        'event.created': 'Event created successfully',
        'event.updated': 'Event updated successfully',
        'event.deleted': 'Event deleted successfully',
        'auth.invalid_credentials': 'Invalid email or password',
        'auth.user_not_found': 'User not found',
        'auth.unauthorized': 'Unauthorized',
        'auth.forbidden': 'Access denied',
        'user.created': 'User created successfully',
        'user.updated': 'User updated successfully',
        'user.deleted': 'User deleted successfully',
        'error.internal': 'Internal server error',
        'error.invalid_input': 'Invalid input data',
        'error.not_found': 'Resource not found',
        'auth.login_success': 'Login successful'
    },
    'es': {
        'error.rate_limit': 'Demasiadas solicitudes, inténtelo de nuevo más tarde',
        'error.auth_rate_limit': 'Demasiados intentos de inicio de sesión, inténtelo de nuevo más tarde',
        'error.route_not_found': 'Ruta no encontrada',
        'system.health_check': '¡La API de Just Dance Event Hub está funcionando!',
        'event.not_found': 'Evento no encontrado',
        'event.created': 'Evento creado con éxito',
        'event.updated': 'Evento actualizado con éxito',
        'event.deleted': 'Evento eliminado con éxito',
        'auth.invalid_credentials': 'Correo o contraseña incorrectos',
        'auth.user_not_found': 'Usuario no encontrado',
        'auth.unauthorized': 'No autorizado',
        'auth.forbidden': 'Acceso denegado',
        'user.created': 'Usuario creado con éxito',
        'user.updated': 'Usuario actualizado con éxito',
        'user.deleted': 'Usuario eliminado con éxito',
        'error.internal': 'Error interno del servidor',
        'error.invalid_input': 'Datos inválidos',
        'error.not_found': 'Recurso no encontrado',
        'auth.login_success': 'Inicio de sesión exitoso'
    }
};

// Cache para armazenar idiomas já processados
const languageCache: { [key: string]: string } = {};

// Cache para armazenar traduções já processadas
const translationCache: TranslationCache = {};

export function getLanguageFromHeader(req: Request): string {
    const acceptLanguage = req.headers['accept-language'];
    if (!acceptLanguage || typeof acceptLanguage !== 'string') return 'en';

    // Verifica se o idioma já está em cache
    if (languageCache[acceptLanguage]) {
        return languageCache[acceptLanguage] || 'en';
    }

    let languages: string[] = [];
    const acceptLangStr = typeof acceptLanguage === 'string' ? acceptLanguage : '';
    if (acceptLangStr) {
        languages = acceptLangStr.split(',').map(lang => String(lang).split(';')[0].trim());
    } else {
        languages = [];
    }
    
    for (const lang of languages) {
        if (translations[lang]) {
            languageCache[acceptLanguage] = lang;
            return lang;
        }
        const mainLang = lang.split('-')[0];
        if (mainLang && translations[mainLang]) {
            languageCache[acceptLanguage] = mainLang;
            return mainLang;
        }
    }

    languageCache[acceptLanguage] = 'en';
    return 'en';
}

export function translate(key: string, lang: string): string {
    const language = translations[lang] ? lang : 'en';
    const cache = translationCache[language];
    if (cache && typeof cache[key] === 'string') {
        return cache[key] as string;
    }
    if (!translationCache[language]) {
        translationCache[language] = {};
    }
    const langTranslations = translations[language];
    const enTranslations = translations['en'];
    let translation: string = key;
    if (langTranslations && typeof langTranslations[key] === 'string') {
        translation = langTranslations[key] as string;
    } else if (enTranslations && typeof enTranslations[key] === 'string') {
        translation = enTranslations[key] as string;
    } else {
        translation = key;
    }
    (translationCache[language]!)[key] = translation;
    return translation;
}