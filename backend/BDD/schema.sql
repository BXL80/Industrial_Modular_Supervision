CREATE DATABASE IF NOT EXISTS hackathon;

USE hackathon;

CREATE TABLE IF NOT EXISTS plc_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    value INT,
    type VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS Utilisateurs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100),
    prenom VARCHAR(100),
    email VARCHAR(100),
    poste INT
);

CREATE TABLE IF NOT EXISTS Automates (
    ID_tableau INT AUTO_INCREMENT PRIMARY KEY,
    nom_machine VARCHAR(100) NOT NULL,
    nom_automate VARCHAR(100) NOT NULL,
    ip_automate VARCHAR(15) NOT NULL,
    port_connexion INT NOT NULL,
    bibliotheque ENUM('Modbus-Serial', 'Node7') NOT NULL,
    numero_registre INT NOT NULL,
    taille_registre INT NOT NULL,
    type_donnees ENUM('readCoils', 'readHoldingRegisters') NOT NULL,
    etat_bit BOOLEAN NOT NULL DEFAULT FALSE,
    date_heure_paris DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Automate (
    id INT AUTO_INCREMENT PRIMARY KEY,
    port INT,
    ip VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS Poste (
    id INT AUTO_INCREMENT PRIMARY KEY,
    poste VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS Defauts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    notification VARCHAR(100)
);

INSERT IGNORE INTO Utilisateurs (id, nom, prenom, email, poste)
VALUES (1, 'LECADIEU', 'Bixente', 'bixente.lecadieu@etu.unilasalle.fr', 2);

INSERT IGNORE INTO Poste (id, poste)
VALUES (1, 'Opérateur');

INSERT IGNORE INTO Poste (id, poste)
VALUES (2, 'Ingénieur');

INSERT IGNORE INTO Poste (id, poste)
VALUES (3, 'IT');

INSERT IGNORE INTO Automates 
(nom_machine, nom_automate, ip_automate, port_connexion, bibliotheque, numero_registre, taille_registre, type_donnees, etat_bit, date_heure_paris)
VALUES
('AU', 'Zone4', '172.16.1.24', 502, 'Modbus-Serial', 514, 1, 'readCoils', 1, NOW()),
('Temperature', 'Zone4', '172.16.1.24', 502, 'Modbus-Serial', 503, 1, 'readHoldingRegisters', 0, NOW());