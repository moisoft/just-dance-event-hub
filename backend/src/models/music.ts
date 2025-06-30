// backend/src/models/music.ts
import { Model, DataTypes } from 'sequelize';
import sequelize from '../utils/database';
import { testSequelize } from '../utils/database.test';

export interface MusicAttributes {
    id: string;
    titulo: string;
    artista: string;
    duracao: number;
    dificuldade: 'facil' | 'medio' | 'dificil';
    ano: number;
    genero: string;
    url_thumbnail?: string;
    aprovada: boolean;
    created_at?: Date;
    updated_at?: Date;
}

export interface MusicCreationAttributes extends Omit<MusicAttributes, 'id' | 'aprovada' | 'created_at' | 'updated_at'> {}

class Music extends Model<MusicAttributes, MusicCreationAttributes> implements MusicAttributes {
    public id!: string;
    public titulo!: string;
    public artista!: string;
    public duracao!: number;
    public dificuldade!: 'facil' | 'medio' | 'dificil';
    public ano!: number;
    public genero!: string;
    public url_thumbnail?: string;
    public aprovada!: boolean;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

// Usar banco de teste se estiver em modo de teste
const db = (process.env['NODE_ENV'] === 'test' && testSequelize) ? testSequelize : sequelize;

Music.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        titulo: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        artista: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        duracao: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
            },
        },
        dificuldade: {
            type: DataTypes.ENUM('facil', 'medio', 'dificil'),
            allowNull: false,
        },
        ano: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1900,
                max: new Date().getFullYear(),
            },
        },
        genero: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        url_thumbnail: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        aprovada: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    },
    {
        sequelize: db,
        tableName: 'musics',
        timestamps: true,
    }
);

export default Music;