// backend/src/types/index.ts

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                papel: string;
                [key: string]: any;
            };
        }
    }
}

export interface User {
    id: string;
    nickname: string;
    email: string;
    senha_hash: string;
    papel: 'jogador' | 'staff' | 'organizador' | 'admin';
    xp: number;
    nivel: number;
    avatar_ativo_url?: string;
}

export interface Avatar {
    id: number;
    nome_avatar: string;
    url_imagem: string;
    tipo_desbloqueio: 'inicial' | 'nivel' | 'conquista' | 'exclusivo';
    requisito_nivel?: number;
    requisito_conquista_id?: number;
}

export interface Music {
    id: string;
    titulo: string;
    artista: string;
    duracao: number;
    dificuldade: 'facil' | 'medio' | 'dificil';
    ano: number;
    genero: string;
    url_thumbnail?: string;
    created_at?: Date;
    updated_at?: Date;
}

export interface Event {
    id: string;
    nome_evento: string;
    id_organizador: string;
    tipo: 'casual' | 'torneio';
    codigo_evento: string;
    status: 'ativo' | 'inativo';
    created_at?: Date;
    updated_at?: Date;
}

export interface Queue {
    id: string;
    id_evento: string;
    id_jogador: string;
    id_musica: string;
    status: 'pendente' | 'em_andamento' | 'finalizado';
    pontuacao?: number;
    created_at?: Date;
    updated_at?: Date;
}

export interface Tournament {
    id: string;
    id_evento: string;
    nome: string;
    status: 'inscricoes' | 'em_andamento' | 'finalizado';
    created_at?: Date;
    updated_at?: Date;
}