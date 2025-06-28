// Script para buscar músicas do Just Dance Wiki e inserir no banco de dados
const axios = require('axios');
const cheerio = require('cheerio');
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config({ path: '../backend/.env' });

// Configuração do Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
  }
);

const Music = sequelize.define('Music', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  titulo: DataTypes.STRING,
  artista: DataTypes.STRING,
  duracao: DataTypes.INTEGER,
  dificuldade: DataTypes.STRING,
  ano: DataTypes.INTEGER,
  genero: DataTypes.STRING,
  url_thumbnail: DataTypes.STRING,
  aprovada: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'musics',
  timestamps: true,
});

async function fetchMusics() {
  const url = 'https://justdance.fandom.com/wiki/Category:Songs';
  console.log('Buscando músicas do Just Dance Wiki...');
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);
  const musics = [];

  // Pega os links das músicas na página de categoria
  $('div.category-page__members ul li.category-page__member a').each((_, el) => {
    const link = 'https://justdance.fandom.com' + $(el).attr('href');
    const titulo = $(el).text().trim();
    musics.push({ titulo, link });
  });

  // Para cada música, busca detalhes
  for (const music of musics.slice(0, 30)) { // Limite para teste rápido
    try {
      const res = await axios.get(music.link);
      const $$ = cheerio.load(res.data);
      // Exemplo de extração (ajuste conforme a estrutura real da página)
      const artista = $$("th:contains('Artist')").next('td').text().trim() || 'Desconhecido';
      const ano = parseInt($$("th:contains('Year')").next('td').text().trim()) || 0;
      const dificuldade = $$("th:contains('Difficulty')").next('td').text().trim().toLowerCase() || 'facil';
      const genero = $$("th:contains('Genre')").next('td').text().trim() || 'Pop';
      const url_thumbnail = $$('.pi-image-thumbnail').attr('src') || null;
      // Duração não disponível, usar 180s como padrão
      const duracao = 180;
      await Music.findOrCreate({
        where: { titulo: music.titulo, artista },
        defaults: {
          titulo: music.titulo,
          artista,
          duracao,
          dificuldade,
          ano,
          genero,
          url_thumbnail,
          aprovada: false,
        },
      });
      console.log(`Música inserida: ${music.titulo} - ${artista}`);
    } catch (err) {
      console.error('Erro ao buscar detalhes da música:', music.titulo, err.message);
    }
  }
}

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Conectado ao banco de dados!');
    await fetchMusics();
    await sequelize.close();
    console.log('Finalizado!');
  } catch (err) {
    console.error('Erro geral:', err);
    process.exit(1);
  }
})(); 