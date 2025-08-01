import { Request, Response } from 'express';
import User from '../models/user';
import jwt from 'jsonwebtoken';
import '../types';

class AuthController {
    async register(req: Request, res: Response): Promise<void> {
        const { nickname, email, password } = req.body;
        const env = process.env;

        try {
            // Verificar se usuário já existe
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                res.status(400).json({ 
                    success: false,
                    message: res.__('error.invalid_input')
                });
                return;
            }

            const existingNickname = await User.findOne({ where: { nickname } });
            if (existingNickname) {
                res.status(400).json({ 
                    success: false,
                    message: res.__('error.invalid_input')
                });
                return;
            }

            // Criar novo usuário
            const newUser = await User.create({
                nickname,
                email,
                password, // Será hasheada automaticamente pelo hook
                papel: 'jogador'
            });

            // Gerar token
            const token = jwt.sign(
                { id: newUser.id, papel: newUser.papel }, 
                env['JWT_SECRET'] || 'secret', 
                { expiresIn: '24h' }
            );

            res.status(201).json({ 
                success: true,
                message: res.__('user.created'),
                token,
                user: {
                    id: newUser.id,
                    nickname: newUser.nickname,
                    email: newUser.email,
                    papel: newUser.papel,
                    xp: newUser.xp,
                    nivel: newUser.nivel
                }
            });
        } catch (error) {
            console.error('Erro ao criar usuário:', error);
            res.status(500).json({ 
                success: false,
                message: res.__('error.internal')
            });
        }
    }

    async login(req: Request, res: Response): Promise<void> {
        const { email, password } = req.body;
        const env = process.env;

        try {
            // Buscar usuário
            const user = await User.findOne({ where: { email } });
            if (!user) {
                res.status(401).json({ 
                    success: false,
                    message: res.__('auth.invalid_credentials')
                });
                return;
            }

            // Verificar senha
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                res.status(401).json({ 
                    success: false,
                    message: res.__('auth.invalid_credentials')
                });
                return;
            }

            // Gerar token
            const token = jwt.sign(
                { id: user.id, papel: user.papel }, 
                env['JWT_SECRET'] || 'secret', 
                { expiresIn: '24h' }
            );

            res.status(200).json({ 
                success: true,
                message: res.__('auth.login_success'),
                token,
                user: {
                    id: user.id,
                    nickname: user.nickname,
                    email: user.email,
                    papel: user.papel,
                    xp: user.xp,
                    nivel: user.nivel,
                    avatar_ativo_url: user.avatar_ativo_url
                }
            });
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            res.status(500).json({ 
                success: false,
                message: res.__('error.internal')
            });
        }
    }

    async getProfile(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ 
                    success: false,
                    message: res.__('auth.unauthorized')
                });
                return;
            }

            const user = await User.findByPk(userId);
            if (!user) {
                res.status(404).json({ 
                    success: false,
                    message: res.__('auth.user_not_found')
                });
                return;
            }

            res.status(200).json({ 
                success: true,
                user: {
                    id: user.id,
                    nickname: user.nickname,
                    email: user.email,
                    papel: user.papel,
                    xp: user.xp,
                    nivel: user.nivel,
                    avatar_ativo_url: user.avatar_ativo_url
                }
            });
        } catch (error) {
            console.error('Erro ao buscar perfil:', error);
            res.status(500).json({ 
                success: false,
                message: res.__('error.internal')
            });
        }
    }
}

export default new AuthController();