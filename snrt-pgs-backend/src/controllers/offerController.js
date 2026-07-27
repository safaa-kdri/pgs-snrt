const Offer = require('../models/Offer');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const { ROLES, OFFER_STATUS } = require('../config/constants');


const createOffer = asyncHandler(async (req, res) => {
  if (![ROLES.DEPARTEMENT, ROLES.ADMIN].includes(req.user.role)) {
    throw ApiError.forbidden('Seul un responsable de departement peut creer une offre.');
  }

  const offer = await Offer.create({
    ...req.body,
    departementId: req.user.departementId || req.body.departementId,
    createurId: req.user.id,
    statut: OFFER_STATUS.BROUILLON,
  });

  logger.audit('OFFER_CREATED', { offerId: offer._id.toString(), userId: req.user.id });

  return res.status(201).json({ success: true, message: 'Offre creee (brouillon).', offer });
});


const listOffers = asyncHandler(async (req, res) => {
  const { statut, typeStage, departementId, periodeId, search, page = 1, limit = 20 } = req.query;
  const filter = {};



  if (!req.user || req.user.role === ROLES.ETUDIANT) {
    filter.statut = OFFER_STATUS.PUBLIEE;
  } else if (statut) {
    filter.statut = statut;
  }

  if (typeStage) filter.typeStage = typeStage;
  if (departementId) filter.departementId = departementId;
  if (periodeId) filter.periodeId = periodeId;
  if (search) filter.$text = { $search: search };

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

  const [offers, total] = await Promise.all([
    Offer.find(filter)
      .sort({ datePublication: -1, createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Offer.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    offers,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
});


const getOfferById = asyncHandler(async (req, res) => {
  const offer = await Offer.findById(req.params.id);
  if (!offer) throw ApiError.notFound('Offre introuvable.');

  if ((!req.user || req.user.role === ROLES.ETUDIANT) && offer.statut !== OFFER_STATUS.PUBLIEE) {
    throw ApiError.notFound('Offre introuvable.');
  }

  return res.status(200).json({ success: true, offer });
});


const updateOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.findById(req.params.id);
  if (!offer) throw ApiError.notFound('Offre introuvable.');

  const isOwner = offer.createurId.toString() === req.user.id;
  if (!isOwner && req.user.role !== ROLES.ADMIN) {
    throw ApiError.forbidden('Vous ne pouvez modifier que vos propres offres.');
  }

  if (![OFFER_STATUS.BROUILLON, OFFER_STATUS.REFUSEE].includes(offer.statut)) {
    throw ApiError.badRequest('Seule une offre en brouillon ou refusee peut etre modifiee.');
  }

  Object.assign(offer, req.body);
  if (offer.statut === OFFER_STATUS.REFUSEE) {
    offer.statut = OFFER_STATUS.BROUILLON; 
    offer.motifRefus = null;
  }

  await offer.save();
  logger.audit('OFFER_UPDATED', { offerId: offer._id.toString(), userId: req.user.id });

  return res.status(200).json({ success: true, message: 'Offre mise a jour.', offer });
});


const submitOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.findById(req.params.id);
  if (!offer) throw ApiError.notFound('Offre introuvable.');

  const isOwner = offer.createurId.toString() === req.user.id;
  if (!isOwner && req.user.role !== ROLES.ADMIN) {
    throw ApiError.forbidden('Vous ne pouvez soumettre que vos propres offres.');
  }
  if (offer.statut !== OFFER_STATUS.BROUILLON) {
    throw ApiError.badRequest('Seule une offre en brouillon peut etre soumise pour validation.');
  }

  offer.statut = OFFER_STATUS.EN_ATTENTE;
  await offer.save();

  logger.audit('OFFER_SUBMITTED', { offerId: offer._id.toString(), userId: req.user.id });

  return res.status(200).json({ success: true, message: 'Offre soumise pour validation RH.', offer });
});


const validateOffer = asyncHandler(async (req, res) => {
  if (![ROLES.RH, ROLES.ADMIN].includes(req.user.role)) {
    throw ApiError.forbidden('Seul le service RH peut valider une offre.');
  }

  const offer = await Offer.findById(req.params.id);
  if (!offer) throw ApiError.notFound('Offre introuvable.');

  if (offer.statut !== OFFER_STATUS.EN_ATTENTE) {
    throw ApiError.badRequest('Seule une offre en attente de validation peut etre traitee.');
  }

  const { decision, motifRefus } = req.body; 

  offer.statut = decision;
  offer.validateurId = req.user.id;

  if (decision === OFFER_STATUS.PUBLIEE) {
    offer.datePublication = new Date();
    offer.motifRefus = null;
  } else {
    offer.motifRefus = motifRefus;
  }

  await offer.save();
  logger.audit('OFFER_VALIDATED', { offerId: offer._id.toString(), decision, userId: req.user.id });

  return res.status(200).json({ success: true, message: `Offre ${decision === 'Publiee' ? 'publiee' : 'refusee'}.`, offer });
});


const archiveOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.findById(req.params.id);
  if (!offer) throw ApiError.notFound('Offre introuvable.');

  const isOwner = offer.createurId.toString() === req.user.id;
  if (!isOwner && ![ROLES.RH, ROLES.ADMIN].includes(req.user.role)) {
    throw ApiError.forbidden("Vous n'avez pas les droits pour archiver cette offre.");
  }

  offer.statut = OFFER_STATUS.ARCHIVEE;
  await offer.save();

  logger.audit('OFFER_ARCHIVED', { offerId: offer._id.toString(), userId: req.user.id });

  return res.status(200).json({ success: true, message: 'Offre archivee.', offer });
});


const deleteOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.findById(req.params.id);
  if (!offer) throw ApiError.notFound('Offre introuvable.');

  const isOwner = offer.createurId.toString() === req.user.id;
  if (!isOwner && req.user.role !== ROLES.ADMIN) {
    throw ApiError.forbidden('Vous ne pouvez supprimer que vos propres brouillons.');
  }
  if (offer.statut !== OFFER_STATUS.BROUILLON) {
    throw ApiError.badRequest("Seul un brouillon jamais soumis peut etre supprime. Utilisez l'archivage sinon.");
  }

  await offer.deleteOne();
  logger.audit('OFFER_DELETED', { offerId: offer._id.toString(), userId: req.user.id });

  return res.status(200).json({ success: true, message: 'Brouillon supprime.' });
});

module.exports = {
  createOffer,
  listOffers,
  getOfferById,
  updateOffer,
  submitOffer,
  validateOffer,
  archiveOffer,
  deleteOffer,
};