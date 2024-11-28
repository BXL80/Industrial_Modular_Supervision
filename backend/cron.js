const cron = require('node-cron');
const ModbusRTU = require("modbus-serial");
const nodes7 = require("nodes7");
const pool = require('./db');

let lastValue = null; // Stockage de la dernière valeur lue
let currentConfig = null; // Configuration actuelle (IP, protocole, registre, etc.)
//Config pour les automates
const client = new ModbusRTU();
const s7Client = new nodes7();

const updateConfig = (config) => {
  currentConfig = config; // Mettre à jour la configuration courante
  console.log("Configuration mise à jour :", currentConfig);
};

const startCron = () => {
  // Planifiez une tâche qui s'exécute toutes les secondes
  cron.schedule("*/1 * * * * *", async () => {
    if (!currentConfig) {
      console.log("Aucune configuration active, tâche ignorée.");
      return;
    }

    console.log("Lecture des données avec la configuration :", currentConfig);
    try {
      if (currentConfig.protocol === "ModbusTCP") {
        await client.connectTCP(currentConfig.ip, { port: 502 });
        client.setID(1); // L'ID est souvent défini à 1
        let data;

        if (currentConfig.type === "HoldingRegister") {
          data = await client.readHoldingRegisters(currentConfig.register, currentConfig.size);
        } else if (currentConfig.type === "Coils") {
          data = await client.readCoils(currentConfig.register, currentConfig.size);
        }

        lastValue = data.data;
        console.log("Valeur lue (ModbusTCP) :", lastValue);
        client.close();
      } else if (currentConfig.protocol === "Node7") {
        s7Client.initiateConnection({ port: 102, host: currentConfig.ip, rack: 0, slot: 1 }, (err) => {
          if (err) {
            console.error("Erreur connexion Siemens :", err.message);
            return;
          }

          s7Client.readAllItems((err, values) => {
            if (err) {
              console.error("Erreur lors de la lecture Siemens :", err.message);
              return;
            }
            lastValue = values;
            console.log("Valeur lue (Node7) :", lastValue);
            s7Client.dropConnection();
          });
        });
      }
    } catch (err) {
      console.error("Erreur lors de la lecture :", err.message);
    }
  });
};

module.exports = {
  startCron,
  updateConfig,
  getLastValue: () => lastValue,
};