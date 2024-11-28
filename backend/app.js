const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const routes = require('./routes');
const cronJobs = require('./cron');

dotenv.config();
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '../FrontEnd')));
app.use('/api', routes);

cronJobs();

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));