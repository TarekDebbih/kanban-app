# KanbanApp

## Description courte

KanbanApp est une application web de gestion Kanban full-stack. Elle permet aux utilisateurs de créer, organiser et gérer des colonnes et des tickets, avec une gestion des rôles (Admin et Standard) et une interface utilisateur moderne développée avec Angular. Le backend repose sur une API REST construite avec ASP.NET Core et une base de données SQLite.

---

## Fonctionnalités principales

- **Authentification** :
  - Inscription et connexion avec authentification JWT.
  - Option "Se souvenir de moi" avec token persistant.
  - Mots de passe hashés et emails uniques.

- **Gestion des rôles** :
  - Rôles Admin et Standard.
  - Les utilisateurs Standard ne peuvent gérer que leurs propres ressources.
  - Les Admins peuvent gérer toutes les ressources (utilisateurs, colonnes, tickets).

- **Kanban** :
  - Colonnes configurables : création, modification, suppression, réorganisation.
  - Tickets : création, modification, suppression, déplacement entre colonnes.
  - Affichage du nombre de tickets par colonne.

- **Sécurité** :
  - Authentification sécurisée avec JWT.
  - Règles d'autorisation basées sur les rôles.
  - Gestion des erreurs centralisée via un middleware.

---

## Stack technique

### Backend
- **ASP.NET Core Web API** : Framework pour construire l'API REST.
- **C#** : Langage principal pour le backend.
- **Entity Framework Core** : ORM pour la gestion de la base de données.
- **SQLite** : Base de données légère et intégrée.
- **JWT Bearer Authentication** : Authentification sécurisée.
- **Swagger** : Documentation et test des endpoints API.

### Frontend
- **Angular** : Framework pour le développement de l'interface utilisateur.
- **TypeScript** : Langage principal pour le frontend.
- **HTML/CSS** : Structure et style de l'interface.
- **RxJS** : Gestion des flux de données asynchrones.

---

## Architecture

### Backend
- **Controllers** : Gèrent les endpoints HTTP.
- **Services** : Contiennent la logique métier et le mapping des DTOs.
- **Repositories** : Fournissent une abstraction pour l'accès aux données.
- **DTOs** : Gèrent les données entrantes et sortantes.
- **Middleware** : Gestion centralisée des erreurs et autres traitements transversaux.

### Frontend
- **Composants** : Interface utilisateur modulaire et réactive.
- **Services Angular** : Communication avec l'API backend.
- **Modèles TypeScript** : Alignés avec les DTOs du backend pour une cohérence des données.

---

## Installation

### Prérequis
- **.NET SDK** (version 8.0 ou supérieure)
- **Node.js** (version LTS)
- **npm** (inclus avec Node.js)
- **Angular CLI** (si nécessaire)

---

## Lancement

### Backend
1. Naviguez dans le dossier backend :
   ```bash
   cd backend/KanbanApi
   ```
2. Restaurez les dépendances :
   ```bash
   dotnet restore
   ```
3. Appliquez les migrations à la base de données :
   ```bash
   dotnet ef database update
   ```
4. Lancez le serveur backend :
   ```bash
   dotnet run
   ```
   Le backend sera accessible par défaut sur `http://localhost:5065`.

---

### Frontend
1. Naviguez dans le dossier frontend :
   ```bash
   cd frontend/kanban-frontend
   ```
2. Installez les dépendances :
   ```bash
   npm install
   ```
3. Lancez le serveur de développement :
   ```bash
   npm start
   ```
   Le frontend sera accessible par défaut sur `http://localhost:4200`.

---

## Compte admin local

Un compte administrateur est créé automatiquement au démarrage pour faciliter les tests en local :
- **Email** : `admin@test.com`
- **Mot de passe** : `admin123`

⚠️ Ces identifiants sont destinés uniquement à l'environnement local.

---

## Compte Rendu

Un fichier PDF détaillant le compte rendu du projet est disponible dans le dossier `docs`. Ce document explique en détail les choix techniques, les difficultés rencontrées, les solutions apportées, ainsi que les améliorations possibles pour le projet.

---

## Routes/API principales

Voici quelques-unes des routes principales de l'API :

- **Authentification** :
  - `POST /api/Auth/login` : Connexion utilisateur.
- **Utilisateurs** :
  - `POST /api/Users` : Création d'un utilisateur.
  - `GET /api/Users/{email}` : Récupération d'un utilisateur par email.
- **Colonnes Kanban** :
  - `GET /api/KanbanColumn` : Récupération des colonnes.
  - `POST /api/KanbanColumn` : Création d'une colonne.
  - `PUT /api/KanbanColumn/{id}` : Modification d'une colonne.
  - `DELETE /api/KanbanColumn/{id}` : Suppression d'une colonne.
- **Tickets** :
  - `GET /api/Ticket` : Récupération des tickets.
  - `POST /api/Ticket` : Création d'un ticket.
  - `PUT /api/Ticket/{id}` : Modification d'un ticket.
  - `DELETE /api/Ticket/{id}` : Suppression d'un ticket.

---

## Sécurité et rôles

- **Mots de passe** : Tous les mots de passe sont hashés avant d'être stockés.
- **JWT** : Les tokens JWT contiennent l'identifiant utilisateur, l'email et le rôle.
- **Règles d'autorisation** :
  - Les utilisateurs Standard ne peuvent gérer que leurs propres ressources.
  - Les Admins peuvent gérer toutes les ressources.
- **CORS** : Configuré pour permettre la communication entre le frontend et le backend.

---

## Améliorations possibles

- Ajouter des tests unitaires et d'intégration.
- Ajouter un historique des déplacements de tickets.
- Déployer l'application sur une plateforme cloud (Azure, Railway, Render, etc.).
- Ajouter une fonctionnalité de recherche et de filtrage des tickets.

---

## Auteur

- **Tarek**