import { Request, Response } from 'express';
import Tournament from '../models/tournament';
import User from '../models/user';

export class TournamentController {
    static async register(req: Request, res: Response): Promise<void> {
        const { eventId, userId } = req.body;

        try {
            const tournament = await Tournament.findOne({ where: { id_evento: eventId } });
            if (!tournament) {
                res.status(404).json({ 
                    success: false,
                    message: 'Tournament not found' 
                });
                return;
            }

            const user = await User.findByPk(userId);
            if (!user) {
                res.status(404).json({ 
                    success: false,
                    message: 'User not found' 
                });
                return;
            }

            // TODO: Logic to register user in the tournament
            // Verificar se o usuário já está inscrito
            // Adicionar usuário ao torneio

            res.status(200).json({ 
                success: true,
                message: 'User registered successfully' 
            });
        } catch (error) {
            console.error('Erro ao registrar no torneio:', error);
            res.status(500).json({ 
                success: false,
                message: 'Internal server error' 
            });
        }
    }

    static async generateBracket(req: Request, res: Response): Promise<void> {
        const { eventId } = req.params;

        try {
            const tournament = await Tournament.findOne({ where: { id_evento: eventId || '' } });
            if (!tournament) {
                res.status(404).json({ 
                    success: false,
                    message: 'Tournament not found' 
                });
                return;
            }

            // TODO: Logic to generate tournament bracket
            // Buscar todos os participantes
            // Gerar chaveamento
            // Salvar chaveamento

            res.status(200).json({ 
                success: true,
                message: 'Bracket generated successfully' 
            });
        } catch (error) {
            console.error('Erro ao gerar chaveamento:', error);
            res.status(500).json({ 
                success: false,
                message: 'Internal server error' 
            });
        }
    }
}

export default TournamentController;