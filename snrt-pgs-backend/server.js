const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');

const connectDB = require('./src/config/database');
const { CONFIG, assertRequiredEnv } = require('./src/config/constants');
const logger = require('./src/utils/logger');
const errorHandler = require('./src/middlewares/errorHandler');

const authRoutes = require('./src/routes/authRoutes');
const offerRoutes = require('./src/routes/offerRoutes');
const interviewRoutes = require('./src/routes/interviewRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const applicationRoutes = require('./src/routes/applicationRoutes');
const departmentRoutes = require('./src/routes/departmentRoutes');
const documentRoutes = require('./src/routes/documentRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const userRoutes = require('./src/routes/userRoutes');
// BUGFIX (code mort) : resultsRoutes existait (routes + controller complets,
// getResults/getResultDetail lisent bien documentsConcours.ResultatConcours
// deja alimente par offerController.uploadConcoursDocument) mais n'etait
// jamais monte ici - la fonctionnalite etait 100% inaccessible depuis
// l'exterieur.
const resultsRoutes = require('./src/routes/resultsRoutes');

assertRequiredEnv();

const app = express();

// Necessaire derriere un reverse proxy (Nginx) pour que req.ip / rate-limit
// et les cookies "secure" fonctionnent correctement.
app.set('trust proxy', 1);

// --- Securite HTTP de base ---
app.use(helmet());
app.use(cors({ origin: CONFIG.clientUrl, credentials: true })); // credentials: indispensable pour les cookies HttpOnly

// --- Parsers ---
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// --- Protection contre les injections NoSQL (OWASP) ---
app.use(mongoSanitize());

// --- Fichiers uploades (documents de candidature) ---
// NB : servir ces fichiers necessite que l'utilisateur soit authentifie et
// autorise a y acceder (IDOR) ; a durcir avant mise en production (cf.
// documentController.getDocumentById pour le controle d'acces cote donnees).
app.use('/uploads/documents', express.static(require('path').join(__dirname, 'uploads/documents')));

// --- Logs HTTP (dev) ---
if (CONFIG.nodeEnv !== 'production') {
  app.use(morgan('dev', { stream: { write: (msg) => logger.debug(msg.trim()) } }));
}

// --- Healthcheck ---
app.get('/api/v1/health', (req, res) => res.status(200).json({ success: true, status: 'up' }));

// --- Routes (perimetre Badr : auth, offres, entretiens, dashboard/stats) ---
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/offers', offerRoutes);
app.use('/api/v1/interviews', interviewRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/results', resultsRoutes);

// --- Routes (perimetre Mohammed : candidatures, departements, documents,
// notifications, utilisateurs) ---
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1/departments', departmentRoutes);
app.use('/api/v1/documents', documentRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/users', userRoutes);

// D'autres routers (periodRoutes, internshipRoutes...) seront montes ici au
// fur et a mesure de leur integration par le reste de l'equipe.

// --- 404 ---
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route introuvable : ${req.method} ${req.originalUrl}` });
});

// --- Gestion globale des erreurs (doit rester le dernier middleware) ---
// BUGFIX (code mort / comportement) : ce bloc dupliquait moins bien
// middlewares/errorHandler.js, qui existait deja dans le depot mais n'etait
// jamais importe. errorHandler.js traduit en plus les erreurs Mongoose
// (ValidationError, CastError, cle dupliquee 11000) et JWT en reponses
// HTTP explicites (400/404/401) au lieu de les laisser tomber en 500
// generique comme c'etait le cas ici. Voir src/middlewares/errorHandler.js
// pour le detail de la fusion (la logique de masquage du message en cas
// d'erreur non-operationnelle, qui existait ici, y a ete reportee pour ne
// pas regresser sur ce point).
app.use(errorHandler);

// -----------------------------------------------------------------------------
// Demarrage
// -----------------------------------------------------------------------------
async function start() {
  await connectDB();

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
