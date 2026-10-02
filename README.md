# SNRT - Plateforme de Gestion des Stages (PGS)

Plateforme web dédiée à la **gestion et au suivi des stages au sein de la SNRT (Société Nationale de Radiodiffusion et de Télévision)**.

La plateforme permet de centraliser le processus de gestion des stages, depuis la création et la publication des offres jusqu'au suivi des candidatures, des conventions, des documents et de la clôture du stage.

---

## Présentation

La plateforme PGS a été conçue pour digitaliser et simplifier le processus de gestion des stages entre les différents intervenants :

- Étudiants / Candidats
- Département
- Ressources Humaines
- Encadrants
- Administrateurs

Elle permet notamment de centraliser les offres de stage, les candidatures, les documents administratifs et le suivi des stagiaires au sein d'une seule plateforme.

---

## Fonctionnalités principales

### Gestion des offres

- Création et gestion des offres de stage
- Validation et publication des offres
- Gestion des postes disponibles
- Gestion des compétences et sujets de stage

### Gestion des candidatures

- Inscription et authentification des candidats
- Dépôt et suivi des candidatures
- Analyse et traitement des candidatures
- Gestion des entretiens
- Acceptation ou refus des candidatures
- Génération des résultats

### Gestion des stages

- Gestion des conventions
- Gestion des documents administratifs
- Suivi du stage
- Dépôt et validation du rapport de stage
- Génération des documents liés au stage
- Génération de l'attestation de stage

### Sécurité

- Authentification JWT
- Authentification à deux facteurs (2FA)
- Hachage des mots de passe avec Argon2id
- Cookies HttpOnly
- Gestion des rôles et des permissions

---

## Architecture du projet

Le projet est organisé sous forme de monorepo :

```text
snrt-pgs/
├── snrt-pgs-backend/
│   └── API REST
│
└── snrt-pgs-frontend/
    └── Application web React
```

### Backend

API REST développée avec Node.js et Express.js, permettant de gérer les utilisateurs, les offres, les candidatures, les stages et les documents.

### Frontend

Application web monopage (SPA) développée avec React.js, Redux Toolkit et Material-UI.

---

## Technologies

| Couche | Technologies |
|:---|:---|
| **Frontend** | React.js, Redux Toolkit, Material-UI |
| **Backend** | Node.js, Express.js |
| **Base de données** | MongoDB, Mongoose |
| **Authentification** | JWT, 2FA |
| **Sécurité** | Argon2id, cookies HttpOnly |
| **Architecture** | API REST, SPA |

---

## Installation

### Prérequis

- Node.js v20+
- MongoDB v6+
- npm ou yarn

### 1. Cloner le projet

```bash
git clone <URL_DU_REPOSITORY>
cd snrt-pgs
```

### 2. Installer le backend

```bash
cd snrt-pgs-backend
npm install
```

Créer ensuite un fichier `.env` à partir du fichier `.env.example` et renseigner les variables d'environnement nécessaires.

Lancer le backend :

```bash
npm run dev
```

### 3. Installer le frontend

Dans un autre terminal :

```bash
cd snrt-pgs-frontend
npm install
```

Créer ensuite le fichier `.env` à partir du fichier `.env.example`.

Lancer le frontend :

```bash
npm start
```

---

## Statut du projet

Projet réalisé dans le cadre d'un projet académique et professionnel portant sur la digitalisation du processus de gestion des stages.

---

## Remarque

Certaines informations, configurations et données utilisées dans le projet peuvent être adaptées ou retirées de la version publique du dépôt pour des raisons de confidentialité.
