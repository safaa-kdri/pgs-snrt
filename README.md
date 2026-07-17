# 🎯 SNRT - Plateforme de Gestion des Stages (PGS)

Plateforme web de gestion des stages pour la **SNRT** (Société Nationale de Radiodiffusion et de Télévision).

---

## 🏗️ Structure du projet (Monorepo)
snrt-pgs/
├── snrt-pgs-backend/ # API REST (Node.js + Express + MongoDB)
└── snrt-pgs-frontend/ # Application React (SPA)

---

## 🛠️ Technologies

| Couche | Technologie |
|:---|:---|
| **Frontend** | React.js, Redux Toolkit, Material-UI |
| **Backend** | Node.js, Express.js |
| **Base de données** | MongoDB, Mongoose |
| **Sécurité** | JWT, Argon2id, 2FA, cookies HttpOnly |

---

## 🚀 Installation

### Prérequis

- Node.js v20+
- MongoDB v6+
- npm ou yarn

### Backend

cd snrt-pgs-backend
npm install
cp .env.example .env
npm run seed
npm run dev

## Frontend

cd snrt-pgs-frontend
npm install
cp .env.example .env
npm start

👥 Équipe
Membre	Rôle
Safaa EL KADOURI	Chef de projet / Fullstack
Aya NAHAL	Lead Frontend
Badr HOUARTI	Lead Backend
Mohammed AROUI	Fullstack / DevOps
📝 Licence
© 2026 SNRT - Tous droits réservés

text

---

## 📄 CRÉER LES FICHIERS BACKEND

### 3. `snrt-pgs-backend/package.json`

cd snrt-pgs-backend
npm init -y