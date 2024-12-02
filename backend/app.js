const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const routes = require('./routes');
const app = express(); // Initialisez l'application avant d'utiliser `app`


//const startCron = require('./cron');

dotenv.config();


// Middleware pour traiter les données JSON
//app.use(cors());
//app.use(cors({ origin: 'http://localhost:8080' }));
app.use(cors({ origin: ['http://localhost:8080', 'http://frontend'] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Utilisation des routes définies
app.use('/', routes);

app.use('/api', routes);

//startCron();


/*
//Redirige du back vers le front :
app.get('/', (req, res) => {
    //res.send('Le back n est pas pour toi !');
    res.redirect('http://localhost:8080'); // Redirige vers le frontend
});
*/
app.use((req, res) => {
    res.status(404).send('Page non trouvée'); //Si page n'existe pas / plus
});


/*          Ecriture BDD            */
// Route pour vérifier l'utilisateur lors de la connexion
app.post('/Page de connexion', async (req, res) => {
  const { id, nom, prenom, email, posteSelect } = req.body; // Récupérer l'ID et le nom depuis le corps de la requête

  addLog(`Connexion de l'utilisateur ID: ${id}`);

  try {
      // Log de connexion
      addLog(`Connexion de l'utilisateur : ID = ${id}, NOM = ${nom}, PRENOM = ${prenom}, EMAIL = ${email}, POSTE = ${poste}`);
      res.status(200).json({ id, nom, prenom, email, posteSelect }); // Retournez les détails de l'utilisateur
  } catch (error) {
      console.error('Erreur lors de la connexion de l\'utilisateur:', error);
      res.status(500).send('Erreur serveur lors de la connexion');// 500 = erreur serveur
  }
});

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
  