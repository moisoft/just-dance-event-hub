import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Configuração para autenticação
export const supabaseAuth = {
  signUp: async (email: string, password: string, metadata?: any) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
  },
  
  signIn: async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({
      email,
      password
    });
  },
  
  signOut: async () => {
    return await supabase.auth.signOut();
  },
  
  getUser: async () => {
    return await supabase.auth.getUser();
  },
  
  refreshSession: async (refreshToken: string) => {
    return await supabase.auth.refreshSession({
      refresh_token: refreshToken
    });
  },
  
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// Configuração para banco de dados
export const supabaseDB = {
  // Users
  users: {
    create: async (userData: any) => {
      return await supabase.from('users').insert(userData);
    },
    
    findById: async (id: string) => {
      return await supabase.from('users').select('*').eq('id', id).single();
    },
    
    findByEmail: async (email: string) => {
      return await supabase.from('users').select('*').eq('email', email).single();
    },
    
    update: async (id: string, userData: any) => {
      return await supabase.from('users').update(userData).eq('id', id);
    },
    
    delete: async (id: string) => {
      return await supabase.from('users').delete().eq('id', id);
    },
    
    list: async (filters?: any) => {
      let query = supabase.from('users').select('*');
      
      if (filters) {
        Object.keys(filters).forEach(key => {
          query = query.eq(key, filters[key]);
        });
      }
      
      return await query;
    }
  },
  
  // Events
  events: {
    create: async (eventData: any) => {
      return await supabase.from('events').insert(eventData);
    },
    
    findById: async (id: string) => {
      return await supabase.from('events').select('*').eq('id', id).single();
    },
    
    update: async (id: string, eventData: any) => {
      return await supabase.from('events').update(eventData).eq('id', id);
    },
    
    delete: async (id: string) => {
      return await supabase.from('events').delete().eq('id', id);
    },
    
    list: async (filters?: any) => {
      let query = supabase.from('events').select('*');
      
      if (filters) {
        Object.keys(filters).forEach(key => {
          query = query.eq(key, filters[key]);
        });
      }
      
      return await query;
    }
  },
  
  // Queues
  queues: {
    create: async (queueData: any) => {
      return await supabase.from('queues').insert(queueData);
    },
    
    findById: async (id: string) => {
      return await supabase.from('queues').select('*').eq('id', id).single();
    },
    
    update: async (id: string, queueData: any) => {
      return await supabase.from('queues').update(queueData).eq('id', id);
    },
    
    delete: async (id: string) => {
      return await supabase.from('queues').delete().eq('id', id);
    },
    
    list: async (filters?: any) => {
      let query = supabase.from('queues').select('*');
      
      if (filters) {
        Object.keys(filters).forEach(key => {
          query = query.eq(key, filters[key]);
        });
      }
      
      return await query;
    }
  },
  
  // Teams
  teams: {
    create: async (teamData: any) => {
      return await supabase.from('teams').insert(teamData);
    },
    
    findById: async (id: string) => {
      return await supabase.from('teams').select('*').eq('id', id).single();
    },
    
    update: async (id: string, teamData: any) => {
      return await supabase.from('teams').update(teamData).eq('id', id);
    },
    
    delete: async (id: string) => {
      return await supabase.from('teams').delete().eq('id', id);
    },
    
    list: async (filters?: any) => {
      let query = supabase.from('teams').select('*');
      
      if (filters) {
        Object.keys(filters).forEach(key => {
          query = query.eq(key, filters[key]);
        });
      }
      
      return await query;
    }
  },
  
  // Competitions
  competitions: {
    create: async (competitionData: any) => {
      return await supabase.from('competitions').insert(competitionData);
    },
    
    findById: async (id: string) => {
      return await supabase.from('competitions').select('*').eq('id', id).single();
    },
    
    update: async (id: string, competitionData: any) => {
      return await supabase.from('competitions').update(competitionData).eq('id', id);
    },
    
    delete: async (id: string) => {
      return await supabase.from('competitions').delete().eq('id', id);
    },
    
    list: async (filters?: any) => {
      let query = supabase.from('competitions').select('*');
      
      if (filters) {
        Object.keys(filters).forEach(key => {
          query = query.eq(key, filters[key]);
        });
      }
      
      return await query;
    }
  }
};

export default supabase;
