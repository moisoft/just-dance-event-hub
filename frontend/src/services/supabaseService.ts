import { supabase } from '../config/supabase';

// Tipos de dados
export interface User {
  id: string;
  email: string;
  nickname?: string;
  papel?: 'jogador' | 'staff' | 'organizador' | 'admin';
  xp?: number;
  nivel?: number;
  is_super_admin?: boolean;
  avatar_ativo_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Event {
  id: string;
  nome: string;
  descricao?: string;
  data_inicio: string;
  data_fim?: string;
  local?: string;
  status: 'ativo' | 'inativo' | 'finalizado';
  organizador_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Queue {
  id: string;
  evento_id: string;
  musica_id?: string;
  jogador_id: string;
  posicao: number;
  status: 'aguardando' | 'tocando' | 'finalizado';
  created_at?: string;
  updated_at?: string;
}

export interface Team {
  id: string;
  nome: string;
  descricao?: string;
  lider_id: string;
  evento_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface Competition {
  id: string;
  nome: string;
  descricao?: string;
  evento_id: string;
  data_inicio: string;
  data_fim?: string;
  status: 'ativo' | 'inativo' | 'finalizado';
  created_at?: string;
  updated_at?: string;
}

// Serviço de Autenticação
export class AuthService {
  // Registro de usuário
  static async signUp(email: string, password: string, metadata: Partial<User>) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nickname: metadata.nickname,
          papel: metadata.papel || 'jogador',
          xp: metadata.xp || 0,
          nivel: metadata.nivel || 1,
          is_super_admin: metadata.is_super_admin || false
        }
      }
    });
    return { data, error };
  }

  // Login de usuário
  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  }

  // Logout de usuário
  static async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  }

  // Obter usuário atual
  static async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  }

  // Atualizar perfil do usuário
  static async updateProfile(updates: Partial<User>) {
    const { data, error } = await supabase.auth.updateUser({
      data: {
        nickname: updates.nickname,
        papel: updates.papel,
        xp: updates.xp,
        nivel: updates.nivel,
        is_super_admin: updates.is_super_admin
      }
    });
    return { data, error };
  }

  // Escutar mudanças de autenticação
  static onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}

// Serviço de Eventos
export class EventService {
  // Criar evento
  static async createEvent(eventData: Omit<Event, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('events')
      .insert(eventData)
      .select()
      .single();
    return { data, error };
  }

  // Listar eventos
  static async listEvents(filters?: Partial<Event>) {
    let query = supabase.from('events').select('*');
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key as keyof Event]) {
          query = query.eq(key, filters[key as keyof Event]);
        }
      });
    }
    
    const { data, error } = await query;
    return { data, error };
  }

  // Obter evento por ID
  static async getEventById(id: string) {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  }

  // Atualizar evento
  static async updateEvent(id: string, updates: Partial<Event>) {
    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  }

  // Deletar evento
  static async deleteEvent(id: string) {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);
    return { error };
  }

  // Escutar mudanças em eventos (real-time)
  static subscribeToEvents(callback: (payload: any) => void) {
    return supabase
      .channel('events')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'events' }, 
        callback
      )
      .subscribe();
  }
}

// Serviço de Filas
export class QueueService {
  // Criar entrada na fila
  static async createQueueEntry(queueData: Omit<Queue, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('queues')
      .insert(queueData)
      .select()
      .single();
    return { data, error };
  }

  // Listar filas de um evento
  static async listQueuesByEvent(eventId: string) {
    const { data, error } = await supabase
      .from('queues')
      .select('*')
      .eq('evento_id', eventId)
      .order('posicao');
    return { data, error };
  }

  // Atualizar posição na fila
  static async updateQueuePosition(id: string, posicao: number) {
    const { data, error } = await supabase
      .from('queues')
      .update({ posicao })
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  }

  // Atualizar status da fila
  static async updateQueueStatus(id: string, status: Queue['status']) {
    const { data, error } = await supabase
      .from('queues')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  }

  // Remover da fila
  static async removeFromQueue(id: string) {
    const { error } = await supabase
      .from('queues')
      .delete()
      .eq('id', id);
    return { error };
  }

  // Escutar mudanças na fila (real-time)
  static subscribeToQueues(eventId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`queues-${eventId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'queues',
          filter: `evento_id=eq.${eventId}`
        }, 
        callback
      )
      .subscribe();
  }
}

// Serviço de Times
export class TeamService {
  // Criar time
  static async createTeam(teamData: Omit<Team, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('teams')
      .insert(teamData)
      .select()
      .single();
    return { data, error };
  }

  // Listar times de um evento
  static async listTeamsByEvent(eventId: string) {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('evento_id', eventId);
    return { data, error };
  }

  // Obter time por ID
  static async getTeamById(id: string) {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  }

  // Atualizar time
  static async updateTeam(id: string, updates: Partial<Team>) {
    const { data, error } = await supabase
      .from('teams')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  }

  // Deletar time
  static async deleteTeam(id: string) {
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', id);
    return { error };
  }
}

// Serviço de Competições
export class CompetitionService {
  // Criar competição
  static async createCompetition(competitionData: Omit<Competition, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('competitions')
      .insert(competitionData)
      .select()
      .single();
    return { data, error };
  }

  // Listar competições de um evento
  static async listCompetitionsByEvent(eventId: string) {
    const { data, error } = await supabase
      .from('competitions')
      .select('*')
      .eq('evento_id', eventId);
    return { data, error };
  }

  // Obter competição por ID
  static async getCompetitionById(id: string) {
    const { data, error } = await supabase
      .from('competitions')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  }

  // Atualizar competição
  static async updateCompetition(id: string, updates: Partial<Competition>) {
    const { data, error } = await supabase
      .from('competitions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  }

  // Deletar competição
  static async deleteCompetition(id: string) {
    const { error } = await supabase
      .from('competitions')
      .delete()
      .eq('id', id);
    return { error };
  }
}

// Serviço de Storage (para uploads)
export class StorageService {
  // Buckets disponíveis
  static readonly BUCKETS = {
    AVATARS: 'avatars',
    MUSIC_COVERS: 'music-covers',
    MUSIC_VIDEOS: 'music-videos',
    EVENT_IMAGES: 'event-images',
    USER_UPLOADS: 'user-uploads'
  } as const;

  // Upload de arquivo
  static async uploadFile(bucket: string, path: string, file: File, options?: { cacheControl?: string; contentType?: string }) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, options);
    return { data, error };
  }

  // Upload de avatar
  static async uploadAvatar(userId: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const path = `avatars/${fileName}`;
    
    const { data, error } = await this.uploadFile(this.BUCKETS.AVATARS, path, file, {
      contentType: file.type,
      cacheControl: '3600'
    });
    
    if (error) return { data: null, error };
    
    return { data: { path, url: this.getPublicUrl(this.BUCKETS.AVATARS, path) }, error: null };
  }

  // Upload de capa de música
  static async uploadMusicCover(musicId: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${musicId}-cover.${fileExt}`;
    const path = `music-covers/${fileName}`;
    
    const { data, error } = await this.uploadFile(this.BUCKETS.MUSIC_COVERS, path, file, {
      contentType: file.type,
      cacheControl: '3600'
    });
    
    if (error) return { data: null, error };
    
    return { data: { path, url: this.getPublicUrl(this.BUCKETS.MUSIC_COVERS, path) }, error: null };
  }

  // Upload de vídeo de música
  static async uploadMusicVideo(musicId: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${musicId}-video.${fileExt}`;
    const path = `music-videos/${fileName}`;
    
    const { data, error } = await this.uploadFile(this.BUCKETS.MUSIC_VIDEOS, path, file, {
      contentType: file.type,
      cacheControl: '3600'
    });
    
    if (error) return { data: null, error };
    
    return { data: { path, url: this.getPublicUrl(this.BUCKETS.MUSIC_VIDEOS, path) }, error: null };
  }

  // Upload de imagem de evento
  static async uploadEventImage(eventId: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${eventId}-image.${fileExt}`;
    const path = `event-images/${fileName}`;
    
    const { data, error } = await this.uploadFile(this.BUCKETS.EVENT_IMAGES, path, file, {
      contentType: file.type,
      cacheControl: '3600'
    });
    
    if (error) return { data: null, error };
    
    return { data: { path, url: this.getPublicUrl(this.BUCKETS.EVENT_IMAGES, path) }, error: null };
  }

  // Upload de arquivo do usuário
  static async uploadUserFile(userId: string, file: File, folder?: string) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const path = folder ? `${userId}/${folder}/${fileName}` : `${userId}/${fileName}`;
    
    const { data, error } = await this.uploadFile(this.BUCKETS.USER_UPLOADS, path, file, {
      contentType: file.type,
      cacheControl: '3600'
    });
    
    if (error) return { data: null, error };
    
    return { data: { path, url: this.getPublicUrl(this.BUCKETS.USER_UPLOADS, path) }, error: null };
  }

  // Obter URL pública do arquivo
  static getPublicUrl(bucket: string, path: string) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    return data.publicUrl;
  }

  // Obter URL assinada do arquivo (para arquivos privados)
  static async getSignedUrl(bucket: string, path: string, expiresIn: number = 3600) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);
    return { data, error };
  }

  // Deletar arquivo
  static async deleteFile(bucket: string, path: string) {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);
    return { error };
  }

  // Listar arquivos
  static async listFiles(bucket: string, path?: string) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path);
    return { data, error };
  }

  // Listar arquivos do usuário
  static async listUserFiles(userId: string, folder?: string) {
    const path = folder ? `${userId}/${folder}` : userId;
    return this.listFiles(this.BUCKETS.USER_UPLOADS, path);
  }

  // Obter tamanho do arquivo
  static async getFileSize(bucket: string, path: string) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path.split('/').slice(0, -1).join('/'));
    
    if (error) return { size: 0, error };
    
    const file = data?.find(f => f.name === path.split('/').pop());
    return { size: file?.metadata?.['size'] || 0, error: null };
  }

  // Validar tipo de arquivo
  static validateFileType(file: File, allowedTypes: string[]) {
    return allowedTypes.includes(file.type);
  }

  // Validar tamanho do arquivo
  static validateFileSize(file: File, maxSizeMB: number) {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }

  // Obter extensão do arquivo
  static getFileExtension(filename: string) {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  // Gerar nome único para arquivo
  static generateUniqueFilename(originalName: string, prefix?: string) {
    const ext = this.getFileExtension(originalName);
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const name = prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`;
    return `${name}.${ext}`;
  }
}

// As classes já são exportadas individualmente acima
