const cron = require('node-cron');
const ModbusRTU = require("modbus-serial");
const pool = require('./db');

// Initialisation du client Modbus
const client = new ModbusRTU();
//Initialisation du client Node7
const s7Client = new nodes7();

module.exports = () => {
  client.connectTCP("172.16.1.24", { port: 502 })
    .then(() => {
      client.setID(1); // Définissez l'ID Modbus de l'automate (par défaut, 1)
      console.log("Connecté à l'automate via Modbus TCP/IP à 172.16.1.24 sur le port 502");

      // Planifiez la tâche cron pour s'exécuter toutes les 2 secondes
      cron.schedule("*/2 * * * * *", async () => {
        console.log("Lecture des données Modbus...");
        try {
          // Lecture des coils ou registres de l'automate
          const data = await client.readCoils(514, 1); //Lire état AU à l'adresse 514
          console.log("Valeur lue :", data.data);

          //Ajout dans BDD
          /*
          try {
            const conn = await pool.getConnection();
            await conn.query('INSERT INTO plc_data (value) VALUES (?)', [data.data[0]]);
            conn.release();
            console.log("Données insérées dans la BDD :", data.data[0]);
            } catch (dbErr) {
              console.error("Erreur lors de l'insertion en BDD :", dbErr.message);
            }
          */
          //await pool.query('INSERT INTO plc_data (value) VALUES (?)', [data.data[0]]);
          // await saveToDatabase(data.data);

        //Si erreur lecture données
        } catch (err) {
          console.error("Erreur lors de la lecture :", err.message);
        }
      });
    })
    .catch((err) => {
      console.error("Erreur de connexion Modbus :", err.message);
    });
    //Fermeture de l'application en se déconnectant de l'automate
    process.on('SIGINT', async () => {
      console.log("Fermeture de la connexion Modbus...");
      await client.close();
      process.exit();
    });
    //Ajouter ici S7
  };
