import jwt from 'jsonwebtoken';

const env = process.env;
const secretKey = env['JWT_SECRET'] || 'your_secret_key';

export const generateToken = (userId: string) => {
    const payload = { id: userId };
    return jwt.sign(payload, secretKey, { expiresIn: '1h' });
};

export const verifyToken = (token: string) => {
    try {
        return jwt.verify(token, secretKey);
    } catch (error) {
        return null;
    }
};