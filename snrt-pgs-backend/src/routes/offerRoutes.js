const express = require('express');
const offerController = require('../controllers/offerController');
const validate = require('../middlewares/validation');
const { authenticate } = require('../middlewares/auth');
const { createOfferSchema, updateOfferSchema, validateOfferSchema } = require('../utils/validators');

const router = express.Router();

// Toutes les routes "offres" necessitent une session active ; le filtrage
// fin par role (Etudiant / Departement / RH) est gere dans le controleur.
router.use(authenticate());

router.get('/', offerController.listOffers);
router.get('/:id', offerController.getOfferById);
router.post('/', validate(createOfferSchema), offerController.createOffer);
router.put('/:id', validate(updateOfferSchema), offerController.updateOffer);
router.put('/:id/submit', offerController.submitOffer);
router.put('/:id/validate', validate(validateOfferSchema), offerController.validateOffer);
router.put('/:id/archive', offerController.archiveOffer);
router.delete('/:id', offerController.deleteOffer);

module.exports = router;
