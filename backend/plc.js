const ModbusRTU = require("modbus-serial");
const nodes7 = require("nodes7");

const client = new ModbusRTU();
const s7Client = new nodes7();

console.log("On est dans le plc.js")

// Connexion à un automate Modbus
const connectModbusPLC = async (ip, port, id) => {
  try {
    await client.connectTCP(ip, { port });
    client.setID(id);
    console.log(`Connecté à l'automate Modbus ${ip}:${port}`);
    return client;
  } catch (err) {
    console.error("Erreur connexion Modbus:", err.message);
  }
};

// Connexion à un automate Siemens via Node7
const connectSiemensPLC = (config) => {
  return new Promise((resolve, reject) => {
    s7Client.initiateConnection(config, (err) => {
      if (err) {
        console.error("Erreur connexion Siemens:", err.message);
        reject(err);
      } else {
        console.log("Connecté à l'automate Siemens");
        resolve(s7Client);
      }
    });
  });
};

module.exports = { connectModbusPLC, connectSiemensPLC };

/*
const ModbusRTU = require("modbus-serial");
const client = new ModbusRTU();
const clientZ3 = new ModbusRTU();
/*
// open connection to a tcp line API 2.4Ghz ou 5Ghz Happywifi
client.connectTCP("172.16.1.24", { port: 502 }); //IP Z4 et port 502 OK
client.setID(1); // Remplacez l'ID par celui de votre automate si nécessaire

clientZ3.connectTCP("172.16.1.23", { port: 502 }); //IP Z4 et port 502 OK
clientZ3.setID(1);

setInterval(async function() {
    try {
    //Lecture
      const dataZ4Coils = await client.readCoils(514, 1);  //readCoils 514,1 = premier AU
      console.log("Z4 coils values:", dataZ4Coils.data);
      //const dataZ4HoldingRegister = await client.readHoldingRegisters(503, 1); // Registre ex 0;10
      //console.log("Z4 Register values:", dataZ4HoldingRegister.data);
      const dataZ3Coils = await client.readCoils(503, 1); // Registre ex 0;10
      console.log("Z4 Register values:", dataZ3Coils.data);


      //Ecriture Dcy
      //const dataZ4Coils = await client.writeCoil(658, 0, 1);
      //const WriteZ4Coils = await client.readCoils(658, 1);  //readCoils 514,1 = premier AU
      //console.log("Z4 coils values:", WriteZ4Coils.data);

        //console.log("Z3 coils values:", dataZ3Coils.data);
    } catch (err) {
        console.error("Error reading :", err.message);
    }
}, 1000);

*/
/*
//Version Node7

var nodes7 = require('nodes7'); // This is the package name, if the repository is cloned you may need to require 'nodeS7' with uppercase S
var conn = new nodes7;
var doneReading = false;
var doneWriting = false;

var variables = {
    //TEST1: 'Fanuc_R1_DB.Static.DATA,x_Prog_Running.0',
    //TEST1: 'Bits_Globaux,0.20',
    //TEST1: 'MR4',          // Memory real at MD4
      TEST2 : 'DB10,DTZ0'   //Test de date
    //TEST2: 'M32.2',        // Bit at M32.2
      //TEST3: 'M20.0',        // Bit at M20.0
      //TEST4: 'DB1,REAL0.20', // Array of 20 values in DB1
      //TEST5: 'DB1,REAL4',    // Single real value
      //TEST6: 'DB1,REAL8',    // Another single real value
      //TEST7: 'DB1,INT12.2',  // Two integer value array
      //TEST8: 'DB1,LREAL4',   // Single 8-byte real value
      //TEST9: 'DB1,X14.0',    // Single bit in a data block
      //TEST10: 'DB1,X14.0.8'  // Array of 8 bits in a data block
};

conn.initiateConnection({ port: 102, host: '172.16.1.101', rack: 0, slot: 1, online: 'UnilasalleAmiens1', debug: false }, connected); // slot 2 for 300/400, slot 1 for 1200/1500, change debug to true to get more info
// conn.initiateConnection({port: 102, host: '192.168.0.2', localTSAP: 0x0100, remoteTSAP: 0x0200, timeout: 8000, doNotOptimize: true}, connected);
// local and remote TSAP can also be directly specified instead. The timeout option specifies the TCP timeout.

function connected(err) {
  if (typeof(err) !== "undefined") {
    // We have an error. Maybe the PLC is not reachable.
    console.log(err);
    process.exit();
  }
  conn.setTranslationCB(function(tag) { return variables[tag]; }); // This sets the "translation" to allow us to work with object names
  conn.addItems('TEST1'); //J'ajoute un élément à ma liste à scruter
  console.log('TEST1 a bien été ajouté');
  //conn.addItems(['TEST1', 'TEST4']); //Tableau de chaine de caractères
  //conn.addItems('TEST6');
  // conn.removeItems(['TEST2', 'TEST3']); // We could do this.
  // conn.writeItems(['TEST5', 'TEST6'], [ 867.5309, 9 ], valuesWritten); // You can write an array of items as well.
  // conn.writeItems('TEST7', [666, 777], valuesWritten); // You can write a single array item too.
  //conn.writeItems('TEST3', true, valuesWritten); // This writes a single boolean item (one bit) to true
  conn.readAllItems(valuesReady); //an object containing the values being read as keys and their value (from the PLC) as the value.
  console.log('Fin de lecture des valeurs');
}

function valuesReady(anythingBad, values) {
  if (anythingBad) { console.log("SOMETHING WENT WRONG READING VALUES!!!!"); }
  console.log(values);
  doneReading = true;
  if (doneWriting) { process.exit(); }
}

function valuesWritten(anythingBad) {
  if (anythingBad) { console.log("SOMETHING WENT WRONG WRITING VALUES!!!!"); }
  console.log("Done writing.");
  doneWriting = true;
  if (doneReading) { process.exit(); }
}
*/