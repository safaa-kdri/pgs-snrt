// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const path = require('path');

const connectDB = require('./src/config/database');
const logger = require('./src/utils/logger');
const errorHandler = require('./src/middlewares/errorHandler');
const { logRequest, logAccessDenied } = require('./src/middlewares/logger');

// ============================================
// IMPORT DES ROUTES
// ============================================

// Routes de Badr
const authRoutes = require('./src/routes/authRoutes');
const offerRoutes = require('./src/routes/offerRoutes');
const interviewRoutes = require('./src/routes/interviewRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');

// Routes de Mohammed
const userRoutes = require('./src/routes/userRoutes');
const departmentRoutes = require('./src/routes/departmentRoutes');
const applicationRoutes = require('./src/routes/applicationRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');

// Routes de Safaa
const periodRoutes = require('./src/routes/periodRoutes');
const internshipRoutes = require('./src/routes/internshipRoutes');

// ============================================
// INITIALISATION
// ============================================

const app = express();

// ============================================
// CONNEXION DATABASE
// ============================================
connectDB();

// ============================================
// MIDDLEWARES
// ============================================

// Security Headers
app.use(helmet());

// CORS
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200
}));

// Rate Limiting (protection contre les attaques)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requêtes par IP
    message: {
        success: false,
        message: 'Trop de requêtes, veuillez réessayer dans 15 minutes.'
    }
});
app.use('/api', limiter);

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Data Sanitization (protection XSS et injections)
app.use(mongoSanitize());

// Logging des requêtes
app.use(logRequest);
app.use(logAccessDenied);

// Logging HTTP avec morgan
app.use(morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) }
}));

// ============================================
// STATIC FILES
// ============================================
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================
// ROUTES API
// ============================================

// ===== Routes d'authentification (Badr) =====
app.use('/api/v1/auth', authRoutes);

// ===== Routes utilisateurs (Mohammed) =====
app.use('/api/v1/users', userRoutes);

// ===== Routes départements (Mohammed) =====
app.use('/api/v1/departments', departmentRoutes);

// ===== Routes périodes (Safaa) =====
app.use('/api/v1/periods', periodRoutes);

// ===== Routes offres de stage (Badr) =====
app.use('/api/v1/offers', offerRoutes);

// ===== Routes candidatures (Mohammed) =====
app.use('/api/v1/applications', applicationRoutes);

// ===== Routes entretiens (Badr) =====
app.use('/api/v1/interviews', interviewRoutes);

// ===== Routes stages (Safaa) =====
app.use('/api/v1/internships', internshipRoutes);

// ===== Routes notifications (Mohammed) =====
app.use('/api/v1/notifications', notificationRoutes);

// ===== Routes tableaux de bord (Badr) =====
app.use('/api/v1/dashboard', dashboardRoutes);

// ============================================
// HEALTH CHECK
// ============================================
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        message: '🚀 SNRT PGS API is running'
    });
});

// ============================================
// 404 - Route non trouvée
// ============================================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
        method: req.method
    });
});

// ============================================
// GESTION DES ERREURS (dernier middleware)
// ============================================
app.use(errorHandler);

// ============================================
// DÉMARRAGE DU SERVEUR
// ============================================
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    logger.info('='.repeat(60));
    logger.info('🚀 SNRT PGS API - SERVEUR DÉMARRÉ');
    logger.info('='.repeat(60));
    logger.info(`📡 Port: ${PORT}`);
    logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`📊 Health check: http://localhost:${PORT}/health`);
    logger.info(`📚 Database: ${process.env.MONGO_URI || 'mongodb://localhost:27017/snrt_pgs'}`);
    logger.info('='.repeat(60));
    logger.info('📋 ROUTES DISPONIBLES:');
    logger.info(`   🔐 /api/v1/auth         → Authentification (Badr)`);
    logger.info(`   👤 /api/v1/users        → Utilisateurs (Mohammed)`);
    logger.info(`   🏢 /api/v1/departments  → Départements (Mohammed)`);
    logger.info(`   📅 /api/v1/periods      → Périodes (Safaa)`);
    logger.info(`   📋 /api/v1/offers       → Offres (Badr)`);
    logger.info(`   📄 /api/v1/applications → Candidatures (Mohammed)`);
    logger.info(`   🗣️ /api/v1/interviews   → Entretiens (Badr)`);
    logger.info(`   📚 /api/v1/internships  → Stages (Safaa)`);
    logger.info(`   🔔 /api/v1/notifications→ Notifications (Mohammed)`);
    logger.info(`   📊 /api/v1/dashboard    → Tableaux de bord (Badr)`);
    logger.info('='.repeat(60));
    logger.info(`✅ Serveur prêt à recevoir des requêtes sur http://localhost:${PORT}`);
});

// ============================================
// GESTION DES ERREURS NON CAPTURÉES
// ============================================

// Rejet de promesse non géré
process.on('unhandledRejection', (err) => {
    logger.error('💥 UNHANDLED REJECTION!');
    logger.error(`Erreur: ${err.message}`);
    logger.error(`Stack: ${err.stack}`);
    // Le serveur continue de tourner, mais on log l'erreur
});

// Exception non capturée
process.on('uncaughtException', (err) => {
    logger.error('💥 UNCAUGHT EXCEPTION!');
    logger.error(`Erreur: ${err.message}`);
    logger.error(`Stack: ${err.stack}`);
    // On arrête proprement le serveur pour éviter un état instable
    logger.error('🛑 Arrêt du serveur...');
    process.exit(1);
});

// ============================================
// ARRÊT PROPRE
// ============================================
const shutdown = () => {
    logger.info('🛑 Arrêt du serveur...');
    server.close(() => {
        logger.info('✅ Serveur arrêté avec succès');
        process.exit(0);
    });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// ============================================
// EXPORT POUR LES TESTS
// ============================================
module.exports = app;