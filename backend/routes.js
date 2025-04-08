const express = require('express');
const path = require('path');
const router = express.Router();
const pool = require('./db');
const ModbusRTU = require("modbus-serial");
const nodes7 = require("nodes7");

const { connectToPLC } = require('./plc');
const { updateConfig, getLastValue } = require('./cron');

//Route de test BDD
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

//Route de test frontend
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


// Route pour obtenir la dernière valeur lue
router.get('/api/last-value', (req, res) => {
  const value = getLastValue();
  if (value !== null) {
    res.json({ value });
  } else {
    res.status(404).json({ error: 'Aucune donnée disponible.' });
  }
});

//Test de lecture avec automates
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
    //await conn.query(
    // Insert into Automates
    const result = await conn.query(
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

    // Retrieve the ID of the newly inserted row
    const newID = result.insertId;

    //Je dois ajouter une ligne dans ma table Reglage correspondant à ma ligne de table Automates
    await conn.query(
      `INSERT INTO Reglage (ID_tableau, valeur_attendue, valeur_min, valeur_max) 
      VALUES (?, NULL, NULL, NULL)`,
      [newID]
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

//Ajouter une ligne au réglage, utile uniquement pour du debug
router.post('/reglages', async (req, res) => {
  try {
      const { ID_tableau, valeur_attendue, valeur_min, valeur_max } = req.body;
      const conn = await pool.getConnection();
      await conn.query(`
          INSERT INTO Reglage (ID_tableau, valeur_attendue, valeur_min, valeur_max)
          VALUES (?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE 
              valeur_attendue = VALUES(valeur_attendue),
              valeur_min = VALUES(valeur_min),
              valeur_max = VALUES(valeur_max)
      `, [ID_tableau, valeur_attendue, valeur_min, valeur_max]);
      conn.release();
      res.json({ message: 'Réglage sauvegardé avec succès' });
  } catch (error) {
      console.error('Erreur lors de la sauvegarde des réglages :', error);
      res.status(500).send('Erreur serveur');
  }
});

router.get('/automates-reglages', async (req, res) => {
  try {
      const conn = await pool.getConnection();
      const data = await conn.query(`
          SELECT a.ID_tableau, a.nom_machine, a.type_donnees, 
                 r.valeur_attendue, r.valeur_min, r.valeur_max,
                 r.valeur_min_tres_bas, r.valeur_max_tres_haut
          FROM Automates a
          LEFT JOIN Reglage r ON a.ID_tableau = r.ID_tableau
      `);
      conn.release();
      res.json(data);
  } catch (error) {
      console.error('Erreur lors de la récupération des réglages :', error);
      res.status(500).send('Erreur serveur');
  }
});

/*
router.get('/automates-reglages', async (req, res) => {
  try {
      const conn = await pool.getConnection();
      const data = await conn.query(`
          SELECT a.ID_tableau, a.nom_machine, a.type_donnees, 
                 r.valeur_attendue, r.valeur_min, r.valeur_max
          FROM Automates a
          LEFT JOIN Reglage r ON a.ID_tableau = r.ID_tableau
      `);
      conn.release();
      res.json(data);
  } catch (error) {
      console.error('Erreur lors de la récupération des réglages :', error);
      res.status(500).send('Erreur serveur');
  }
});
*/

router.get('/defauts', async (req, res) => {
  try {
      const conn = await pool.getConnection();
      const defauts = await conn.query(`
          SELECT 
              a.nom_machine, 
              a.nom_automate, 
              a.type_donnees, 
              CASE 
                  WHEN a.type_donnees = 'readCoils' THEN r.valeur_attendue 
                  ELSE CONCAT(r.valeur_min, ' - ', r.valeur_max) 
              END AS valeur_attendue,
              a.etat_bit,
              a.cycle_auto,
              DATE_FORMAT(a.date_heure_paris, '%Y-%m-%d') AS date,
              DATE_FORMAT(a.date_heure_paris, '%H:%i:%s') AS time
          FROM Automates a
          JOIN Reglage r ON a.ID_tableau = r.ID_tableau
          WHERE 
              (a.type_donnees = 'readCoils' AND a.etat_bit != r.valeur_attendue)
              OR 
              (a.type_donnees = 'readHoldingRegisters' AND (a.etat_bit < r.valeur_min OR a.etat_bit > r.valeur_max))
      `);
      conn.release();
      res.json(defauts);
  } catch (error) {
      console.error('Erreur lors de la récupération des défauts :', error);
      res.status(500).send('Erreur serveur');
  }
});

//Route de mise a jour de la colonne etat_bit en fonction de l'automate
// Route de mise à jour de la colonne etat_bit en fonction de l'automate,
// et mise à jour de cycle_auto basée sur le mot lu à l'adresse 250 (0 par défaut)
// Route de mise à jour : insertion d'une nouvelle lecture dans HistoriqueAutomates
/* OK
router.post("/update-automates", async (req, res) => {
  try {
    const conn = await pool.getConnection();
    // Récupérer tous les automates
    const automates = await conn.query("SELECT * FROM Automates");
    const client = new ModbusRTU();
    const s7Client = new nodes7();

    // Pour chaque automate, insérer une nouvelle lecture dans HistoriqueAutomates
    for (const automate of automates) {
      let etat_bit = null;
      try {
        if (automate.bibliotheque === "Modbus-Serial") {
          await client.connectTCP(automate.ip_automate, { port: automate.port_connexion });
          client.setID(1);
          if (automate.type_donnees === "readCoils") {
            const data = await client.readCoils(automate.numero_registre, automate.taille_registre);
            etat_bit = data.data[0];
          } else if (automate.type_donnees === "readHoldingRegisters") {
            const data = await client.readHoldingRegisters(automate.numero_registre, automate.taille_registre);
            etat_bit = (automate.nom_machine === "Temperature") ? data.data[0] / 10 : data.data[0];
          }
          client.close();
        } else if (automate.bibliotheque === "Node7") {
          await new Promise((resolve, reject) => {
            s7Client.initiateConnection(
              { port: 102, host: automate.ip_automate, rack: 0, slot: 1 },
              (err) => {
                if (err) return reject(err);
                s7Client.readAllItems((err, values) => {
                  if (err) return reject(err);
                  etat_bit = values.someValue; // Remplacer par la clé appropriée
                  s7Client.dropConnection();
                  resolve();
                });
              }
            );
          });
        }
        if (etat_bit !== null) {
          await conn.query(
            `INSERT INTO HistoriqueAutomates (
               ID_tableau, nom_machine, nom_automate, ip_automate, port_connexion, bibliotheque,
               numero_registre, taille_registre, type_donnees, etat_bit, date_heure_paris
             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
              automate.ID_tableau,
              automate.nom_machine,
              automate.nom_automate,
              automate.ip_automate,
              automate.port_connexion,
              automate.bibliotheque,
              automate.numero_registre,
              automate.taille_registre,
              automate.type_donnees,
              etat_bit
            ]
          );
          console.log(`Historique inséré pour automate ID ${automate.ID_tableau} avec etat_bit: ${etat_bit}`);
        }
      } catch (err) {
        console.error(`Erreur pour automate ID ${automate.ID_tableau}:`, err.message);
      }
    }

    // Mise à jour de cycle_auto (lecture du registre 250)
    let cycle_auto = 0;
    try {
      const cycleClient = new ModbusRTU();
      await cycleClient.connectTCP("172.16.1.24", { port: 502 });
      cycleClient.setID(1);
      const cycleData = await cycleClient.readHoldingRegisters(250, 1);
      cycle_auto = (cycleData.data[0] === 1) ? 1 : 0;
      cycleClient.close();
      console.log(`Cycle_auto = ${cycle_auto}`);
    } catch (err) {
      console.error("Erreur lecture cycle_auto:", err.message);
      cycle_auto = 0;
    }

    conn.release();
    res.status(200).json({ message: "Automates mis à jour avec succès", cycle_auto });
  } catch (error) {
    console.error("Erreur dans update-automates:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
*/
//Essai defauts
router.post("/update-automates", async (req, res) => {
  try {
    const conn = await pool.getConnection();
    // Récupérer tous les automates
    const automates = await conn.query("SELECT * FROM Automates");
    const client = new ModbusRTU();
    const s7Client = new nodes7();

    // Pour chaque automate, insérer une nouvelle lecture dans HistoriqueAutomates
    for (const automate of automates) {
      let etat_bit = null;
      try {
        if (automate.bibliotheque === "Modbus-Serial") {
          await client.connectTCP(automate.ip_automate, { port: automate.port_connexion });
          client.setID(1);
          if (automate.type_donnees === "readCoils") {
            const data = await client.readCoils(automate.numero_registre, automate.taille_registre);
            etat_bit = data.data[0];
          } else if (automate.type_donnees === "readHoldingRegisters") {
            const data = await client.readHoldingRegisters(automate.numero_registre, automate.taille_registre);
            etat_bit = (automate.nom_machine === "Temperature") ? data.data[0] / 10 : data.data[0];
          }
          client.close();
        } else if (automate.bibliotheque === "Node7") {
          await new Promise((resolve, reject) => {
            s7Client.initiateConnection(
              { port: 102, host: automate.ip_automate, rack: 0, slot: 1 },
              (err) => {
                if (err) return reject(err);
                s7Client.readAllItems((err, values) => {
                  if (err) return reject(err);
                  etat_bit = values.someValue; // Remplacer par la clé appropriée
                  s7Client.dropConnection();
                  resolve();
                });
              }
            );
          });
        }
        if (etat_bit !== null) {
          await conn.query(
            `INSERT INTO HistoriqueAutomates (
               ID_tableau, nom_machine, nom_automate, ip_automate, port_connexion, bibliotheque,
               numero_registre, taille_registre, type_donnees, etat_bit, date_heure_paris
             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
              automate.ID_tableau,
              automate.nom_machine,
              automate.nom_automate,
              automate.ip_automate,
              automate.port_connexion,
              automate.bibliotheque,
              automate.numero_registre,
              automate.taille_registre,
              automate.type_donnees,
              etat_bit
            ]
          );
          console.log(`Historique inséré pour automate ID ${automate.ID_tableau} avec etat_bit: ${etat_bit}`);

          // Pour les automates de type readHoldingRegisters, vérifier si la valeur est hors seuil
          if (automate.type_donnees === 'readHoldingRegisters') {
            // Récupérer le réglage associé à cet automate
            const reglResults = await conn.query('SELECT * FROM Reglage WHERE ID_tableau = ?', [automate.ID_tableau]);
            if (reglResults && reglResults.length > 0) {
              const regl = reglResults[0];
              console.log(`Pour automate ID ${automate.ID_tableau} - seuil min: ${regl.valeur_min}, seuil max: ${regl.valeur_max}, seuil absolu min: ${regl.valeur_min_tres_bas}, seuil absolu max: ${regl.valeur_max_tres_haut}, valeur lue: ${etat_bit}`);

              let alarmType = "";
              // Vérification de l'extrême valeur en dessous du seuil absolu
              if (etat_bit < regl.valeur_min_tres_bas) {
                alarmType = "Limite absolue min";
                console.log(`>>> Limite absolue min détectée pour automate ID ${automate.ID_tableau}: etat_bit (${etat_bit}) inférieur à valeur_min_tres_bas (${regl.valeur_min_tres_bas})`);
              }
              // Vérification pour "Sous seuil min"
              else if (etat_bit < regl.valeur_min) {
                alarmType = "Sous seuil min";
                console.log(`>>> Sous seuil min détecté pour automate ID ${automate.ID_tableau}: etat_bit (${etat_bit}) inférieur à valeur_min (${regl.valeur_min})`);
              }
              // Vérification de l'extrême valeur au-dessus du seuil absolu
              else if (etat_bit > regl.valeur_max_tres_haut) {
                alarmType = "Limite absolue max";
                console.log(`>>> Limite absolue max détectée pour automate ID ${automate.ID_tableau}: etat_bit (${etat_bit}) supérieur à valeur_max_tres_haut (${regl.valeur_max_tres_haut})`);
              }
              // Vérification pour "Plus que seuil max"
              else if (etat_bit > regl.valeur_max) {
                alarmType = "Plus que seuil max";
                console.log(`>>> Plus que seuil max détecté pour automate ID ${automate.ID_tableau}: etat_bit (${etat_bit}) supérieur à valeur_max (${regl.valeur_max})`);
              }
              
              // Si un défaut est détecté (alarmType non vide), enregistrer l'alarme
              if (alarmType !== "") {
                await conn.query(
                  `INSERT INTO Alarmes (type_alarme, niveau, temperature, date_heure_alarmes)
                   VALUES (?, ?, ?, NOW())`,
                  [ alarmType, "Critique", etat_bit ]
                );
                console.log(`Alarme enregistrée pour automate ID ${automate.ID_tableau} avec type: ${alarmType}`);
              } else {
                console.log(`Pas de défaut pour automate ID ${automate.ID_tableau} : etat_bit (${etat_bit}) est dans l'intervalle normal.`);
              }
            } else {
              console.log(`Aucun réglage trouvé pour automate ID ${automate.ID_tableau}`);
            }
          }
        }
      } catch (err) {
        console.error(`Erreur pour automate ID ${automate.ID_tableau}:`, err.message);
      }
    } // Fin du for de chaque automate

    // Mise à jour de cycle_auto (lecture du registre 250)
    let cycle_auto = 0;
    try {
      const cycleClient = new ModbusRTU();
      await cycleClient.connectTCP("172.16.1.24", { port: 502 });
      cycleClient.setID(1);
      const cycleData = await cycleClient.readHoldingRegisters(250, 1);
      cycle_auto = (cycleData.data[0] === 1) ? 1 : 0;
      cycleClient.close();
      console.log(`Cycle_auto = ${cycle_auto}`);
    } catch (err) {
      console.error("Erreur lecture cycle_auto:", err.message);
      cycle_auto = 0;
    }

    conn.release();
    res.status(200).json({ message: "Automates mis à jour avec succès", cycle_auto });
  } catch (error) {
    console.error("Erreur dans update-automates:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get('/historique-alarmes', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const alarmes = await conn.query(`
      SELECT *, DATE_FORMAT(date_heure_alarmes, "%Y-%m-%d") AS date,
                 DATE_FORMAT(date_heure_alarmes, "%H:%i:%s") AS time
      FROM Alarmes
      ORDER BY date_heure_alarmes DESC
    `);
    conn.release();
    res.json(alarmes);
  } catch (error) {
    console.error("Erreur lors de la récupération des alarmes :", error.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});


//Affichage dans le tableau
router.get('/historique-automates', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const historique = await conn.query(`
      SELECT *, DATE_FORMAT(date_enregistrement, "%Y-%m-%d %H:%i:%s") AS formatted_date
      FROM HistoriqueAutomates
      ORDER BY date_enregistrement DESC
    `);
    conn.release();
    res.json(historique);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'historique :", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.get("/automates-latest", async (req, res) => {
  try {
    const conn = await pool.getConnection();
    // On récupère pour chaque ID_tableau la dernière lecture enregistrée dans HistoriqueAutomates
    const latestData = await conn.query(`
      SELECT h.*, DATE_FORMAT(h.date_enregistrement, "%Y-%m-%d %H:%i:%s") AS formatted_date
      FROM HistoriqueAutomates h
      INNER JOIN (
        SELECT ID_tableau, MAX(date_enregistrement) AS latest_date
        FROM HistoriqueAutomates
        GROUP BY ID_tableau
      ) l ON h.ID_tableau = l.ID_tableau AND h.date_enregistrement = l.latest_date
      ORDER BY h.date_enregistrement DESC
    `);
    conn.release();
    res.json(latestData);
  } catch (error) {
    console.error("Error in automates-latest route:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
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

//Inclusion de l'intervalle
router.get('/config', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [config] = await conn.query('SELECT update_interval FROM Config LIMIT 1');
    conn.release();
    res.json(config);
  } catch (error) {
    console.error('Error fetching config:', error);
    res.status(500).send('Error fetching config');
  }
});

router.put('/reglages/:ID_tableau', async (req, res) => {
  const { ID_tableau } = req.params;
  const { valeur_attendue, valeur_min, valeur_max, valeur_min_tres_bas, valeur_max_tres_haut } = req.body;

  try {
    // Obtenir une connexion depuis le pool
    const conn = await pool.getConnection();

    // Récupération de l'enregistrement existant dans Reglage
    const results = await conn.query('SELECT * FROM Reglage WHERE ID_tableau = ?', [ID_tableau]);
    if (!results || results.length === 0) {
      conn.release();
      return res.status(404).json({ error: 'Réglage non trouvé' });
    }
    const reglageExistant = results[0];

    // Insertion des valeurs actuelles dans l'historique
    await conn.query(
      `INSERT INTO HistoriqueReglage (
          ID_reglage, 
          ID_tableau, 
          valeur_attendue, 
          valeur_min, 
          valeur_max, 
          valeur_min_tres_bas, 
          valeur_max_tres_haut
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        reglageExistant.ID_reglage,
        reglageExistant.ID_tableau,
        reglageExistant.valeur_attendue,
        reglageExistant.valeur_min,
        reglageExistant.valeur_max,
        reglageExistant.valeur_min_tres_bas,
        reglageExistant.valeur_max_tres_haut
      ]
    );

    // Mise à jour de la table Reglage avec les nouvelles valeurs
    await conn.query(
      `UPDATE Reglage
       SET valeur_attendue = ?, valeur_min = ?, valeur_max = ?, valeur_min_tres_bas = ?, valeur_max_tres_haut = ?
       WHERE ID_tableau = ?`,
      [valeur_attendue, valeur_min, valeur_max, valeur_min_tres_bas, valeur_max_tres_haut, ID_tableau]
    );

    // Récupérer les informations de l'automate concerné
    const [automate] = await conn.query('SELECT * FROM Automates WHERE ID_tableau = ?', [ID_tableau]);

    // Si l'automate utilise Modbus-Serial, envoyer les réglages sur les registres correspondants
    if (automate && automate.bibliotheque === "Modbus-Serial") {
      const client = new ModbusRTU();
      await client.connectTCP(automate.ip_automate, { port: automate.port_connexion });
      client.setID(1);

      // Si l'automate est prêt, envoyer les réglages
      // Multiplier par 100 pour convertir un float en entier (Word)
      await client.writeRegister(806, parseInt(valeur_min * 100));
      await client.writeRegister(804, parseInt(valeur_max * 100));
      await client.writeRegister(802, parseInt(valeur_min_tres_bas * 100));
      await client.writeRegister(800, parseInt(valeur_max_tres_haut * 100));
      
      client.close();
    }

    conn.release();
    res.json({ message: 'Réglage sauvegardé et historisé, et les données ont été envoyées à l\'automate.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export de toutes les valeurs
/*  Voir pour exporter toutes ces données aussi
router.get('/historique-automates/all', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const historique = await conn.query(`
      SELECT *, DATE_FORMAT(date_enregistrement, "%Y-%m-%d %H:%i:%s") AS formatted_date
      FROM HistoriqueAutomates
      ORDER BY date_enregistrement DESC
    `);
    conn.release();
    res.json(historique);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
*/

router.get('/historique-reglage/all', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const historique = await conn.query(`
      SELECT *, 
             DATE_FORMAT(date_modification, '%Y-%m-%d %H:%i:%s') AS formatted_date
      FROM HistoriqueReglage
      ORDER BY date_modification DESC
    `);
    conn.release();
    res.json(historique);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.put('/config', async (req, res) => {
  try {
    const { update_interval } = req.body;
    const conn = await pool.getConnection();
    await conn.query('UPDATE Config SET update_interval = ?', [update_interval]);
    conn.release();
    res.status(200).send('Interval updated successfully');
  } catch (error) {
    console.error('Error updating config:', error);
    res.status(500).send('Error updating config');
  }
});

module.exports = router;