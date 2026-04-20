# Catalogue Unit RP

Un catalogue simple et classe pour Unit RP avec sections pour appartements, motos et véhicules.

## Fonctionnalités
- Pages séparées: Accueil, Appartements, Motos, Véhicules
- Catégories: Vente, Location
- Pour véhicules: Tri par type (Citadine, SUV, Berline)
- Bannière Unit en haut
- Logo FNH en bas à droite
- Menu de navigation avec liens vers les pages
- Boutons de catégories avec barres séparatrices (|)
- Responsive pour mobiles et ordinateurs
- Système admin avec mot de passe "Vyjeve00" pour gérer les produits (utilise localStorage)
- Bouton admin en haut à droite

## Installation
1. Téléchargez tous les fichiers sur votre hébergement (Infinity Free ou autre).
2. Placez les images dans le même dossier : `unit_rp_banniere_2.png` pour la bannière, `FNH.png` pour le logo, et créez un dossier `images/` pour les photos de produits.
3. Accédez à `index.html`.

## Gestion Admin
- Cliquez sur "Admin" en haut à droite.
- Entrez le mot de passe: Vyjeve00
- Ajoutez, modifiez ou supprimez des produits.
- Les changements sont stockés localement (localStorage).
- Pour sauvegarder globalement, utilisez "Exporter JSON" et remplacez le fichier `products.json` sur le serveur.
- Pour charger des données, utilisez "Importer JSON".

## Structure des fichiers
- `index.html`: Page d'accueil avec aperçu de toutes les sections
- `appartements.html`: Page dédiée aux appartements
- `motos.html`: Page dédiée aux motos
- `vehicules.html`: Page dédiée aux véhicules
- `admin.html`: Interface d'administration
- `style.css`: Styles CSS
- `script.js`: JavaScript pour le front-end
- `admin.js`: JavaScript pour l'admin
- `products.json`: Données initiales des produits