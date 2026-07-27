// src/utils/departmentScope.js
const Offer = require('../models/Offer');
const ApiError = require('./ApiError');
const { ROLES } = require('../config/constants');


async function assertDepartmentOwnsOffer(req, offreId) {
  if (req.user.role !== ROLES.DEPARTEMENT) return;

  if (!req.user.departementId) {
    throw ApiError.forbidden("Votre compte n'est rattache a aucun departement.");
  }

  const offer = await Offer.findById(offreId).select('departementId');
  if (!offer) throw ApiError.notFound('Offre introuvable.');

  if (offer.departementId.toString() !== req.user.departementId.toString()) {
    throw ApiError.forbidden("Vous n'avez acces qu'aux ressources liees a votre propre departement.");
  }
}


async function departmentOfferIds(req) {
  if (req.user.role !== ROLES.DEPARTEMENT) return null;
  if (!req.user.departementId) return [];

  const offers = await Offer.find({ departementId: req.user.departementId }).select('_id');
  return offers.map((o) => o._id);
}

module.exports = { assertDepartmentOwnsOffer, departmentOfferIds };
