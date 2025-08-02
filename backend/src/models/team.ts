// backend/src/models/team.ts
import { Model, DataTypes } from 'sequelize';
import sequelize from '../utils/database';
import Event from './event';
import User from './user';

export interface TeamAttributes {
    id: string;
    id_evento: string;
    nome: string;
    lider_id: string;
    max_membros: number;
    status: 'formacao' | 'completa' | 'ativa' | 'eliminada';
    codigo_convite?: string;
    created_at?: Date;
    updated_at?: Date;
    membros?: any[]; // Associação com TeamMember
}

export interface TeamCreationAttributes extends Omit<TeamAttributes, 'id' | 'created_at' | 'updated_at'> {}

class Team extends Model<TeamAttributes, TeamCreationAttributes> implements TeamAttributes {
    public id!: string;
    public id_evento!: string;
    public nome!: string;
    public lider_id!: string;
    public max_membros!: number;
    public status!: 'formacao' | 'completa' | 'ativa' | 'eliminada';
    public codigo_convite?: string;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
    public membros?: any[]; // Associação com TeamMember

    // Associações
    public static associate() {
        Team.belongsTo(Event, {
            foreignKey: 'id_evento',
            as: 'evento'
        });
        
        Team.belongsTo(User, {
            foreignKey: 'lider_id',
            as: 'lider'
        });
        
        // Importar TeamMember aqui para evitar dependência circular
        const TeamMember = require('./teamMember').default;
        Team.hasMany(TeamMember, {
            foreignKey: 'id_team',
            as: 'membros'
        });
    }
}

Team.init(
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
                model: Event,
                key: 'id',
            },
        },
        nome: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        lider_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: User,
                key: 'id',
            },
        },
        max_membros: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 4,
            validate: {
                min: 2,
                max: 4
            }
        },
        status: {
            type: DataTypes.ENUM('formacao', 'completa', 'ativa', 'eliminada'),
            allowNull: false,
            defaultValue: 'formacao',
        },
        codigo_convite: {
            type: DataTypes.STRING(10),
            allowNull: true,
            unique: true,
        },
    },
    {
        sequelize,
        modelName: 'Team',
        tableName: 'teams',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);

export default Team;