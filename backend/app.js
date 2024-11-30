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

app.use('/api', routes);

//startCron();

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

//Redirige du back vers le front :
app.get('/', (req, res) => {
    //res.send('Le back n est pas pour toi !');
    res.redirect('http://localhost:8080'); // Redirige vers le frontend
});

app.use((req, res) => {
    res.status(404).send('Page non trouvée'); //Si page n'existe pas / plus
});

// Utilisation des routes définies
app.use('/', routes);

process.on('uncaughtException', (err) => {
    console.error('Erreur non capturée :', err.message);
    // Continuez à exécuter le serveur après avoir loggé l'erreur
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Rejet de promesse non géré :', reason);
    // Loggez l'erreur pour diagnostic
  });
  