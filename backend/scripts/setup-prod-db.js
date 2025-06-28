const { Client } = require('pg');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
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

        // Criar admin se não existir
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        if (adminEmail && adminPassword) {
            // Verifica se já existe admin com esse email
            const res = await client.query('SELECT id FROM users WHERE email = $1', [adminEmail]);
            if (res.rows.length === 0) {
                // Gerar hash da senha
                const senha_hash = await bcrypt.hash(adminPassword, 10);
                await client.query(`
                    INSERT INTO users (id, nickname, email, senha_hash, papel, xp, nivel, is_super_admin, created_at, updated_at)
                    VALUES (gen_random_uuid(), 'admin', $1, $2, 'admin', 0, 1, true, NOW(), NOW())
                `, [adminEmail, senha_hash]);
                console.log('✅ Usuário admin criado com sucesso!');
            } else {
                console.log('ℹ️ Usuário admin já existe, não será criado novamente.');
            }
        } else {
            console.log('⚠️ Variáveis ADMIN_EMAIL ou ADMIN_PASSWORD não definidas. Admin não criado.');
        }
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