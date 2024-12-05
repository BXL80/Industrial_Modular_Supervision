CREATE DATABASE IF NOT EXISTS hackathon;

USE hackathon;

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
    ip_automate VARCHAR(12) NOT NULL,
    port_connexion INT NOT NULL,
    bibliotheque ENUM('Modbus-Serial', 'Node7') NOT NULL,
    numero_registre INT NOT NULL,
    taille_registre INT NOT NULL,
    type_donnees ENUM('readCoils', 'readHoldingRegisters') NOT NULL,
    etat_bit INT NOT NULL DEFAULT 0,
    date_heure_paris DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Reglage (
    ID_reglage INT AUTO_INCREMENT PRIMARY KEY,
    ID_tableau INT NOT NULL, -- Lien avec Automates
    valeur_attendue BOOLEAN, -- Pour readCoils: 0 ou 1
    valeur_min INT,          -- Pour readHoldingRegisters: valeur minimale
    valeur_max INT,          -- Pour readHoldingRegisters: valeur maximale
    FOREIGN KEY (ID_tableau) REFERENCES Automates(ID_tableau) ON DELETE CASCADE
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
VALUES 
(1, 'LECADIEU', 'Bixente', 'bixente.lecadieu@etu.unilasalle.fr', 2);

INSERT IGNORE INTO Poste (id, poste)
VALUES 
(1, 'Opérateur'),
(2, 'Ingénieur'),
(3, 'IT');

INSERT IGNORE INTO Automates 
(nom_machine, nom_automate, ip_automate, port_connexion, bibliotheque, numero_registre, taille_registre, type_donnees, etat_bit, date_heure_paris)
VALUES
('AU', 'Zone4', '172.16.1.24', 502, 'Modbus-Serial', 514, 1, 'readCoils', 1, NOW()),
('Temperature', 'Zone4', '172.16.1.24', 502, 'Modbus-Serial', 401, 1, 'readHoldingRegisters', 0, NOW());

INSERT IGNORE INTO Reglage (ID_tableau, valeur_attendue, valeur_min, valeur_max)
VALUES
(1, 1, NULL, NULL), -- ID_tableau pour 'AU'
(2, NULL, 20, 50);  -- ID_tableau pour 'Temperature'