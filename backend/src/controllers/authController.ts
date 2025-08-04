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

    async updateProfile(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ 
                    success: false,
                    message: res.__('auth.unauthorized')
                });
                return;
            }

            const { nickname, email, avatar_ativo_url } = req.body;

            // Verificar se o usuário existe
            const user = await User.findByPk(userId);
            if (!user) {
                res.status(404).json({ 
                    success: false,
                    message: res.__('auth.user_not_found')
                });
                return;
            }

            // Verificar se o nickname já está em uso por outro usuário
            if (nickname && nickname !== user.nickname) {
                const existingNickname = await User.findOne({ 
                    where: { nickname },
                    // Excluir o usuário atual da busca
                    // @ts-ignore
                    [User.sequelize?.Op?.ne || 'ne']: { id: userId }
                });
                if (existingNickname) {
                    res.status(400).json({ 
                        success: false,
                        message: 'Nickname já está em uso'
                    });
                    return;
                }
            }

            // Verificar se o email já está em uso por outro usuário
            if (email && email !== user.email) {
                const existingEmail = await User.findOne({ 
                    where: { email },
                    // Excluir o usuário atual da busca
                    // @ts-ignore
                    [User.sequelize?.Op?.ne || 'ne']: { id: userId }
                });
                if (existingEmail) {
                    res.status(400).json({ 
                        success: false,
                        message: 'Email já está em uso'
                    });
                    return;
                }
            }

            // Atualizar os campos fornecidos
            const updateData: any = {};
            if (nickname) updateData.nickname = nickname;
            if (email) updateData.email = email;
            if (avatar_ativo_url !== undefined) updateData.avatar_ativo_url = avatar_ativo_url;

            await user.update(updateData);

            // Retornar o usuário atualizado
            res.status(200).json({ 
                success: true,
                message: 'Perfil atualizado com sucesso',
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
            console.error('Erro ao atualizar perfil:', error);
            res.status(500).json({ 
                success: false,
                message: res.__('error.internal')
            });
        }
    }
}

export default new AuthController();