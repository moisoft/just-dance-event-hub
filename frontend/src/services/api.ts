// Configuração da API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Para testar sem banco de dados, use as rotas mock
const USE_MOCK = process.env.REACT_APP_USE_MOCK === 'true';
const MOCK_PREFIX = USE_MOCK ? '/mock' : '';

// Função para fazer requisições à API
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
    const url = `${API_BASE_URL}${MOCK_PREFIX}${endpoint}`;
    
    const config: RequestInit = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    };

    // Adicionar token de autenticação se disponível
    const token = localStorage.getItem('token');
    if (token) {
        config.headers = {
            ...config.headers,
            'Authorization': `Bearer ${token}`,
        };
    }

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Erro na requisição');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

// Funções de autenticação
export const authAPI = {
    login: (email: string, password: string) =>
        apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),

    register: (nickname: string, email: string, password: string) =>
        apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ nickname, email, password }),
        }),

    getProfile: () => apiRequest('/auth/profile'),
};

// Funções de eventos
export const eventAPI = {
    getAll: () => apiRequest('/events'),
    
    getByCode: (code: string) => apiRequest(`/events/${code}`),
    
    create: (eventData: { nome_evento: string; tipo: string; codigo_evento: string }) =>
        apiRequest('/events', {
            method: 'POST',
            body: JSON.stringify(eventData),
        }),
};

// Funções de módulos
export const moduleAPI = {
    getEventModules: (eventId: string) => apiRequest(`/modules/${eventId}`),
    
    updateModule: (eventId: string, moduleName: string, data: { ativo: boolean; configuracao?: any }) =>
        apiRequest(`/modules/${eventId}/${moduleName}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
    
    resetModules: (eventId: string) =>
        apiRequest(`/modules/${eventId}/reset`, {
            method: 'POST',
        }),
};

// Funções de fila
export const queueAPI = {
    getEventQueue: (eventId: string) => apiRequest(`/queues/${eventId}`),
    
    addToQueue: (eventId: string, musicId: string) =>
        apiRequest(`/queues/${eventId}`, {
            method: 'POST',
            body: JSON.stringify({ id_musica: musicId }),
        }),
    
    removeFromQueue: (queueId: string) =>
        apiRequest(`/queues/${queueId}`, {
            method: 'DELETE',
        }),
    
    markAsPlayed: (queueId: string, score?: number) =>
        apiRequest(`/queues/${queueId}/play`, {
            method: 'PUT',
            body: JSON.stringify({ pontuacao: score }),
        }),
};

// Funções de músicas
export const musicAPI = {
    getAll: () => apiRequest('/musics'),
};

// Funções de torneios
export const tournamentAPI = {
    getEventTournaments: (eventId: string) => apiRequest(`/tournaments/${eventId}`),
};

// Funções de plugins
export const pluginAPI = {
    // Upload de plugin (formData com arquivo)
    upload: async (formData: FormData) => {
        const url = `${API_BASE_URL}/plugins/upload`;
        const token = localStorage.getItem('token');
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: formData,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Erro no upload do plugin');
        return data;
    },
    // Listar plugins
    list: () => apiRequest('/plugins'),
    // Remover plugin
    remove: (name: string) => apiRequest(`/plugins/${name}`, { method: 'DELETE' }),
};

export default {
    auth: authAPI,
    events: eventAPI,
    modules: moduleAPI,
    queue: queueAPI,
    music: musicAPI,
    tournament: tournamentAPI,
    plugin: pluginAPI,
};