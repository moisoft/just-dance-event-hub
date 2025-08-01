// backend/src/models/teamMember.ts
import { Model, DataTypes } from 'sequelize';
import sequelize from '../utils/database';
import Team from './team';
import User from './user';

export interface TeamMemberAttributes {
    id: string;
    id_team: string;
    id_usuario: string;
    papel: 'lider' | 'membro';
    status: 'ativo' | 'inativo' | 'convidado';
    data_entrada?: Date;
    created_at?: Date;
    updated_at?: Date;
}

export interface TeamMemberCreationAttributes extends Omit<TeamMemberAttributes, 'id' | 'created_at' | 'updated_at'> {}

class TeamMember extends Model<TeamMemberAttributes, TeamMemberCreationAttributes> implements TeamMemberAttributes {
    public id!: string;
    public id_team!: string;
    public id_usuario!: string;
    public papel!: 'lider' | 'membro';
    public status!: 'ativo' | 'inativo' | 'convidado';
    public data_entrada?: Date;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;

    // Associações
    public static associate() {
        TeamMember.belongsTo(Team, {
            foreignKey: 'id_team',
            as: 'team'
        });
        
        TeamMember.belongsTo(User, {
            foreignKey: 'id_usuario',
            as: 'usuario'
        });
    }
}

TeamMember.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        id_team: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: Team,
                key: 'id',
            },
        },
        id_usuario: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: User,
                key: 'id',
            },
        },
        papel: {
            type: DataTypes.ENUM('lider', 'membro'),
            allowNull: false,
            defaultValue: 'membro',
        },
        status: {
            type: DataTypes.ENUM('ativo', 'inativo', 'convidado'),
            allowNull: false,
            defaultValue: 'ativo',
        },
        data_entrada: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        modelName: 'TeamMember',
        tableName: 'team_members',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            {
                unique: true,
                fields: ['id_team', 'id_usuario']
            }
        ]
    }
);

export default TeamMember;