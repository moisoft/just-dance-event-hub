import EventConfig from '../models/eventConfig';

export interface ModuleConfig {
    queue: {
        max_songs_per_user: number;
        cooldown_minutes: number;
        allow_duplicates: boolean;
    };
    tournament: {
        max_participants: number;
        bracket_type: 'single_elimination' | 'double_elimination' | 'round_robin';
        auto_start: boolean;
    };
    xp_system: {
        xp_per_song: number;
        level_multiplier: number;
        bonus_xp_tournament: number;
    };
    team_mode: {
        max_team_size: number;
        allow_solo: boolean;
        team_formation_time: number;
    };
    music_requests: {
        allow_requests: boolean;
        max_requests_per_user: number;
        request_cooldown: number;
    };
    leaderboard: {
        show_top: number;
        update_interval: number;
        show_xp: boolean;
    };
    chat: {
        enabled: boolean;
        max_message_length: number;
        allow_emojis: boolean;
    };
    voting: {
        enabled: boolean;
        voting_time: number;
        require_majority: boolean;
    };
}

export const DEFAULT_MODULE_CONFIGS: ModuleConfig = {
    queue: {
        max_songs_per_user: 3,
        cooldown_minutes: 5,
        allow_duplicates: false,
    },
    tournament: {
        max_participants: 16,
        bracket_type: 'single_elimination',
        auto_start: false,
    },
    xp_system: {
        xp_per_song: 10,
        level_multiplier: 1.5,
        bonus_xp_tournament: 25,
    },
    team_mode: {
        max_team_size: 4,
        allow_solo: true,
        team_formation_time: 300,
    },
    music_requests: {
        allow_requests: true,
        max_requests_per_user: 2,
        request_cooldown: 60,
    },
    leaderboard: {
        show_top: 10,
        update_interval: 300,
        show_xp: true,
    },
    chat: {
        enabled: false,
        max_message_length: 200,
        allow_emojis: true,
    },
    voting: {
        enabled: false,
        voting_time: 30,
        require_majority: true,
    },
};

export class ModuleService {
    /**
     * Inicializa as configurações padrão para um novo evento
     */
    static async initializeEventConfigs(eventId: string): Promise<void> {
        const modules = Object.keys(DEFAULT_MODULE_CONFIGS) as Array<keyof ModuleConfig>;
        
        for (const module of modules) {
            await EventConfig.create({
                id_evento: eventId,
                modulo: module,
                ativo: this.isModuleEnabledByDefault(module),
                configuracao: DEFAULT_MODULE_CONFIGS[module],
            });
        }
    }

    /**
     * Verifica se um módulo está ativo para um evento
     */
    static async isModuleActive(eventId: string, module: string): Promise<boolean> {
        const config = await EventConfig.findOne({
            where: { id_evento: eventId, modulo: module }
        });
        return config?.ativo || false;
    }

    /**
     * Obtém a configuração de um módulo para um evento
     */
    static async getModuleConfig(eventId: string, module: string): Promise<any> {
        const config = await EventConfig.findOne({
            where: { id_evento: eventId, modulo: module }
        });
        return config?.configuracao || DEFAULT_MODULE_CONFIGS[module as keyof ModuleConfig];
    }

    /**
     * Atualiza a configuração de um módulo
     */
    static async updateModuleConfig(
        eventId: string, 
        module: string, 
        ativo: boolean, 
        configuracao?: any
    ): Promise<void> {
        await EventConfig.update(
            { ativo, configuracao },
            { where: { id_evento: eventId, modulo: module } }
        );
    }

    /**
     * Obtém todas as configurações de módulos de um evento
     */
    static async getEventConfigs(eventId: string): Promise<EventConfig[]> {
        return await EventConfig.findAll({
            where: { id_evento: eventId },
            order: [['modulo', 'ASC']]
        });
    }

    /**
     * Verifica se um módulo deve estar ativo por padrão
     */
    private static isModuleEnabledByDefault(module: string): boolean {
        // Módulos habilitados por padrão
        const enabledByDefault = ['queue', 'xp_system', 'leaderboard'];
        
        // Módulos explicitamente desabilitados (torneio e competições)
        const disabledModules = ['tournament', 'team_mode'];
        
        // Se o módulo estiver na lista de desabilitados, retorna false
        if (disabledModules.includes(module)) {
            return false;
        }
        
        // Caso contrário, verifica se está na lista de habilitados por padrão
        return enabledByDefault.includes(module);
    }

    /**
     * Obtém informações sobre todos os módulos disponíveis
     */
    static getAvailableModules(): Array<{name: string, description: string, defaultEnabled: boolean}> {
        return [
            {
                name: 'queue',
                description: 'Sistema de fila de músicas',
                defaultEnabled: true
            },
            {
                name: 'tournament',
                description: 'Sistema de torneios',
                defaultEnabled: false
            },
            {
                name: 'xp_system',
                description: 'Sistema de experiência e níveis',
                defaultEnabled: true
            },
            {
                name: 'team_mode',
                description: 'Modo equipe para jogos',
                defaultEnabled: false
            },
            {
                name: 'music_requests',
                description: 'Sistema de pedidos de música',
                defaultEnabled: true
            },
            {
                name: 'leaderboard',
                description: 'Tabela de classificação',
                defaultEnabled: true
            },
            {
                name: 'chat',
                description: 'Chat em tempo real',
                defaultEnabled: false
            },
            {
                name: 'voting',
                description: 'Sistema de votação',
                defaultEnabled: false
            }
        ];
    }
}