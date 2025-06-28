import { Model, DataTypes } from 'sequelize';
import sequelize from '../utils/database';
import Event from './event';

export interface EventConfigAttributes {
    id: string;
    id_evento: string;
    modulo: string;
    ativo: boolean;
    configuracao?: any;
    created_at?: Date;
    updated_at?: Date;
}

export interface EventConfigCreationAttributes extends Omit<EventConfigAttributes, 'id' | 'created_at' | 'updated_at'> {}

class EventConfig extends Model<EventConfigAttributes, EventConfigCreationAttributes> implements EventConfigAttributes {
    public id!: string;
    public id_evento!: string;
    public modulo!: string;
    public ativo!: boolean;
    public configuracao?: any;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

EventConfig.init(
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
        modulo: {
            type: DataTypes.STRING(50),
            allowNull: false,
            validate: {
                isIn: [['queue', 'tournament', 'xp_system', 'team_mode', 'music_requests', 'leaderboard', 'chat', 'voting']],
            },
        },
        ativo: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        configuracao: {
            type: DataTypes.JSONB,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'event_configs',
        timestamps: true,
    }
);

// Definir relacionamentos
EventConfig.belongsTo(Event, { foreignKey: 'id_evento', as: 'evento' });
Event.hasMany(EventConfig, { foreignKey: 'id_evento', as: 'configuracoes' });

export default EventConfig; 