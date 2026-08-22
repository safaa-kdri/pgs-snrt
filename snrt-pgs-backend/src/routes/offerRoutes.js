const express = require('express');
const offerController = require('../controllers/offerController');
const validate = require('../middlewares/validation');
const uploadConcours = require('../middlewares/uploadConcours');
const { authenticate, optionalAuthenticate } = require('../middlewares/auth');
const { createOfferSchema, updateOfferSchema, validateOfferSchema } = require('../utils/validators');

const router = express.Router();

// Routes publiques (ou avec authentification optionnelle)
router.get('/', optionalAuthenticate(), offerController.listOffers);
router.get('/:id', optionalAuthenticate(), offerController.getOfferById);

// Routes protegees
router.post('/', authenticate(), validate(createOfferSchema), offerController.createOffer);
router.put('/:id', authenticate(), validate(updateOfferSchema), offerController.updateOffer);
router.put('/:id/submit', authenticate(), offerController.submitOffer);
router.put('/:id/validate', authenticate(), validate(validateOfferSchema), offerController.validateOffer);
router.put('/:id/archive', authenticate(), offerController.archiveOffer);
router.delete('/:id', authenticate(), offerController.deleteOffer);

// NOUVELLE ROUTE : Recuperer les offres du departement
router.get('/my-offers', authenticate(), offerController.getMyOffers);

// ============================================
// RESULTATS D'UNE OFFRE
// ============================================
// Recuperer les resultats d'une offre
router.get(
  '/:id/results',
  optionalAuthenticate(),
  offerController.getOfferResults
);

// Mettre a jour la description des resultats
router.put(
  '/:id/results/description',
  authenticate(),
  offerController.updateOfferResults
);

// ============================================
// REGENERER LE PDF DES RESULTATS
// ============================================
router.post(
  '/:id/regenerate-results',
  authenticate(),
  offerController.regenerateResultsPdf
);

// Routes pour les documents de concours
router.post(
  '/:id/concours-documents',
  authenticate(),
  uploadConcours.single('document'),
  offerController.uploadConcoursDocument
);
router.delete('/:id/concours-documents/:docId', authenticate(), offerController.deleteConcoursDocument);

module.exports = router;