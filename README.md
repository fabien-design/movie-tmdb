# React + TailwindCSS + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

# Movie TMDB Application

Une application web permettant de parcourir et évaluer des films, utilisant l'API TMDB.

## Installation

Clonez le dépôt et installez les dépendances :

```bash
git clone https://github.com/fabien-design/movie-tmdb.git
cd movie-tmdb
npm install
```

## Configuration
Créer un .env.local et entrez votre clé api, récupérable [ici](https://www.themoviedb.org/settings/api) : 
```
VITE_TMDB_API_KEY=
```

## Démarrage en mode développement

Pour lancer l'application en mode développement avec rechargement à chaud :

```bash
npm run dev
```

L'application sera accessible à l'adresse [http://localhost:5173](http://localhost:5173) (par défaut).

## Compilation

Pour compiler l'application pour la production :

```bash
npm run build
```

## Fonctionnalités

- Parcourir les films par genre
- Mettre en Favoris un film
- Voir les détails d'un film
- Lire et écrire des avis sur les films
- Noter les films
- Barre de recherche multiple

## Technologies utilisées

- React
- TypeScript
- Tailwind CSS
- Material UI (pour certains composants)
- IndexedDB (pour le stockage local des avis, des favories)
