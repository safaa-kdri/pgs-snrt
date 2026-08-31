// src/routes/interviewRoutes.js
const express = require('express');
const interviewController = require('../controllers/interviewController');
const validate = require('../middlewares/validation');
const { authenticate, authorize } = require('../middlewares/auth');
const { ROLES } = require('../config/constants');
const { createInterviewSchema, updateInterviewSchema } = require('../utils/validators');

const router = express.Router();

// Authentification requise pour toutes les routes
router.use(authenticate());

// Route pour rechercher des candidats par CIN
router.get(
  '/candidates/search',
  authorize(ROLES.RH, ROLES.DEPARTEMENT),
  async (req, res, next) => {
    try {
      const { q } = req.query;
      if (!q || q.length < 2) {
        return res.status(200).json({ success: true, candidates: [] });
      }

      const UtilisateurExterne = require('../models/UtilisateurExterne');
      const students = await UtilisateurExterne.find({
        $or: [
          { cin: { $regex: q, $options: 'i' } },
          { nom: { $regex: q, $options: 'i' } },
          { prenom: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } }
        ],
        actif: true
      }).limit(20);

      // Récupérer les candidatures associées
      const Application = require('../models/Application');
      const applications = await Application.find({
        etudiantId: { $in: students.map(s => s._id) },
        statut: { $in: ['Soumise', 'EnAnalyse'] }
      }).populate('offreId', 'titre');

      // Formater la réponse
      const candidates = applications.map(app => {
        const student = students.find(s => s._id.toString() === app.etudiantId.toString());
        return {
          applicationId: app._id,
          offreTitre: app.offreId?.titre || 'Offre inconnue',
          etudiant: {
            id: student?._id,
            cin: student?.cin,
            nom: student?.nom,
            prenom: student?.prenom,
            email: student?.email,
            telephone: student?.telephone
          },
          statut: app.statut
        };
      });

      return res.status(200).json({ success: true, candidates });
    } catch (error) {
      next(error);
    }
  }
);

// Route pour récupérer les candidats valides par offre
router.get(
  '/candidates/by-offer/:offerId',
  authorize(ROLES.RH, ROLES.DEPARTEMENT),
  interviewController.getCandidatesByOffer
);

// Routes pour le département
router.get(
  '/department',
  authorize(ROLES.DEPARTEMENT),
  interviewController.listDepartmentInterviews
);

// Routes existantes modifiees
router.post(
  '/',
  validate(createInterviewSchema),
  interviewController.createInterview
);
router.get('/', interviewController.listInterviews);
router.get('/:id', interviewController.getInterviewById);
router.put('/:id', validate(updateInterviewSchema), interviewController.updateInterview);
router.put('/:id/cancel', interviewController.cancelInterview);

module.exports = router;