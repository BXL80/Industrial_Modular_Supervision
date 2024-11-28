const cron = require('node-cron');
const pool = require('./db');

module.exports = () => {
  cron.schedule('*/10 * * * * *', async () => {
    console.log('Lecture périodique du PLC...');
    // Simule une valeur lue
    const randomValue = Math.random() * 100;

    try {
      const conn = await pool.getConnection();
      await conn.query('INSERT INTO plc_data (value) VALUES (?)', [randomValue]);
      conn.release();
      console.log('Données insérées:', randomValue);
    } catch (err) {
      console.error('Erreur lors de l\'insertion dans la BDD:', err.message);
    }
  });
};
