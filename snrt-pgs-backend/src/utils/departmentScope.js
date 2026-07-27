// src/utils/departmentScope.js
const Offer = require('../models/Offer');
const ApiError = require('./ApiError');
const { ROLES } = require('../config/constants');

/**
 * NOUVEAU (correctif #8 de l'audit) : jusqu'ici, un utilisateur DEPARTEMENT
 * pouvait consulter/modifier des candidatures et planifier des entretiens
 * pour N'IMPORTE QUELLE offre du systeme, pas seulement celles de son
 * propre departement - alors que offerController impose deja cette regle
 * partout (voir le check `isOwner` sur updateOffer/submitOffer/
 * uploadConcoursDocument/deleteConcoursDocument). C'est la meme classe de
 * probleme que les failles IDOR etudiant deja corrigees (isOwnerOrStaff
 * dans applicationController.js) : un acteur du personnel voit/modifie des
 * donnees hors de son perimetre legitime. RH et Administrateur restent
 * volontairement SANS restriction : d'apres le cahier des charges (5.1,
 * 5.3), le RH supervise l'ensemble des offres/candidatures/entretiens de
 * tous les departements, ce n'est pas une lacune a corriger.
 */

// Verifie qu'une offre precise appartient bien au departement de
// l'utilisateur DEPARTEMENT courant. Ne fait rien pour RH/Admin/Encadrant.
// A utiliser pour les actions ciblant UNE ressource (get by id, changement
// de statut, planification d'un entretien...).
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

// Renvoie la liste des offreId appartenant au departement de l'utilisateur
// DEPARTEMENT courant, pour construire un filtre `{ offreId: { $in: ... } }`
// sur les listes (GET /applications, GET /interviews). Renvoie `null` pour
// RH/Admin/Encadrant, ce qui signifie explicitement "aucune restriction" -
// a distinguer d'un tableau vide, qui signifie "aucune offre, donc aucun
// resultat".
async function departmentOfferIds(req) {
  if (req.user.role !== ROLES.DEPARTEMENT) return null;
  if (!req.user.departementId) return [];

  const offers = await Offer.find({ departementId: req.user.departementId }).select('_id');
  return offers.map((o) => o._id);
}

module.exports = { assertDepartmentOwnsOffer, departmentOfferIds };
