/**
 * Script de Configuração do Banco de Dados para Produção
 * Just Dance Event Hub
 */

const { Sequelize } = require('sequelize');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Importar modelos
const User = require('../src/models/user');
const Event = require('../src/models/event');
const QueueItem = require('../src/models/queue');
const Tournament = require('../src/models/tournament');
const Music = require('../src/models/music');

// Configuração do banco
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: console.log,
    pool: {
      max: 20,
      min: 5,
      acquire: 60000,
      idle: 10000
    },
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    }
  }
);

// Função para criar dados iniciais de produção
async function createInitialData() {
  console.log('🔧 Criando dados iniciais para produção...');
  
  try {
    // Criar super admin
    const adminPassword = await bcrypt.hash('Admin@2024!Change', 12);
    const [superAdmin, adminCreated] = await User.findOrCreate({
      where: { email: 'admin@justdancehub.com' },
      defaults: {
        name: 'Super Admin',
        email: 'admin@justdancehub.com',
        password: adminPassword,
        role: 'admin',
        isActive: true,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    if (adminCreated) {
      console.log('✅ Super admin criado com sucesso');
      console.log('⚠️  IMPORTANTE: Altere a senha padrão: Admin@2024!Change');
    } else {
      console.log('ℹ️  Super admin já existe');
    }
    
    // Criar usuário staff padrão
    const staffPassword = await bcrypt.hash('Staff@2024!Change', 12);
    const [staffUser, staffCreated] = await User.findOrCreate({
      where: { email: 'staff@justdancehub.com' },
      defaults: {
        name: 'Staff User',
        email: 'staff@justdancehub.com',
        password: staffPassword,
        role: 'staff',
        isActive: true,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    if (staffCreated) {
      console.log('✅ Usuário staff criado com sucesso');
      console.log('⚠️  IMPORTANTE: Altere a senha padrão: Staff@2024!Change');
    } else {
      console.log('ℹ️  Usuário staff já existe');
    }
    
    // Criar evento padrão
    const [defaultEvent, eventCreated] = await Event.findOrCreate({
      where: { name: 'Just Dance Event Hub' },
      defaults: {
        name: 'Just Dance Event Hub',
        description: 'Sistema de gerenciamento de eventos Just Dance',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 ano
        location: 'Sistema Online',
        maxParticipants: 1000,
        isActive: true,
        settings: {
          allowRegistration: true,
          allowQueueJoin: true,
          maxSongsPerPlayer: 3,
          tournamentMode: false
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    if (eventCreated) {
      console.log('✅ Evento padrão criado com sucesso');
    } else {
      console.log('ℹ️  Evento padrão já existe');
    }
    
    // Criar algumas músicas padrão do Just Dance
    const defaultSongs = [
      {
        title: 'Levitating',
        artist: 'Dua Lipa',
        difficulty: 'Medium',
        duration: 203,
        year: 2021,
        genre: 'Pop',
        isActive: true
      },
      {
        title: 'Happier Than Ever',
        artist: 'Billie Eilish',
        difficulty: 'Hard',
        duration: 298,
        year: 2021,
        genre: 'Alternative',
        isActive: true
      },
      {
        title: 'Stay',
        artist: 'The Kid LAROI & Justin Bieber',
        difficulty: 'Easy',
        duration: 141,
        year: 2021,
        genre: 'Pop',
        isActive: true
      },
      {
        title: 'Industry Baby',
        artist: 'Lil Nas X ft. Jack Harlow',
        difficulty: 'Medium',
        duration: 212,
        year: 2021,
        genre: 'Hip Hop',
        isActive: true
      },
      {
        title: 'Good 4 U',
        artist: 'Olivia Rodrigo',
        difficulty: 'Medium',
        duration: 178,
        year: 2021,
        genre: 'Pop Rock',
        isActive: true
      }
    ];
    
    for (const song of defaultSongs) {
      const [music, created] = await Music.findOrCreate({
        where: { title: song.title, artist: song.artist },
        defaults: {
          ...song,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      
      if (created) {
        console.log(`✅ Música criada: ${song.title} - ${song.artist}`);
      }
    }
    
    console.log('✅ Dados iniciais criados com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao criar dados iniciais:', error);
    throw error;
  }
}

// Função para configurar índices de performance
async function createPerformanceIndexes() {
  console.log('🚀 Criando índices de performance...');
  
  try {
    const queryInterface = sequelize.getQueryInterface();
    
    // Índices para tabela de usuários
    await queryInterface.addIndex('Users', ['email'], {
      name: 'idx_users_email',
      unique: true
    }).catch(() => console.log('Índice idx_users_email já existe'));
    
    await queryInterface.addIndex('Users', ['role'], {
      name: 'idx_users_role'
    }).catch(() => console.log('Índice idx_users_role já existe'));
    
    await queryInterface.addIndex('Users', ['isActive'], {
      name: 'idx_users_active'
    }).catch(() => console.log('Índice idx_users_active já existe'));
    
    // Índices para tabela de queue
    await queryInterface.addIndex('QueueItems', ['status'], {
      name: 'idx_queue_status'
    }).catch(() => console.log('Índice idx_queue_status já existe'));
    
    await queryInterface.addIndex('QueueItems', ['eventId'], {
      name: 'idx_queue_event'
    }).catch(() => console.log('Índice idx_queue_event já existe'));
    
    await queryInterface.addIndex('QueueItems', ['createdAt'], {
      name: 'idx_queue_created'
    }).catch(() => console.log('Índice idx_queue_created já existe'));
    
    // Índices para tabela de eventos
    await queryInterface.addIndex('Events', ['isActive'], {
      name: 'idx_events_active'
    }).catch(() => console.log('Índice idx_events_active já existe'));
    
    await queryInterface.addIndex('Events', ['startDate'], {
      name: 'idx_events_start_date'
    }).catch(() => console.log('Índice idx_events_start_date já existe'));
    
    // Índices para tabela de músicas
    await queryInterface.addIndex('Music', ['isActive'], {
      name: 'idx_music_active'
    }).catch(() => console.log('Índice idx_music_active já existe'));
    
    await queryInterface.addIndex('Music', ['title'], {
      name: 'idx_music_title'
    }).catch(() => console.log('Índice idx_music_title já existe'));
    
    await queryInterface.addIndex('Music', ['artist'], {
      name: 'idx_music_artist'
    }).catch(() => console.log('Índice idx_music_artist já existe'));
    
    console.log('✅ Índices de performance criados com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao criar índices:', error);
    throw error;
  }
}

// Função para configurar políticas de retenção
async function setupRetentionPolicies() {
  console.log('🗂️  Configurando políticas de retenção...');
  
  try {
    // Criar função para limpeza automática de logs antigos
    await sequelize.query(`
      CREATE OR REPLACE FUNCTION cleanup_old_queue_items()
      RETURNS void AS $$
      BEGIN
        -- Arquivar itens da queue mais antigos que 30 dias
        UPDATE "QueueItems" 
        SET status = 'archived'
        WHERE status IN ('completed', 'skipped') 
        AND "updatedAt" < NOW() - INTERVAL '30 days'
        AND status != 'archived';
        
        -- Log da operação
        RAISE NOTICE 'Queue cleanup completed at %', NOW();
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    console.log('✅ Políticas de retenção configuradas!');
    
  } catch (error) {
    console.error('❌ Erro ao configurar políticas de retenção:', error);
    // Não falhar por causa disso
  }
}

// Função para configurar monitoramento de performance
async function setupPerformanceMonitoring() {
  console.log('📊 Configurando monitoramento de performance...');
  
  try {
    // Habilitar extensões de monitoramento se disponíveis
    await sequelize.query('CREATE EXTENSION IF NOT EXISTS pg_stat_statements;')
      .catch(() => console.log('Extensão pg_stat_statements não disponível'));
    
    await sequelize.query('CREATE EXTENSION IF NOT EXISTS pg_buffercache;')
      .catch(() => console.log('Extensão pg_buffercache não disponível'));
    
    console.log('✅ Monitoramento de performance configurado!');
    
  } catch (error) {
    console.error('❌ Erro ao configurar monitoramento:', error);
    // Não falhar por causa disso
  }
}

// Função principal
async function setupProductionDatabase() {
  console.log('🚀 Iniciando configuração do banco de dados para produção...');
  console.log('📊 Configurações:');
  console.log(`   • Banco: ${process.env.DB_NAME}`);
  console.log(`   • Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
  console.log(`   • Usuário: ${process.env.DB_USER}`);
  console.log('');
  
  try {
    // Testar conexão
    console.log('🔌 Testando conexão com o banco...');
    await sequelize.authenticate();
    console.log('✅ Conexão estabelecida com sucesso!');
    
    // Sincronizar modelos (criar tabelas se não existirem)
    console.log('🔄 Sincronizando modelos...');
    await sequelize.sync({ alter: true });
    console.log('✅ Modelos sincronizados!');
    
    // Criar dados iniciais
    await createInitialData();
    
    // Criar índices de performance
    await createPerformanceIndexes();
    
    // Configurar políticas de retenção
    await setupRetentionPolicies();
    
    // Configurar monitoramento
    await setupPerformanceMonitoring();
    
    console.log('');
    console.log('🎉 Banco de dados configurado com sucesso para produção!');
    console.log('');
    console.log('📝 Credenciais padrão criadas:');
    console.log('   • Admin: admin@justdancehub.com / Admin@2024!Change');
    console.log('   • Staff: staff@justdancehub.com / Staff@2024!Change');
    console.log('');
    console.log('⚠️  IMPORTANTE: Altere as senhas padrão imediatamente!');
    
  } catch (error) {
    console.error('❌ Erro na configuração do banco:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  setupProductionDatabase();
}

module.exports = { setupProductionDatabase };