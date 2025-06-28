import { Router } from 'express';
import AuthController from '../controllers/authController';
import authMiddleware from '../middlewares/authMiddleware';
import { validate, userSchemas } from '../middlewares/validation';

const router = Router();

// Rotas públicas
router.post('/register', validate(userSchemas.register), AuthController.register);
router.post('/login', validate(userSchemas.login), AuthController.login);

// Rotas protegidas
router.get('/profile', authMiddleware, AuthController.getProfile);

export default router;