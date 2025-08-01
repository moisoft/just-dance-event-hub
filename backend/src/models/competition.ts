// backend/src/models/competition.ts
import { Model, DataTypes } from 'sequelize';
import sequelize from '../utils/database';
import Event from './event';

export interface CompetitionAttributes {
    id: string;
    id_evento: string;
    nome: string;
    tipo: 'torneio' | 'campeonato' | 'liga' | 'batalha';
    formato: 'individual' | 'equipe' | 'misto';
    status: 'inscricoes' | 'em_andamento' | 'finalizado' | 'cancelado';
    max_participantes: number;
    participantes_atuais: number;
    data_inicio: Date;
    data_fim?: Date;
    premio?: string;
    taxa_inscricao?: number;
    regras?: string;
    chaveamento?: any; // JSON para armazenar estrutura do chaveamento
    created_at?: Date;
    updated_at?: Date;
    // Associações
    evento?: Event;
}

export interface CompetitionCreationAttributes extends Omit<CompetitionAttributes, 'id' | 'created_at' | 'updated_at'> {}

class Competition extends Model<CompetitionAttributes, CompetitionCreationAttributes> implements CompetitionAttributes {
    public id!: string;
    public id_evento!: string;
    public nome!: string;
    public tipo!: 'torneio' | 'campeonato' | 'liga' | 'batalha';
    public formato!: 'individual' | 'equipe' | 'misto';
    public status!: 'inscricoes' | 'em_andamento' | 'finalizado' | 'cancelado';
    public max_participantes!: number;
    public participantes_atuais!: number;
    public data_inicio!: Date;
    public data_fim?: Date;
    public premio?: string;
    public taxa_inscricao?: number;
    public regras?: string;
    public chaveamento?: any;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;

    // Associações
    public evento?: Event;

    // Métodos de associação
    public static associate() {
        Competition.belongsTo(Event, {
            foreignKey: 'id_evento',
            as: 'evento'
        });
    }
}

Competition.init(
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
            type: DataTypes.STRING(200),
            allowNull: false,
        },
        tipo: {
            type: DataTypes.ENUM('torneio', 'campeonato', 'liga', 'batalha'),
            allowNull: false,
            defaultValue: 'torneio',
        },
        formato: {
            type: DataTypes.ENUM('individual', 'equipe', 'misto'),
            allowNull: false,
            defaultValue: 'individual',
        },
        status: {
            type: DataTypes.ENUM('inscricoes', 'em_andamento', 'finalizado', 'cancelado'),
            allowNull: false,
            defaultValue: 'inscricoes',
        },
        max_participantes: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 2,
                max: 128
            }
        },
        participantes_atuais: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        data_inicio: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        data_fim: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        premio: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        taxa_inscricao: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: 0,
        },
        regras: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        chaveamento: {
            type: DataTypes.JSON,
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: 'Competition',
        tableName: 'competitions',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);

export default Competition;