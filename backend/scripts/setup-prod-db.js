const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

async function setupProdDB() {
    const client = new Client({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '96517245',
        database: process.env.DB_NAME || 'just_dance_hub',
    });
    
    try {
        await client.connect();
        console.log('✅ Conectado ao banco de produção');
        
        // Criar ENUMs se não existirem
        console.log('🔧 Criando ENUMs...');
        
        await client.query(`
            DO $$ BEGIN
                CREATE TYPE user_role AS ENUM ('jogador', 'staff', 'organizador', 'admin');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);
        
        await client.query(`
            DO $$ BEGIN
                CREATE TYPE event_type AS ENUM ('festa', 'competicao', 'treino', 'workshop');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);
        
        await client.query(`
            DO $$ BEGIN
                CREATE TYPE event_status AS ENUM ('ativo', 'pausado', 'finalizado', 'cancelado');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);
        
        await client.query(`
            DO $$ BEGIN
                CREATE TYPE queue_status AS ENUM ('aguardando', 'em_andamento', 'finalizado');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);
        
        console.log('✅ ENUMs criados/verificados');
        console.log('✅ Banco de produção configurado com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro ao configurar banco:', error);
        throw error;
    } finally {
        await client.end();
    }
}

if (require.main === module) {
    setupProdDB()
        .then(() => {
            console.log('🎉 Setup concluído!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Erro no setup:', error);
            process.exit(1);
        });
}

module.exports = setupProdDB; 