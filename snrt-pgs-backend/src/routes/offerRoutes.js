const express = require('express');
const offerController = require('../controllers/offerController');
const validate = require('../middlewares/validation');
const { authenticate, optionalAuthenticate } = require('../middlewares/auth');
const { createOfferSchema, updateOfferSchema, validateOfferSchema } = require('../utils/validators');

const router = express.Router();


router.get('/', optionalAuthenticate(), offerController.listOffers);
router.get('/:id', optionalAuthenticate(), offerController.getOfferById);


router.post('/', authenticate(), validate(createOfferSchema), offerController.createOffer);
router.put('/:id', authenticate(), validate(updateOfferSchema), offerController.updateOffer);
router.put('/:id/submit', authenticate(), offerController.submitOffer);
router.put('/:id/validate', authenticate(), validate(validateOfferSchema), offerController.validateOffer);
router.put('/:id/archive', authenticate(), offerController.archiveOffer);
router.delete('/:id', authenticate(), offerController.deleteOffer);

module.exports = router;