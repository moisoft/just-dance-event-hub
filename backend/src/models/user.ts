import { Model, DataTypes } from 'sequelize';
import sequelize from '../utils/database';
import { testSequelize } from '../utils/database.test';
import bcrypt from 'bcrypt';

export interface UserAttributes {
    id: string;
    nickname: string;
    email: string;
    senha_hash: string;
    papel: 'jogador' | 'staff' | 'organizador' | 'admin';
    xp: number;
    nivel: number;
    avatar_ativo_url?: string;
    created_at?: Date;
    updated_at?: Date;
    is_super_admin: boolean;
}

export interface UserCreationAttributes extends Omit<UserAttributes, 'id' | 'senha_hash' | 'xp' | 'nivel' | 'created_at' | 'updated_at' | 'is_super_admin'> {
    password?: string;
}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public id!: string;
    public nickname!: string;
    public email!: string;
    public senha_hash!: string;
    public password?: string;
    public papel!: 'jogador' | 'staff' | 'organizador' | 'admin';
    public xp!: number;
    public nivel!: number;
    public avatar_ativo_url?: string;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
    public is_super_admin!: boolean;

    // Método para verificar senha
    public async comparePassword(candidatePassword: string): Promise<boolean> {
        return bcrypt.compare(candidatePassword, this.senha_hash);
    }

    // Método para hash da senha
    public static async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 10);
    }
}

// Usar banco de teste se estiver em modo de teste
const db = process.env['NODE_ENV'] === 'test' ? testSequelize : sequelize;

User.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        nickname: {
            type: DataTypes.STRING(30),
            allowNull: false,
            unique: true,
            validate: {
                len: [3, 30],
                notEmpty: true,
            },
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
                notEmpty: true,
            },
        },
        senha_hash: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        password: {
            type: DataTypes.VIRTUAL,
            allowNull: true,
        },
        papel: {
            type: DataTypes.ENUM('jogador', 'staff', 'organizador', 'admin'),
            allowNull: false,
            defaultValue: 'jogador',
        },
        xp: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            validate: {
                min: 0,
            },
        },
        nivel: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            validate: {
                min: 1,
            },
        },
        avatar_ativo_url: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        is_super_admin: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    },
    {
        sequelize: db,
        tableName: 'users',
        timestamps: true,
        hooks: {
            beforeCreate: async (user: any) => {
                if (user.password) {
                    user.senha_hash = await User.hashPassword(user.password);
                    delete user.password;
                }
            },
            beforeUpdate: async (user: any) => {
                if (user.changed('password')) {
                    user.senha_hash = await User.hashPassword(user.password);
                    delete user.password;
                }
            },
        },
    }
);

export default User;