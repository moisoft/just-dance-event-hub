import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.headers['authorization']?.split(' ')[1];
    const env = process.env;

    if (!token) {
        res.status(401).json({ message: 'Token não fornecido' });
        return;
    }

    jwt.verify(token, env['JWT_SECRET'] as string, (err, decoded) => {
        if (err) {
            res.status(403).json({ message: 'Token inválido' });
            return;
        }

        if (decoded && typeof decoded === 'object') {
            req.user = decoded as { [key: string]: any; id: string; papel: string };
        }
        next();
    });
};

export default authMiddleware;