// server.js
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const path = require('path');

const connectDB = require('./src/config/database');
const { CONFIG, assertRequiredEnv } = require('./src/config/constants');
const logger = require('./src/utils/logger');
const logRoutes = require('./src/routes/logRoutes');
const errorHandler = require('./src/middlewares/errorHandler');
const { initGridFS } = require('./src/services/gridfsService');

const authRoutes = require('./src/routes/authRoutes');
const offerRoutes = require('./src/routes/offerRoutes');
const interviewRoutes = require('./src/routes/interviewRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const applicationRoutes = require('./src/routes/applicationRoutes');
const departmentRoutes = require('./src/routes/departmentRoutes');
const documentRoutes = require('./src/routes/documentRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const userRoutes = require('./src/routes/userRoutes');
const studentRoutes = require('./src/routes/studentRoutes');
const internshipRoutes = require('./src/routes/internshipRoutes.js');

const resultsRoutes = require('./src/routes/resultsRoutes');
const periodRoutes = require('./src/routes/periodRoutes');
// AJOUT : Routes pour les rôles
const roleRoutes = require('./src/routes/roleRoutes');

assertRequiredEnv();

const app = express();

app.set('trust proxy', 1);

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
if (CONFIG.nodeEnv !== 'production') {
  app.use(cors({ origin: true, credentials: true }));
} else {
  app.use(cors({ origin: CONFIG.clientUrl, credentials: true }));
}

// AUGMENTER LA LIMITE POUR PERMETTRE L'UPLOAD DES IMAGES DE SIGNATURE
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.use(mongoSanitize());

// ============================================
// ✅ EXPOSITION DES DOSSIERS STATIQUES
// ============================================
app.use('/uploads/documents', express.static(path.join(__dirname, 'uploads/documents')));
app.use('/uploads/rapports', express.static(path.join(__dirname, 'uploads/rapports')));
app.use('/uploads/engagements', express.static(path.join(__dirname, 'uploads/engagements')));
app.use('/uploads/livrables', express.static(path.join(__dirname, 'uploads/livrables')));
app.use('/uploads/conventions', express.static(path.join(__dirname, 'uploads/conventions')));
// ✅ Dossier uploads racine - permet l'accès à tous les sous-dossiers
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// ✅ Dossier resultats - spécifique pour les PDF de résultats
app.use('/uploads/resultats', express.static(path.join(__dirname, 'uploads/resultats')));

if (CONFIG.nodeEnv !== 'production') {
  app.use(morgan('dev', { stream: { write: (msg) => logger.debug(msg.trim()) } }));
}

app.get('/api/v1/health', (req, res) => res.status(200).json({ success: true, status: 'up' }));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/offers', offerRoutes);
app.use('/api/v1/interviews', interviewRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/results', resultsRoutes);
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1/departments', departmentRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/documents', documentRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/periods', periodRoutes);
app.use('/api/v1/logs', logRoutes);
app.use('/api/v1/internships', internshipRoutes);
// AJOUT : Route pour les rôles
app.use('/api/v1/roles', roleRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route introuvable : ${req.method} ${req.originalUrl}` });
});

app.use(errorHandler);

async function start() {
  await connectDB();
  initGridFS();

  const server = app.listen(CONFIG.port, () => {
    logger.info(`[Server] PGS API demarree sur le port ${CONFIG.port} (${CONFIG.nodeEnv})`);
  });

  const shutdown = (signal) => {
    logger.info(`[Server] Signal ${signal} recu, arret en cours...`);
    server.close(() => {
      logger.info('[Server] Arret propre termine.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('unhandledRejection', (err) => {
    logger.error(`[UnhandledRejection] ${err.message}`);
    server.close(() => process.exit(1));
  });
}

if (require.main === module) {
  start();
}

module.exports = app;