// backend/src/models/tournament.ts
import { Model, DataTypes } from 'sequelize';
import sequelize from '../utils/database'; // Supondo que você tenha um arquivo de configuração do Sequelize
import Event from './event';

export interface TournamentAttributes {
    id: string;
    id_evento: string;
    nome: string;
    status: 'inscricoes' | 'em_andamento' | 'finalizado';
    max_participantes: number;
    created_at?: Date;
    updated_at?: Date;
}

export interface TournamentCreationAttributes extends Omit<TournamentAttributes, 'id' | 'created_at' | 'updated_at'> {}

class Tournament extends Model<TournamentAttributes, TournamentCreationAttributes> implements TournamentAttributes {
    public id!: string;
    public id_evento!: string;
    public nome!: string;
    public status!: 'inscricoes' | 'em_andamento' | 'finalizado';
    public max_participantes!: number;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

Tournament.init(
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
        nome: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        status: {
            type: DataTypes.ENUM('inscricoes', 'em_andamento', 'finalizado'),
            allowNull: false,
            defaultValue: 'inscricoes',
        },
        max_participantes: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 2,
                max: 64,
            },
        },
    },
    {
        sequelize,
        tableName: 'tournaments',
        timestamps: true,
    }
);

// Definir relacionamentos
Tournament.belongsTo(Event, { foreignKey: 'id_evento', as: 'evento' });
Event.hasMany(Tournament, { foreignKey: 'id_evento', as: 'torneios' });

export default Tournament;