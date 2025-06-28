import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
    statusCode?: number;
    isOperational?: boolean;
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
    console.error('Error:', {
        message: err.message,
        stack: err.stack,
        url: _req.url,
        method: _req.method,
        body: _req.body,
        params: _req.params,
        query: _req.query,
        user: _req.user
    });

    // Sequelize validation error
    if (err.name === 'SequelizeValidationError') {
        const message = Object.values((err as any).errors).map((val: any) => val.message).join(', ');
        error.message = message;
        error.statusCode = 400;
    }

    // Sequelize unique constraint error
    if (err.name === 'SequelizeUniqueConstraintError') {
        const message = 'Duplicate field value entered';
        error.message = message;
        error.statusCode = 400;
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        error.message = 'Invalid token';
        error.statusCode = 401;
    }

    if (err.name === 'TokenExpiredError') {
        error.message = 'Token expired';
        error.statusCode = 401;
    }

    // Cast error (invalid ID)
    if (err.name === 'CastError') {
        error.message = 'Resource not found';
        error.statusCode = 404;
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Server Error',
        ...(env['NODE_ENV'] === 'development' && { stack: err.stack })
    });
};

export const notFound = (_req: Request, _res: Response, next: NextFunction): void => {
    const error = new Error(`Not Found - ${_req.originalUrl}`) as AppError;
    error.statusCode = 404;
    next(error);
}; 