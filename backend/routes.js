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


router.get('/test-database', async (req, res) => {
  let conn;
  try {
    // Testez ici la connexion à votre base de données
    res.json({ success: true, message: 'Base de données connectée' });
  } catch (err) {
    console.error("Erreur de connexion à la base de données :", err.message);
    res.status(500).json({ error: `Erreur : ${err.message}` });
  } finally {
    if (conn) conn.release(); // Libérez la connexion
  }
});

// Exemple de route frontend
router.get('/test-frontend', (req, res) => {
  res.json({ success: true, message: 'Frontend accessible' });
});

// Ajout de la route /ping pour backend
router.get('/ping', (req, res) => {
  try {
    res.json({ success: true, message: 'Backend opérationnel' });
  } catch (err) {
    res.status(500).json({ error: `Erreur : ${err.message}` });
  }
});


// Tester la connexion au PLC
router.get('/test-plc', async (req, res) => {
  const client = new ModbusRTU();

  try {
    console.log("Dans la route /test-plc");
    console.log("Connexion à Z4");

    // Connexion au PLC
    await client.connectTCP("172.16.1.24", { port: 502 });
    client.setID(1);

    // Lecture des données
    const data = await client.readCoils(514, 1);
    console.log("Z4 coils values:", data.data);

    // Envoi de la réponse au client
    res.json({ success: true, data: data.data });

    // Fermeture de la connexion
    client.close();
  } catch (err) {
    console.error("Erreur de connexion ou de lecture :", err.message);

    // Répondre avec un message d'erreur
    res.status(500).json({ success: false, error: `Erreur : ${err.message}` });
  } finally {
    // Assurez-vous de fermer la connexion, même en cas d'erreur
    if (client.isOpen) client.close();
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

    const dataZ4Coils = await client.readCoils(514, 1);  //readCoils 514,1 = premier AU
    console.log("Z4 coils values:", dataZ4Coils.data);

    // Envoyer la réponse au client
    res.json({
      success: true,
      data: dataZ4Coils.data,
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


router.get('/utilisateurs', async (req, res) => {
  try {
      const conn = await pool.getConnection();
      const rows = await conn.query('SELECT * FROM Utilisateurs');
      conn.release();
      res.json(rows);
  } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      res.status(500).send('Erreur serveur');
  }
});

//Route pour ajouter un nouvel utilisateur (POST /utilisateurs)
router.post('/utilisateurs', async (req, res) => {
  try {
      const { nom, prenom, email, posteSelect } = req.body;

      if (!nom || !prenom || !email ||! posteSelect) {
          console.error('Erreur pas de nom ou prenom');
          return res.status(400).send('Nom et prénom sont requis');
      }

      const conn = await pool.getConnection();

      // Insertion de l'utilisateur dans la base de données
      const result = await conn.query('INSERT INTO Utilisateurs (nom, prenom, email, posteSelect) VALUES (?, ?, ?, ?)', [nom, prenom, email, posteSelect]);
      
      // Récupération du nouvel utilisateur ajouté
      const [NouvelUtilisateur] = await conn.query('SELECT * FROM Utilisateurs WHERE id = ?', [result.insertId]);

      // Si l'utilisateur est trouvé
      if (NouvelUtilisateur) {
          // Conversion de BigInt en Number pour l'ID
          NouvelUtilisateur.id = Number(NouvelUtilisateur.id);

          conn.release();

          // Renvoyer l'utilisateur ajouté
          res.json(NouvelUtilisateur);
      } else {
          conn.release();
          res.status(404).send('Utilisateur non trouvé après insertion.');
      }
  } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'utilisateur:', error);
      res.status(500).send('Erreur serveur');
  }
});

router.get('/postes', async (req, res) => {
  console.log("router poste");
  try {
    const conn = await pool.getConnection();
    const postes = await conn.query('SELECT id, poste FROM Poste');
    conn.release();
    res.json(postes);
  } catch (error) {
    console.error('Erreur lors de la récupération des postes:', error);
    res.status(500).send('Erreur serveur');
  }
});


//Renvoie liste utilisateurs dans page de connexion
router.get('/utilisateurs/liste', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const utilisateurs = await conn.query('SELECT id, nom, prenom FROM Utilisateurs');
    conn.release();
    res.json(utilisateurs);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).send('Erreur serveur');
  }
});

//Route de connexion
router.post('/connexion', async (req, res) => {
  try {
    const { utilisateurId } = req.body;

    const conn = await pool.getConnection();
    const [utilisateur] = await conn.query('SELECT * FROM Utilisateurs WHERE id = ?', [utilisateurId]);
    conn.release();

    if (!utilisateur) {
      return res.status(404).send('Utilisateur non trouvé');
    }

    // Simulez une session utilisateur ici (exemple avec JWT ou session)
    req.session.user = { id: utilisateur.id, nom: utilisateur.nom, prenom: utilisateur.prenom };

    res.status(200).send('Connexion réussie');
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).send('Erreur serveur');
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