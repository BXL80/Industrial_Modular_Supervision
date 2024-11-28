const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const routes = require('./routes');
//const startCron = require('./cron');

dotenv.config();
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));
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
  
  // Middleware pour analyser les requêtes JSON
app.use(express.json());

// Connecter les routes
app.use('/api', routes);

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, '../frontend')));

// Utilisation des routes définies
app.use('/', routes);