import { Model, DataTypes } from 'sequelize';
import sequelize from '../utils/database';
import { testSequelize } from '../utils/database.test';
import User from './user';

export interface EventAttributes {
    id: string;
    nome_evento: string;
    id_organizador: string;
    tipo: 'casual' | 'torneio';
    codigo_evento: string;
    status: 'ativo' | 'inativo';
    created_at?: Date;
    updated_at?: Date;
}

export interface EventCreationAttributes extends Omit<EventAttributes, 'id' | 'created_at' | 'updated_at'> {}

class Event extends Model<EventAttributes, EventCreationAttributes> implements EventAttributes {
    public id!: string;
    public nome_evento!: string;
    public id_organizador!: string;
    public tipo!: 'casual' | 'torneio';
    public codigo_evento!: string;
    public status!: 'ativo' | 'inativo';
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

// Usar banco de teste se estiver em modo de teste
const db = (process.env['NODE_ENV'] === 'test' && testSequelize) ? testSequelize : sequelize;

Event.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        nome_evento: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                len: [3, 100],
                notEmpty: true,
            },
        },
        id_organizador: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        tipo: {
            type: DataTypes.ENUM('casual', 'torneio'),
            allowNull: false,
        },
        codigo_evento: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true,
            validate: {
                len: [3, 20],
                notEmpty: true,
            },
        },
        status: {
            type: DataTypes.ENUM('ativo', 'inativo'),
            allowNull: false,
            defaultValue: 'ativo',
        },
    },
    {
        sequelize: db,
        tableName: 'events',
        timestamps: true,
    }
);

// Definir relacionamentos
Event.belongsTo(User, { foreignKey: 'id_organizador', as: 'organizador' });
User.hasMany(Event, { foreignKey: 'id_organizador', as: 'eventos' });

export default Event;