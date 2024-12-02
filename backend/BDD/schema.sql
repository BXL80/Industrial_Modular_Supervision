CREATE DATABASE IF NOT EXISTS hackathon;

USE hackathon;

CREATE TABLE IF NOT EXISTS plc_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    value INT,
    ip INT,
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
    Status BOOLEAN
);

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