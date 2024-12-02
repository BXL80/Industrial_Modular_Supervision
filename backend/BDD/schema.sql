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
    poste VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS Donnees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bool BOOLEAN,
    Temperature INT,
    Vitesse INT,
    Humidity INT,
    Automate VARCHAR(100),
    Status BOOLEAN,
    consigne_min INT,
    consigne_max INT
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

INSERT IGNORE INTO Poste (id, poste)
VALUES (1, 'Opérateur');

INSERT IGNORE INTO Poste (id, poste)
VALUES (2, 'Ingénieur');

INSERT IGNORE INTO Poste (id, poste)
VALUES (3, 'IT');

/*
CREATE DATABASE IF NOT EXISTS hackathon;

USE hackathon;

CREATE TABLE IF NOT EXISTS plc_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    value INT,
    ip INT,
    type VARCHAR(50)

);

CREATE OR REPLACE TABLE Utilisateurs(
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100),
    prenom VARCHAR(100),
    poste VARCHAR(100)
);
*/