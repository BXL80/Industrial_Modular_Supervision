const mariadb = require('mariadb');
require('dotenv').config();

const pool = mariadb.createPool({
  host: process.env.DB_HOST,  //db
  user: process.env.DB_USER,  //root
  password: process.env.DB_PASSWORD,  //root
  database: process.env.DB_NAME,  //|| 'hackaton'
  connectionLimit: 5 // Limitez le nombre de connexions simultanées
});

module.exports = pool;