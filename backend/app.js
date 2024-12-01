const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const routes = require('./routes');
//const startCron = require('./cron');

dotenv.config();
const app = express();


// Middleware pour traiter les données JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Utilisation des routes définies
app.use('/', routes);

app.use('/api', routes);

//startCron();

//Redirige du back vers le front :
app.get('/', (req, res) => {
    //res.send('Le back n est pas pour toi !');
    res.redirect('http://localhost:8080'); // Redirige vers le frontend
});

app.use((req, res) => {
    res.status(404).send('Page non trouvée'); //Si page n'existe pas / plus
});


/*          Ecriture BDD            */
// Route pour vérifier l'utilisateur lors de la connexion
app.post('/Page de connexion', async (req, res) => {
  const { id, nom, prenom } = req.body; // Récupérer l'ID et le nom depuis le corps de la requête

  addLog(`Connexion de l'utilisateur ID: ${id}`);

  try {
      // Log de connexion
      addLog(`Connexion de l'utilisateur : ID = ${id}, NOM = ${nom}, PRENOM = ${prenom}`);
      res.status(200).json({ id, nom, prenom }); // Retournez les détails de l'utilisateur
  } catch (error) {
      console.error('Erreur lors de la connexion de l\'utilisateur:', error);
      res.status(500).send('Erreur serveur lors de la connexion');// 500 = erreur serveur
  }
});
/*
// Route pour ajouter un nouvel utilisateur (POST /utilisateurs)
app.post('/utilisateurs', async (req, res) => {
  try {
      const { nom, prenom } = req.body;

      if (!nom || !prenom) {
          console.error('Erreur pas de nom ou prenom');
          return res.status(400).send('Nom et prénom sont requis');
      }

      const conn = await pool.getConnection();

      // Insertion de l'utilisateur dans la base de données
      const result = await conn.query('INSERT INTO Utilisateurs (nom, prenom) VALUES (?, ?)', [nom, prenom]);
      
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
*/
/*     PARTIE SERVEUR     */
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

process.on('uncaughtException', (err) => {
    console.error('Erreur non capturée :', err.message);
    // Continuez à exécuter le serveur après avoir loggé l'erreur
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Rejet de promesse non géré :', reason);
    // Loggez l'erreur pour diagnostic
  });
  