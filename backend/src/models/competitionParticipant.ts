// backend/src/models/competitionParticipant.ts
import { Model, DataTypes, Op } from 'sequelize';
import sequelize from '../utils/database';
import Competition from './competition';
import User from './user';
import Team from './team';

export interface CompetitionParticipantAttributes {
    id: string;
    id_competition: string;
    id_usuario?: string; // Para participação individual
    id_team?: string; // Para participação em equipe
    tipo_participacao: 'individual' | 'equipe';
    status: 'inscrito' | 'confirmado' | 'eliminado' | 'vencedor' | 'desistente';
    posicao_final?: number;
    pontuacao_total?: number;
    data_inscricao: Date;
    created_at?: Date;
    updated_at?: Date;
    // Associações
    usuario?: User;
    team?: Team;
}

export interface CompetitionParticipantCreationAttributes extends Omit<CompetitionParticipantAttributes, 'id' | 'created_at' | 'updated_at'> {}

class CompetitionParticipant extends Model<CompetitionParticipantAttributes, CompetitionParticipantCreationAttributes> implements CompetitionParticipantAttributes {
    public id!: string;
    public id_competition!: string;
    public id_usuario?: string;
    public id_team?: string;
    public tipo_participacao!: 'individual' | 'equipe';
    public status!: 'inscrito' | 'confirmado' | 'eliminado' | 'vencedor' | 'desistente';
    public posicao_final?: number;
    public pontuacao_total?: number;
    public data_inscricao!: Date;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;

    // Associações
    public usuario?: User;
    public team?: Team;

    // Métodos de associação
    public static associate() {
        CompetitionParticipant.belongsTo(Competition, {
            foreignKey: 'id_competition',
            as: 'competition'
        });
        
        CompetitionParticipant.belongsTo(User, {
            foreignKey: 'id_usuario',
            as: 'usuario'
        });
        
        CompetitionParticipant.belongsTo(Team, {
            foreignKey: 'id_team',
            as: 'team'
        });
    }
}

CompetitionParticipant.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        id_competition: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: Competition,
                key: 'id',
            },
        },
        id_usuario: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: User,
                key: 'id',
            },
        },
        id_team: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: Team,
                key: 'id',
            },
        },
        tipo_participacao: {
            type: DataTypes.ENUM('individual', 'equipe'),
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('inscrito', 'confirmado', 'eliminado', 'vencedor', 'desistente'),
            allowNull: false,
            defaultValue: 'inscrito',
        },
        posicao_final: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        pontuacao_total: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: 0,
        },
        data_inscricao: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        modelName: 'CompetitionParticipant',
        tableName: 'competition_participants',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        validate: {
            // Validação para garantir que apenas um dos campos (id_usuario ou id_team) seja preenchido
            participantValidation() {
                if ((this['id_usuario'] && this['id_team']) || (!this['id_usuario'] && !this['id_team'])) {
                    throw new Error('Deve ser especificado apenas um participante: usuário OU equipe');
                }
                if (this['tipo_participacao'] === 'individual' && !this['id_usuario']) {
                    throw new Error('Participação individual requer id_usuario');
                }
                if (this['tipo_participacao'] === 'equipe' && !this['id_team']) {
                    throw new Error('Participação em equipe requer id_team');
                }
            }
        },
        indexes: [
            {
                unique: true,
                fields: ['id_competition', 'id_usuario'],
                where: {
                    id_usuario: { [Op.ne]: null }
                }
            },
            {
                unique: true,
                fields: ['id_competition', 'id_team'],
                where: {
                    id_team: { [Op.ne]: null }
                }
            }
        ]
    }
);

export default CompetitionParticipant;