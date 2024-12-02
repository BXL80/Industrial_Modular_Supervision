const mariadb = require('mariadb');
require('dotenv').config();

const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 5 // Limitez le nombre de connexions simultanées
});

pool.getConnection()
    .then(conn => {
        console.log('Connexion à MariaDB réussie');
        conn.release();
    })
    .catch(err => {
        console.error('Erreur de connexion à MariaDB:', err);
    });


module.exports = pool;