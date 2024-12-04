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
      let { nom, prenom, email, posteSelect } = req.body;

      if (!nom || !prenom || !email || !posteSelect) {
          console.error('Erreur : un champ requis est manquant');
          return res.status(400).send('Tous les champs sont requis.');
      }

      //Conv en MAJ
      nom = nom.trim().toUpperCase();

      const conn = await pool.getConnection();

      // Vérifier si l'utilisateur existe déjà
      const [existingUser] = await conn.query(
          'SELECT * FROM Utilisateurs WHERE nom = ? AND prenom = ? AND email = ?',
          [nom, prenom, email]
      );

      if (existingUser) {
          conn.release();
          return res.status(409).send(`L'utilisateur ${prenom} ${nom} existe déjà.`);
      }

      // Ajouter l'utilisateur s'il n'existe pas
      const result = await conn.query(
          'INSERT INTO Utilisateurs (nom, prenom, email, poste) VALUES (?, ?, ?, ?)',
          [nom, prenom, email, posteSelect]
      );

      const resultInsertId = result.insertId;

      conn.release();

      if (resultInsertId) {
          const [nouvelUtilisateur] = await pool.query(
              'SELECT * FROM Utilisateurs WHERE id = ?', 
              [resultInsertId]
          );

          if (nouvelUtilisateur) {
              return res.json(nouvelUtilisateur);
          } else {
              return res.status(404).send('Utilisateur non trouvé après insertion.');
          }
      } else {
          return res.status(500).send('Erreur lors de l\'insertion de l\'utilisateur.');
      }
  } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'utilisateur:', error);
      return res.status(500).send('Erreur serveur');
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


//Renvoie liste utilisateurs sous forme NOM.Prenom dans page de connexion
router.get('/utilisateurs/liste', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const utilisateurs = await conn.query('SELECT id, CONCAT(UPPER(nom), ".", prenom) AS nomComplet FROM Utilisateurs');
    conn.release();
    res.json(utilisateurs);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).send('Erreur serveur');
  }
});



// Route de connexion
router.post('/connexion', async (req, res) => {
  try {
    const { utilisateurId } = req.body;
    console.log('Données reçues dans le corps :', req.body);

    if (!utilisateurId) {
      console.error("Aucun ID d'utilisateur fourni.");
      return res.status(400).json({ error: 'ID utilisateur manquant' });
    }

    const conn = await pool.getConnection();
    const [utilisateur] = await conn.query('SELECT * FROM Utilisateurs WHERE id = ?', [utilisateurId]);
    conn.release();

    if (!utilisateur) {
      console.error("Utilisateur introuvable avec l'ID :", utilisateurId);
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    console.log(`Connexion réussie pour l'utilisateur avec l'ID : ${utilisateurId}`);
    
    // Réponse JSON valide
    res.status(200).json({ 
      message: 'Connexion réussie', 
      userId: utilisateurId 
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

//Route pour l'affichage des informations utilisateurs dans le profil
router.get('/utilisateurs/:id', async (req, res) => {
  try {
      const { id } = req.params;
      const conn = await pool.getConnection();
      
      // Jointure pour récupérer le poste
      const [user] = await conn.query(`
          SELECT u.id, u.nom, u.prenom, u.email, p.poste AS poste_nom
          FROM Utilisateurs u
          LEFT JOIN Poste p ON u.poste = p.id
          WHERE u.id = ?
      `, [id]);

      conn.release();

      if (!user) {
          return res.status(404).send('Utilisateur non trouvé.');
      }

      res.json(user);
  } catch (error) {
      console.error('Erreur lors de la récupération des données utilisateur :', error);
      res.status(500).send('Erreur serveur.');
  }
});


//Route d'affichage tableau Page de donnees V2
router.get('/automates', async (req, res) => {
  try {
      const conn = await pool.getConnection();
      const data = await conn.query('SELECT *, DATE_FORMAT(date_heure_paris, "%Y-%m-%d %H:%i:%s") AS formatted_date FROM Automates');
      conn.release();
      res.json(data);
  } catch (error) {
      console.error('Erreur lors de la récupération des automates:', error);
      res.status(500).send('Erreur serveur');
  }
});

//Trouver ligne spécifique automate
router.get('/automates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const conn = await pool.getConnection();
    const [row] = await conn.query('SELECT * FROM Automates WHERE ID_tableau = ?', [id]);
    conn.release();
    res.json(row);
  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error);
    res.status(500).send('Erreur serveur');
  }
});


//AJout de ligne dans tableau Page de donnees V2
router.post('/automates', async (req, res) => {
  try {
    const newData = req.body;
    const conn = await pool.getConnection();
    await conn.query(
      'INSERT INTO Automates (nom_machine, nom_automate, ip_automate, port_connexion, bibliotheque, numero_registre, taille_registre, type_donnees) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        newData.nom_machine,
        newData.nom_automate,
        newData.ip_automate,
        newData.port_connexion,
        newData.bibliotheque,
        newData.numero_registre,
        newData.taille_registre,
        newData.type_donnees,
      ]
    );
    conn.release();
    //res.sendStatus(201);
    res.status(201).json({ message: "Row added successfully" });
  } catch (error) {
    console.error('Erreur lors de l\'ajout des données:', error);
    res.status(500).send('Erreur serveur');
  }
});

//Modification d'une ligne Page de donnees V2 (BDD puis import sur la page)
router.put('/automates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    const conn = await pool.getConnection();
    await conn.query(
      'UPDATE Automates SET nom_machine = ?, nom_automate = ?, ip_automate = ?, port_connexion = ?, bibliotheque = ?, numero_registre = ?, taille_registre = ?, type_donnees = ? WHERE ID_tableau = ?',
      [
        updatedData.nom_machine,
        updatedData.nom_automate,
        updatedData.ip_automate,
        updatedData.port_connexion,
        updatedData.bibliotheque,
        updatedData.numero_registre,
        updatedData.taille_registre,
        updatedData.type_donnees,
        id,
      ]
    );
    conn.release();
    res.status(201).json({ message: "Row added successfully" });
    //res.sendStatus(200);
  } catch (error) {
    console.error('Erreur lors de la mise à jour des données:', error);
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