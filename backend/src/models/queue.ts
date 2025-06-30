import { Model, DataTypes } from 'sequelize';
import sequelize from '../utils/database';
import { testSequelize } from '../utils/database.test';
import Event from './event';
import User from './user';
import Music from './music';

export interface QueueAttributes {
    id: string;
    id_evento: string;
    id_jogador: string;
    id_musica: string;
    status: 'pendente' | 'em_andamento' | 'finalizado';
    pontuacao?: number;
    created_at?: Date;
    updated_at?: Date;
}

export interface QueueCreationAttributes extends Omit<QueueAttributes, 'id' | 'created_at' | 'updated_at'> {}

class Queue extends Model<QueueAttributes, QueueCreationAttributes> implements QueueAttributes {
    public id!: string;
    public id_evento!: string;
    public id_jogador!: string;
    public id_musica!: string;
    public status!: 'pendente' | 'em_andamento' | 'finalizado';
    public pontuacao?: number;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

// Usar banco de teste se estiver em modo de teste
const db = (process.env['NODE_ENV'] === 'test' && testSequelize) ? testSequelize : sequelize;

Queue.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        id_evento: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'events',
                key: 'id',
            },
        },
        id_jogador: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        id_musica: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'musics',
                key: 'id',
            },
        },
        status: {
            type: DataTypes.ENUM('pendente', 'em_andamento', 'finalizado'),
            allowNull: false,
            defaultValue: 'pendente',
        },
        pontuacao: {
            type: DataTypes.INTEGER,
            allowNull: true,
            validate: {
                min: 0,
                max: 10000,
            },
        },
    },
    {
        sequelize: db,
        tableName: 'queues',
        timestamps: true,
    }
);

// Definir relacionamentos
Queue.belongsTo(Event, { foreignKey: 'id_evento', as: 'evento' });
Queue.belongsTo(User, { foreignKey: 'id_jogador', as: 'jogador' });
Queue.belongsTo(Music, { foreignKey: 'id_musica', as: 'musica' });

Event.hasMany(Queue, { foreignKey: 'id_evento', as: 'filas' });
User.hasMany(Queue, { foreignKey: 'id_jogador', as: 'filas' });
Music.hasMany(Queue, { foreignKey: 'id_musica', as: 'filas' });

export default Queue;