import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const env = process.env;

const sequelize = new Sequelize(
    env['DB_NAME'] || 'just_dance_hub',
    env['DB_USER'] || 'postgres',
    env['DB_PASSWORD'] || 'password',
    {
        host: env['DB_HOST'] || 'localhost',
        port: parseInt(env['DB_PORT'] || '5432'),
        dialect: 'postgres',
        logging: env['NODE_ENV'] === 'development' ? console.log : false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

export const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection established successfully.');
        
        // Sincronizar modelos com o banco (em desenvolvimento)
        if (env['NODE_ENV'] === 'development') {
            await sequelize.sync({ alter: true });
            console.log('Database synchronized.');
        }
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
};

export default sequelize;
