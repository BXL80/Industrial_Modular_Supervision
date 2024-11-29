const express = require('express');
const path = require('path');
const router = express.Router();
const pool = require('./db');

const { connectToPLC } = require('./plc');
const { updateConfig, getLastValue } = require('./cron');

//const { ExportToCsv } = require('export-to-csv');
const exportData = async (req, res) => {
  const { ExportToCsv } = await import('export-to-csv');

  const csvExporter = new ExportToCsv({ filename: 'data.csv' });
  const csvData = csvExporter.generateCsv(rows, true);

  res.setHeader('Content-disposition', 'attachment; filename=data.csv');
  res.setHeader('Content-Type', 'text/csv');
  res.send(csvData);
};


//Ajout des pages accéssible via URL
// Route pour la page principale (index)
router.get('/index', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Route pour la page des graphiques
router.get('/graphique', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/Graphique de données.html'));
});

// Route pour la page des données
router.get('/donnees', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/Page de données.html'));
});

// Route pour la page de paramétrage 1
router.get('/parametrage1', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/Page de paramétrage 1.html'));
});

// Route pour la page de paramétrage 2 (automates)
router.get('/parametrage2', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/Page de paramétrage 2 (automates).html'));
});

// Route pour la page profil
router.get('/profil', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/Page profil.html'));
});


// Tester la connexion au PLC
router.get('/test-plc', async (req, res) => {
  const ModbusRTU = require("modbus-serial");
  const client = new ModbusRTU();//DFF
  console.log("Dans la route /test-plc");  
  // open connection to a tcp line API 2.4Ghz ou 5Ghz Happywifi
  client.connectTCP("172.16.1.24", { port: 502 }); //IP Z4 et port 502 OK
  client.setID(1); // Remplacez l'ID par celui de votre automate si nécessaire
  console.log("Connexion à Z4");  
  try {
    const dataZ4Coils = await client.readCoils(514, 1);  //readCoils 514,1 = premier AU
    console.log("Z4 coils values:", dataZ4Coils.data);  
  } catch (err) {
    console.error("Error reading :", err.message);
  }
});

// Exporter les données en CSV
router.get('/export-data', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const rows = await conn.query('SELECT * FROM plc_data');
    conn.release();

    const csvExporter = new ExportToCsv({ filename: 'plc_data.csv' });
    const csvData = csvExporter.generateCsv(rows, true);

    res.setHeader('Content-disposition', 'attachment; filename=plc_data.csv');
    res.setHeader('Content-Type', 'text/csv');
    res.send(csvData);
  } catch (err) {
    res.status(500).send(`Erreur lors de l'exportation: ${err.message}`);
  }
});


// Route pour obtenir la dernière valeur lue
router.get('/api/last-value', (req, res) => {
  const value = getLastValue();
  if (value !== null) {
    res.json({ value });
  } else {
    res.status(404).json({ error: 'Aucune donnée disponible.' });
  }
});





const ModbusRTU = require('modbus-serial');

router.get('/api/modbus-read', async (req, res) => {
  //const { ip, register, size} = req.body;
  ip = "172.16.1.24";
  register = 514;
  size = 1;

  const client = new ModbusRTU();

  try {
    // Connexion à l'automate
    await client.connectTCP(ip, { port: 502 });
    client.setID(1);

    let data;

    const dataZ4Coils = await client.readCoils(514, 1);  //readCoils 514,1 = premier AU
    console.log("Z4 coils values:", dataZ4Coils.data);

    // Envoyer la réponse au client
    res.json({
      success: true,
      data: data.data,
      message: `Données lues avec succès à partir de l'adresse ${register}.`,
    });

    // Fermeture de la connexion
    client.close();
  } catch (err) {
    console.error('Erreur Modbus :', err.message);
    res.status(500).json({ error: `Erreur lors de la lecture : ${err.message}` });
  }
});







router.post('/api/read-register', async (req, res) => {
  const { ip, protocol, register, size, type } = req.body;

  console.log('testtt')

  res.send('test')

  try {
      if (protocol === 'ModbusTCP') {
          const client = new ModbusRTU();
          await client.connectTCP(ip, { port: 502 });
          client.setID(1);

          let data;
          if (type === 'HoldingRegister') {
              data = await client.readHoldingRegisters(parseInt(register), parseInt(size));
              res.send(data)
          } else if (type === 'Coils') {
              data = await client.readCoils(parseInt(register), parseInt(size));
          }

          client.close();
          res.json({ value: data.data });
      } else if (protocol === 'Node7') {
          const s7Client = new nodes7();
          s7Client.initiateConnection({ port: 102, host: ip, rack: 0, slot: 1 }, (err) => {
              if (err) {
                  return res.status(500).json({ error: `Erreur Node7 : ${err.message}` });
              }

              s7Client.readAllItems((err, values) => {
                  if (err) {
                      return res.status(500).json({ error: `Erreur de lecture : ${err.message}` });
                  }
                  res.json({ value: values });
                  s7Client.dropConnection();
              });
          });
      } else {
          res.status(400).json({ error: 'Protocole non pris en charge' });
      }
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});


// Route pour mettre à jour la configuration du cron
router.post('/api/configure-plc', (req, res) => {
  const config = req.body;
  if (!config.ip || !config.protocol || !config.register || !config.size || !config.type) {
    return res.status(400).json({ error: "Paramètres incomplets." });
  }
  updateConfig(config);
  res.json({ message: "Configuration mise à jour avec succès." });
});

module.exports = router;