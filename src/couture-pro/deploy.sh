#!/bin/bash
set -e

echo "Build de l'image Docker..."
docker build -t couture-pro:latest .

echo "Lancement du conteneur..."
docker run -d -p 8080:80 --name couture-pro-container couture-pro:latest

echo "Déploiement terminé. L'application est disponible sur http://localhost:8080"
