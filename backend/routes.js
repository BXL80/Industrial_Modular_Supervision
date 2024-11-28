const express = require('express');
const pool = require('./db');
const { connectToPLC } = require('./plc');
//const { ExportToCsv } = require('export-to-csv');
const exportData = async (req, res) => {
  const { ExportToCsv } = await import('export-to-csv');

  const csvExporter = new ExportToCsv({ filename: 'data.csv' });
  const csvData = csvExporter.generateCsv(rows, true);

  res.setHeader('Content-disposition', 'attachment; filename=data.csv');
  res.setHeader('Content-Type', 'text/csv');
  res.send(csvData);
};


const router = express.Router();

// Tester la connexion au PLC
router.get('/test-plc', (req, res) => {
  try {
    const port = connectToPLC();
    port.on('open', () => {
      res.json({ success: true, message: 'Connexion PLC réussie!' });
      port.close();
    });

    port.on('error', (err) => {
      res.json({ success: false, message: `Erreur: ${err.message}` });
    });
  } catch (err) {
    res.json({ success: false, message: `Erreur: ${err.message}` });
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

module.exports = router;