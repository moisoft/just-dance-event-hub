import User from '../models/user';
import Event from '../models/event';
import Music from '../models/music';
import Queue from '../models/queue';
import { testSequelize } from '../utils/database.test';

describe('Models', () => {
    beforeAll(async () => {
        await testSequelize.sync({ force: true });
    });

    afterAll(async () => {
        await testSequelize.close();
    });

    beforeEach(async () => {
        await Queue.destroy({ where: {} });
        await Music.destroy({ where: {} });
        await Event.destroy({ where: {} });
        await User.destroy({ where: {} });
    });

    describe('User Model', () => {
        it('should create user with valid data', async () => {
            const userData = {
                nickname: 'testuser',
                email: 'test@example.com',
                senha_hash: await User.hashPassword('password123'),
                papel: 'jogador',
            };
            const user = await User.create(userData as any) as User;
            expect(user).toBeDefined();
            expect(user.nickname).toBe(userData.nickname);
            expect(user.email).toBe(userData.email);
            expect(user.senha_hash).toBeDefined();
            expect(user.senha_hash).not.toBe('password123');
            expect(user.papel).toBe(userData.papel);
            expect(user.xp).toBe(0);
            expect(user.nivel).toBe(1);
            expect(user.is_super_admin).toBe(false);
        });

        it('should hash password automatically', async () => {
            const hashedPassword = await User.hashPassword('password123');
            expect(hashedPassword).toBeDefined();
            expect(hashedPassword).not.toBe('password123');
            
            const user = await User.create({
                nickname: 'testuser2',
                email: 'test2@example.com',
                senha_hash: hashedPassword,
                papel: 'jogador',
            } as any) as User;
            
            const isMatch = await user.comparePassword('password123');
            expect(isMatch).toBe(true);
        });

        it('should validate unique email', async () => {
            await User.create({
                nickname: 'user1',
                email: 'test@example.com',
                senha_hash: await User.hashPassword('password123'),
                papel: 'jogador',
            } as any);
            await expect(
                User.create({
                    nickname: 'user2',
                    email: 'test@example.com',
                    senha_hash: await User.hashPassword('password123'),
                    papel: 'jogador',
                } as any)
            ).rejects.toThrow();
        });

        it('should validate unique nickname', async () => {
            await User.create({
                nickname: 'testuser',
                email: 'user1@example.com',
                senha_hash: await User.hashPassword('password123'),
                papel: 'jogador',
            } as any);
            await expect(
                User.create({
                    nickname: 'testuser',
                    email: 'user2@example.com',
                    senha_hash: await User.hashPassword('password123'),
                    papel: 'jogador',
                } as any)
            ).rejects.toThrow();
        });

        it('should validate email format', async () => {
            await expect(
                User.create({
                    nickname: 'testuser',
                    email: 'invalid-email',
                    senha_hash: await User.hashPassword('password123'),
                    papel: 'jogador'
                } as any)
            ).rejects.toThrow();
        });

        it('should validate nickname length', async () => {
            await expect(
                User.create({
                    nickname: 'ab', // Muito curto
                    email: 'test@example.com',
                    senha_hash: await User.hashPassword('password123'),
                    papel: 'jogador'
                } as any)
            ).rejects.toThrow();

            await expect(
                User.create({
                    nickname: 'a'.repeat(31), // Muito longo
                    email: 'test@example.com',
                    senha_hash: await User.hashPassword('password123'),
                    papel: 'jogador'
                } as any)
            ).rejects.toThrow();
        });
    });

    describe('Event Model', () => {
        let organizerId: string;

        beforeEach(async () => {
            const organizer = await User.create({
                nickname: 'organizer',
                email: 'organizer@example.com',
                senha_hash: await User.hashPassword('password123'),
                papel: 'organizador',
            } as any) as User;
            organizerId = organizer.id;
        });

        it('should create event with valid data', async () => {
            const eventData = {
                nome_evento: 'Test Event',
                id_organizador: organizerId,
                tipo: 'casual' as const,
                codigo_evento: 'TEST123',
                status: 'ativo' as const
            };

            const event = await Event.create(eventData);

            expect(event.id).toBeDefined();
            expect(event.nome_evento).toBe(eventData.nome_evento);
            expect(event.id_organizador).toBe(eventData.id_organizador);
            expect(event.tipo).toBe(eventData.tipo);
            expect(event.codigo_evento).toBe(eventData.codigo_evento);
            expect(event.status).toBe(eventData.status);
        });

        it('should validate unique event code', async () => {
            await Event.create({
                nome_evento: 'Event 1',
                id_organizador: organizerId,
                tipo: 'casual',
                codigo_evento: 'TEST123',
                status: 'ativo'
            });

            await expect(
                Event.create({
                    nome_evento: 'Event 2',
                    id_organizador: organizerId,
                    tipo: 'casual',
                    codigo_evento: 'TEST123', // Código duplicado
                    status: 'ativo'
                })
            ).rejects.toThrow();
        });

        it('should validate event name length', async () => {
            await expect(
                Event.create({
                    nome_evento: 'ab', // Muito curto
                    id_organizador: organizerId,
                    tipo: 'casual',
                    codigo_evento: 'TEST123',
                    status: 'ativo'
                })
            ).rejects.toThrow();
        });

        it('should validate event code length', async () => {
            await expect(
                Event.create({
                    nome_evento: 'Test Event',
                    id_organizador: organizerId,
                    tipo: 'casual',
                    codigo_evento: 'ab', // Muito curto
                    status: 'ativo'
                })
            ).rejects.toThrow();
        });
    });

    describe('Music Model', () => {
        it('should create music with valid data', async () => {
            const musicData = {
                titulo: 'Test Song',
                artista: 'Test Artist',
                duracao: 180,
                dificuldade: 'medio' as const,
                ano: 2023,
                genero: 'Pop'
            };

            const music = await Music.create(musicData);

            expect(music.id).toBeDefined();
            expect(music.titulo).toBe(musicData.titulo);
            expect(music.artista).toBe(musicData.artista);
            expect(music.duracao).toBe(musicData.duracao);
            expect(music.dificuldade).toBe(musicData.dificuldade);
            expect(music.ano).toBe(musicData.ano);
            expect(music.genero).toBe(musicData.genero);
        });

        it('should validate difficulty enum', async () => {
            await expect(
                Music.create({
                    titulo: 'Test Song',
                    artista: 'Test Artist',
                    duracao: 180,
                    dificuldade: 'invalid' as any,
                    ano: 2023,
                    genero: 'Pop'
                })
            ).rejects.toThrow();
        });

        it('should validate year range', async () => {
            await expect(
                Music.create({
                    titulo: 'Test Song',
                    artista: 'Test Artist',
                    duracao: 180,
                    dificuldade: 'medio',
                    ano: 1800, // Muito antigo
                    genero: 'Pop'
                })
            ).rejects.toThrow();

            await expect(
                Music.create({
                    titulo: 'Test Song',
                    artista: 'Test Artist',
                    duracao: 180,
                    dificuldade: 'medio',
                    ano: 2030, // Muito futuro
                    genero: 'Pop'
                })
            ).rejects.toThrow();
        });
    });

    describe('Queue Model', () => {
        let userId: string;
        let eventId: string;
        let musicId: string;

        beforeEach(async () => {
            const user = await User.create({
                nickname: 'player',
                email: 'player@example.com',
                senha_hash: await User.hashPassword('password123'),
                papel: 'jogador',
            } as any) as User;
            userId = user.id;

            const organizer = await User.create({
                nickname: 'organizer',
                email: 'organizer@example.com',
                senha_hash: await User.hashPassword('password123'),
                papel: 'organizador',
            } as any) as User;

            const event = await Event.create({
                nome_evento: 'Test Event',
                id_organizador: organizer.id,
                tipo: 'casual',
                codigo_evento: 'TEST123',
                status: 'ativo'
            });
            eventId = event.id;

            const music = await Music.create({
                titulo: 'Test Song',
                artista: 'Test Artist',
                duracao: 180,
                dificuldade: 'medio',
                ano: 2023,
                genero: 'Pop'
            });
            musicId = music.id;
        });

        it('should create queue item with valid data', async () => {
            const queueData = {
                id_evento: eventId,
                id_jogador: userId,
                id_musica: musicId,
                status: 'pendente' as const
            };

            const queueItem = await Queue.create(queueData);

            expect(queueItem.id).toBeDefined();
            expect(queueItem.id_evento).toBe(queueData.id_evento);
            expect(queueItem.id_jogador).toBe(queueData.id_jogador);
            expect(queueItem.id_musica).toBe(queueData.id_musica);
            expect(queueItem.status).toBe(queueData.status);
            expect(queueItem.pontuacao === null || queueItem.pontuacao === undefined).toBe(true);
        });

        it('should validate status enum', async () => {
            await expect(
                Queue.create({
                    id_evento: eventId,
                    id_jogador: userId,
                    id_musica: musicId,
                    status: 'invalid' as any
                })
            ).rejects.toThrow();
        });

        it('should validate score range', async () => {
            await expect(
                Queue.create({
                    id_evento: eventId,
                    id_jogador: userId,
                    id_musica: musicId,
                    status: 'finalizado',
                    pontuacao: -100 // Score negativo
                })
            ).rejects.toThrow();

            await expect(
                Queue.create({
                    id_evento: eventId,
                    id_jogador: userId,
                    id_musica: musicId,
                    status: 'finalizado',
                    pontuacao: 15000 // Score muito alto
                })
            ).rejects.toThrow();
        });

        it('should allow valid score', async () => {
            const queueItem = await Queue.create({
                id_evento: eventId,
                id_jogador: userId,
                id_musica: musicId,
                status: 'finalizado',
                pontuacao: 8500
            });

            expect(queueItem.pontuacao).toBe(8500);
        });
    });

    describe('Model Relationships', () => {
        let user: User;
        let event: Event;
        let music: Music;

        beforeEach(async () => {
            user = await User.create({
                nickname: 'testuser',
                email: 'test@example.com',
                senha_hash: await User.hashPassword('password123'),
                papel: 'jogador',
            } as any) as User;

            event = await Event.create({
                nome_evento: 'Test Event',
                id_organizador: user.id,
                tipo: 'casual',
                codigo_evento: 'TEST123',
                status: 'ativo'
            });

            music = await Music.create({
                titulo: 'Test Song',
                artista: 'Test Artist',
                duracao: 180,
                dificuldade: 'medio',
                ano: 2023,
                genero: 'Pop'
            });
        });

        it('should handle basic model creation and relationships', async () => {
            // Verificar se os modelos foram criados corretamente
            expect(user.id).toBeDefined();
            expect(event.id).toBeDefined();
            expect(music.id).toBeDefined();
            
            // Verificar se o relacionamento básico está correto
            expect(event.id_organizador).toBe(user.id);
        });

        it('should handle queue creation with relationships', async () => {
            const queueItem = await Queue.create({
                id_evento: event.id,
                id_jogador: user.id,
                id_musica: music.id,
                status: 'pendente'
            });

            expect(queueItem.id).toBeDefined();
            expect(queueItem.id_evento).toBe(event.id);
            expect(queueItem.id_jogador).toBe(user.id);
            expect(queueItem.id_musica).toBe(music.id);
        });
    });
}); 