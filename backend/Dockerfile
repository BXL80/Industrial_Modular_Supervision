# Utiliser une image Node.js officielle
FROM node:18

# Créer le répertoire de l'application
WORKDIR /app

# Copier les fichiers de dépendances
COPY ./package*.json ./

# Installer les dépendances
RUN npm install
# Installer nodemon pour être certain de l'avoir
RUN npm install -g nodemon

# Copier le reste du code de l'application
COPY . ./

# Exposer le port pour le backend
EXPOSE 5001

# Lancer l'application
#CMD ["npm", "start"]
#nodemon pour relance auto après modification
CMD ["nodemon", "--legacy-watch", "start"]