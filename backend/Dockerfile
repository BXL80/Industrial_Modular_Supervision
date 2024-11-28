# Utiliser une image Node.js officielle
FROM node:18

# Créer le répertoire de l'application
WORKDIR /app

# Copier les fichiers de dépendances
COPY ./package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste du code de l'application
COPY . ./

# Exposer le port pour le backend
EXPOSE 5001

# Lancer l'application
CMD ["npm", "start"]