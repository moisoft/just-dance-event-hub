// backend/src/models/avatar.ts
import { Model, DataTypes } from 'sequelize';
import sequelize from '../utils/database';

export interface AvatarAttributes {
    id: string;
    nome_avatar: string;
    url_imagem: string;
    tipo_desbloqueio: 'inicial' | 'nivel' | 'conquista' | 'exclusivo';
    requisito_nivel?: number;
    requisito_conquista_id?: number;
    created_at?: Date;
    updated_at?: Date;
}

export interface AvatarCreationAttributes extends Omit<AvatarAttributes, 'id' | 'created_at' | 'updated_at'> {}

class Avatar extends Model<AvatarAttributes, AvatarCreationAttributes> implements AvatarAttributes {
    public id!: string;
    public nome_avatar!: string;
    public url_imagem!: string;
    public tipo_desbloqueio!: 'inicial' | 'nivel' | 'conquista' | 'exclusivo';
    public requisito_nivel?: number;
    public requisito_conquista_id?: number;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

Avatar.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        nome_avatar: {
            type: DataTypes.STRING(50),
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        url_imagem: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        tipo_desbloqueio: {
            type: DataTypes.ENUM('inicial', 'nivel', 'conquista', 'exclusivo'),
            allowNull: false,
        },
        requisito_nivel: {
            type: DataTypes.INTEGER,
            allowNull: true,
            validate: {
                min: 1,
            },
        },
        requisito_conquista_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'avatars',
        timestamps: true,
    }
);

export default Avatar;