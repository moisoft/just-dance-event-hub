// api.ts

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

async function callApi<T>(endpoint: string, method: string, data?: any): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const result = await response.json();

    if (response.ok) {
      // Se a resposta já tem a estrutura success/data, retorna ela diretamente
      if (result.success !== undefined) {
        return { success: result.success, data: result.user || result.data, error: result.error || result.message };
      }
      return { success: true, data: result };
    } else {
      return { success: false, error: result.error || result.message || 'An error occurred' };
    }
  } catch (error: any) {
    return { success: false, error: error.message || 'Network error' };
  }
}

export const authApi = {
  login: (credentials: any) => callApi('/auth/login', 'POST', credentials),
  register: (userData: any) => callApi('/auth/register', 'POST', userData),
  mockLogin: (credentials: any) => callApi('/api/mock/auth/login', 'POST', credentials),
};

// Define the event response type
interface EventResponse {
  event: {
    id: string;
    nome_evento: string;
    codigo_evento: string;
    descricao?: string;
    data_inicio?: string;
    data_fim?: string;
    local?: string;
    status?: string;
    organizador?: string;
    [key: string]: any; // For other properties
  };
}

export const eventApi = {
  getEventByCode: (code: string) => callApi<EventResponse>(`/api/mock/events/${code}`, 'GET'),
};

export const adminApi = {
  // Usuários
  getUsers: () => callApi('/admin/users', 'GET'),
  createUser: (userData: any) => callApi('/admin/users', 'POST', userData),
  updateUser: (id: string, userData: any) => callApi(`/admin/users/${id}`, 'PUT', userData),
  deleteUser: (id: string) => callApi(`/admin/users/${id}`, 'DELETE'),
  
  // Eventos
  getEvents: () => callApi('/admin/events', 'GET'),
  createEvent: (eventData: any) => callApi('/admin/events', 'POST', eventData),
  updateEvent: (id: string, eventData: any) => callApi(`/admin/events/${id}`, 'PUT', eventData),
  deleteEvent: (id: string) => callApi(`/admin/events/${id}`, 'DELETE'),
  
  // Competições
  getCompetitions: () => callApi('/admin/competitions', 'GET'),
  createCompetition: (competitionData: any) => callApi('/admin/competitions', 'POST', competitionData),
  updateCompetition: (id: string, competitionData: any) => callApi(`/admin/competitions/${id}`, 'PUT', competitionData),
  deleteCompetition: (id: string) => callApi(`/admin/competitions/${id}`, 'DELETE'),
  
  // Músicas
  getMusics: () => callApi('/admin/musics', 'GET'),
  createMusic: (musicData: any) => callApi('/admin/musics', 'POST', musicData),
  updateMusic: (id: string, musicData: any) => callApi(`/admin/musics/${id}`, 'PUT', musicData),
  deleteMusic: (id: string) => callApi(`/admin/musics/${id}`, 'DELETE'),
  
  // Coaches
  getCoaches: () => callApi('/admin/coaches', 'GET'),
  createCoach: (coachData: any) => callApi('/admin/coaches', 'POST', coachData),
  updateCoach: (id: string, coachData: any) => callApi(`/admin/coaches/${id}`, 'PUT', coachData),
  deleteCoach: (id: string) => callApi(`/admin/coaches/${id}`, 'DELETE'),
  
  // Fila
  getQueue: () => callApi('/admin/queue', 'GET'),
  createQueueItem: (queueData: any) => callApi('/admin/queue', 'POST', queueData),
  updateQueueItem: (id: string, queueData: any) => callApi(`/admin/queue/${id}`, 'PUT', queueData),
  deleteQueueItem: (id: string) => callApi(`/admin/queue/${id}`, 'DELETE'),
  
  // Torneios
  getTournaments: () => callApi('/admin/tournaments', 'GET'),
  createTournament: (tournamentData: any) => callApi('/admin/tournaments', 'POST', tournamentData),
  updateTournament: (id: string, tournamentData: any) => callApi(`/admin/tournaments/${id}`, 'PUT', tournamentData),
  deleteTournament: (id: string) => callApi(`/admin/tournaments/${id}`, 'DELETE')
};

export const staffApi = {
  getQueue: () => callApi('/api/mock/staff/queue', 'GET'),
  updateQueueItem: (itemId: string, status: string) => callApi(`/api/mock/staff/queue/${itemId}`, 'PUT', { status }),
};