const cron = require("node-cron");
const ModbusRTU = require("modbus-serial");
const nodes7 = require("nodes7");
const pool = require("./db");

const client = new ModbusRTU();
const s7Client = new nodes7();

let updateInterval = 1; // Default to 1 second
let task = null;

const startUpdating = async () => {
  task = cron.schedule(`*/${updateInterval} * * * * *`, async () => {
    console.log(`Updating automates every ${updateInterval} second(s)...`);
    const conn = await pool.getConnection();
    try {
      const automates = await conn.query("SELECT * FROM Automates");

      for (const automate of automates) {
        let etat_bit = null;

        try {
          if (automate.bibliotheque === "Modbus-Serial") {
            await client.connectTCP(automate.ip_automate, {
              port: automate.port_connexion,
            });
            client.setID(1); // Default Modbus ID
            if (automate.type_donnees === "readCoils") {
              const data = await client.readCoils(
                automate.numero_registre,
                automate.taille_registre
              );
              etat_bit = data.data[0];
            } else if (automate.type_donnees === "readHoldingRegisters") {
              const data = await client.readHoldingRegisters(
                automate.numero_registre,
                automate.taille_registre
              );
              etat_bit = data.data[0];
            }
            client.close();
          } else if (automate.bibliotheque === "Node7") {
            await new Promise((resolve, reject) => {
              s7Client.initiateConnection(
                {
                  port: 102,
                  host: automate.ip_automate,
                  rack: 0,
                  slot: 1,
                },
                (err) => {
                  if (err) return reject(err);

                  s7Client.readAllItems((err, values) => {
                    if (err) return reject(err);
                    etat_bit = values.someValue; // Replace with the actual variable name
                    s7Client.dropConnection();
                    resolve();
                  });
                }
              );
            });
          }

          if (etat_bit !== null) {
            await conn.query(
              "UPDATE Automates SET etat_bit = ?, date_heure_paris = NOW() WHERE ID_tableau = ?",
              [etat_bit, automate.ID_tableau]
            );
          }
        } catch (err) {
          console.error(
            `Error processing automate ID ${automate.ID_tableau}:`,
            err.message
          );
        }
      }
    } catch (err) {
      console.error("Error in cron update task:", err.message);
    } finally {
      conn.release();
    }
  });
};

const stopUpdating = () => {
  if (task) task.stop();
};

const updateIntervalTime = (newInterval) => {
  if (task) task.stop();
  updateInterval = newInterval;
  startUpdating();
};

module.exports = {
  startUpdating,
  stopUpdating,
  updateIntervalTime,
};