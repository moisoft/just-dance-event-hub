import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
    statusCode?: number;
    isOperational?: boolean;
    translationKey?: string;
}

export const errorHandler = (
    err: AppError,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    let error = { ...err };
    error.message = err.message;
    const env = process.env;

    // Log error
    console.log('Error details:', {
        message: err.message,
        stack: err.stack,
        url: _req.url,
        method: _req.method,
        body: _req.body,
        params: _req.params,
        query: _req.query
    });

    // Sequelize validation error
    if (err.name === 'SequelizeValidationError') {
        const message = Object.values((err as any).errors).map((val: any) => val.message).join(', ');
        error.message = message;
        error.statusCode = 400;
        error.translationKey = 'error.invalid_input';
    }

    // Sequelize unique constraint error
    if (err.name === 'SequelizeUniqueConstraintError') {
        error.message = 'Duplicate field value entered';
        error.statusCode = 400;
        error.translationKey = 'error.invalid_input';
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        error.message = 'Invalid token';
        error.statusCode = 401;
        error.translationKey = 'auth.unauthorized';
    }

    if (err.name === 'TokenExpiredError') {
        error.message = 'Token expired';
        error.statusCode = 401;
        error.translationKey = 'auth.unauthorized';
    }

    // Cast error (invalid ID)
    if (err.name === 'CastError') {
        error.message = 'Resource not found';
        error.statusCode = 404;
        error.translationKey = 'error.not_found';
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.translationKey || 'Internal server error',
        ...(env['NODE_ENV'] === 'development' && { 
            originalError: error.message,
            stack: err.stack 
        })
    });
};

export const notFound = (_req: Request, _res: Response, next: NextFunction): void => {
    const error = new Error(`Not Found - ${_req.originalUrl}`) as AppError;
    error.statusCode = 404;
    error.translationKey = 'error.route_not_found';
    next(error);
};