// src/controllers/periodController.js
const Period = require('../models/Period');
const logger = require('../utils/logger');

// ============================================
// GET - Récupérer toutes les périodes
// ============================================
exports.getAllPeriods = async (req, res) => {
    try {
        const periods = await Period.find()
            .sort({ dateDebut: -1 });
        
        res.status(200).json({
            success: true,
            count: periods.length,
            data: periods
        });
    } catch (error) {
        logger.error(`Erreur getAllPeriods: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des périodes'
        });
    }
};

// ============================================
// GET - Récupérer une période par ID
// ============================================
exports.getPeriodById = async (req, res) => {
    try {
        const period = await Period.findById(req.params.id);
        
        if (!period) {
            return res.status(404).json({
                success: false,
                message: 'Période non trouvée'
            });
        }
        
        res.status(200).json({
            success: true,
            data: period
        });
    } catch (error) {
        logger.error(`Erreur getPeriodById: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de la période'
        });
    }
};

// ============================================
// GET - Récupérer les périodes actives
// ============================================
exports.getActivePeriods = async (req, res) => {
    try {
        const periods = await Period.find({
            actif: true,
            isDeleted: false
        }).sort({ dateDebut: -1 });
        
        res.status(200).json({
            success: true,
            count: periods.length,
            data: periods
        });
    } catch (error) {
        logger.error(`Erreur getActivePeriods: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des périodes actives'
        });
    }
};

// ============================================
// POST - Créer une période (Admin uniquement)
// ============================================
exports.createPeriod = async (req, res) => {
    try {
        const period = await Period.create(req.body);
        
        logger.info(`Période créée: ${period.nom} par ${req.user?.email || 'admin'}`);
        
        res.status(201).json({
            success: true,
            data: period,
            message: 'Période créée avec succès'
        });
    } catch (error) {
        logger.error(`Erreur createPeriod: ${error.message}`);
        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Une période avec ce nom existe déjà'
            });
        }
        
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// ============================================
// PUT - Mettre à jour une période (Admin uniquement)
// ============================================
exports.updatePeriod = async (req, res) => {
    try {
        const period = await Period.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!period) {
            return res.status(404).json({
                success: false,
                message: 'Période non trouvée'
            });
        }
        
        logger.info(`Période mise à jour: ${period.nom} par ${req.user?.email || 'admin'}`);
        
        res.status(200).json({
            success: true,
            data: period,
            message: 'Période mise à jour avec succès'
        });
    } catch (error) {
        logger.error(`Erreur updatePeriod: ${error.message}`);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// ============================================
// DELETE - Supprimer une période (Admin uniquement)
// ============================================
exports.deletePeriod = async (req, res) => {
    try {
        const period = await Period.findById(req.params.id);
        
        if (!period) {
            return res.status(404).json({
                success: false,
                message: 'Période non trouvée'
            });
        }
        
        // Vérifier si des offres utilisent cette période
        const Offer = require('../models/Offer');
        const offersCount = await Offer.countDocuments({ periodeId: period._id });
        
        if (offersCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Impossible de supprimer cette période car ${offersCount} offre(s) y sont associées`
            });
        }
        
        await period.softDelete(req.user?._id || 'system');
        
        logger.info(`Période archivée: ${period.nom} par ${req.user?.email || 'admin'}`);
        
        res.status(200).json({
            success: true,
            message: 'Période archivée avec succès'
        });
    } catch (error) {
        logger.error(`Erreur deletePeriod: ${error.message}`);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};