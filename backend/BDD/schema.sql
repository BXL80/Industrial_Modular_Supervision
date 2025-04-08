CREATE DATABASE IF NOT EXISTS hackathon;

USE hackathon;

CREATE TABLE IF NOT EXISTS Utilisateurs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100),
    prenom VARCHAR(100),
    email VARCHAR(100),
    poste INT,
    action_utilisateur VARCHAR(255),
    date_heure DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--Actions + date
/*
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
*/

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
    etat_bit DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    date_heure_paris DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cycle_auto BOOLEAN -- bit 250 
);

CREATE TABLE IF NOT EXISTS Alarmes (
    ID_alarme INT AUTO_INCREMENT PRIMARY KEY,
    type_alarme VARCHAR(100),
    niveau VARCHAR(20),
    temperature DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    date_heure_alarmes DATETIME
);


CREATE TABLE IF NOT EXISTS Reglage (
    ID_reglage INT AUTO_INCREMENT PRIMARY KEY,
    ID_tableau INT NOT NULL, -- Lien avec Automates
    valeur_attendue BOOLEAN, -- Pour readCoils: 0 ou 1
    valeur_min INT,          -- Pour readHoldingRegisters: valeur minimale
    valeur_max INT,          -- Pour readHoldingRegisters: valeur maximale -- + tres_haut + tres_bas
    valeur_min_tres_bas INT,
    valeur_max_tres_haut INT,
    FOREIGN KEY (ID_tableau) REFERENCES Automates(ID_tableau) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS HistoriqueReglage (
    id_hist INT AUTO_INCREMENT PRIMARY KEY,
    ID_reglage INT NOT NULL,
    ID_tableau INT NOT NULL,
    valeur_attendue BOOLEAN,
    valeur_min INT,
    valeur_max INT,
    valeur_min_tres_bas INT,
    valeur_max_tres_haut INT,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ID_reglage) REFERENCES Reglage(ID_reglage) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Poste (
    id INT AUTO_INCREMENT PRIMARY KEY,
    poste VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS Defauts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    notification VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS Config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    update_interval INT NOT NULL DEFAULT 1 -- Interval in seconds
);

CREATE TABLE IF NOT EXISTS HistoriqueAutomates (
    ID_historique INT AUTO_INCREMENT PRIMARY KEY,
    ID_tableau INT,
    nom_machine VARCHAR(100),
    nom_automate VARCHAR(100),
    ip_automate VARCHAR(12),
    port_connexion INT,
    bibliotheque ENUM('Modbus-Serial', 'Node7'),
    numero_registre INT,
    taille_registre INT,
    type_donnees ENUM('readCoils', 'readHoldingRegisters'),
    etat_bit DECIMAL(10,2),
    date_heure_paris DATETIME,
    date_enregistrement DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 808 Bit gestion avec seuil ou non

INSERT IGNORE INTO Utilisateurs (id, nom, prenom, email, poste)
VALUES 
(1, 'LECADIEU', 'Bixente', 'bixente.lecadieu@etu.unilasalle.fr', 2),
(2, 'PETIT', 'Pierre', 'pierre.petit@etu.unilasalle.fr', 2);

INSERT IGNORE INTO Poste (id, poste)
VALUES 
(1, 'Opérateur'),
(2, 'Ingénieur'),
(3, 'IT');

INSERT IGNORE INTO Automates 
(nom_machine, nom_automate, ip_automate, port_connexion, bibliotheque, numero_registre, taille_registre, type_donnees, etat_bit, date_heure_paris, cycle_auto)
VALUES
('Cycle', 'Zone4', '172.16.1.24', 502, 'Modbus-Serial', 250, 1, 'readHoldingRegisters', 1, NOW(), 0),
('Temperature', 'Zone4', '172.16.1.24', 502, 'Modbus-Serial', 223, 1, 'readHoldingRegisters', 0, NOW(), 0);
--('ValMinTB', 'Zone4', '172.16.1.24', 502, 'Modbus-Serial', 800, 1, 'readHoldingRegisters', 0, NOW(), 0);
-- 226, 2 pour Temperature en float ou 223, 1 puis division par 10 
INSERT IGNORE INTO Reglage (ID_tableau, valeur_attendue, valeur_min, valeur_max, valeur_min_tres_bas, valeur_max_tres_haut)
VALUES
(1, NULL, 0, 1, 0, 1),
(2, NULL, 20, 35, 15, 45);
--(3, NULL, 20, 35, 15, 45);
--(1, 1, NULL, NULL), -- ID_tableau pour 'AU'
INSERT INTO Config (update_interval) VALUES (1);