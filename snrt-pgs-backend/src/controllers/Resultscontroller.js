// src/controllers/resultsController.js
const Offer = require('../models/Offer');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { CONCOURS_DOCUMENT_TYPES } = require('../config/constants');


const RESULT_DOC_TYPE = 'ResultatConcours';

function extractResultatDoc(offer) {
  return offer.documentsConcours.find((doc) => doc.type === RESULT_DOC_TYPE) || null;
}

const getResults = asyncHandler(async (req, res) => {
  const { offreId, page = 1, limit = 20 } = req.query;

  const filter = { 'documentsConcours.type': RESULT_DOC_TYPE };
  if (offreId) filter._id = offreId;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

  const [offers, total] = await Promise.all([
    Offer.find(filter)
      .select('titre typeStage nbPostes dateLimiteCandidature datePublication departementId documentsConcours')
    
      .sort({ 'documentsConcours.datePublication': -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Offer.countDocuments(filter),
  ]);

  const results = offers.map((offer) => {
    const resultatDoc = extractResultatDoc(offer);
    return {
      offreId: offer._id,
      titre: offer.titre,
      typeStage: offer.typeStage,
      nbPostes: offer.nbPostes,
      dateLimiteCandidature: offer.dateLimiteCandidature,
      departementId: offer.departementId,
      resultatPublieLe: resultatDoc?.datePublication || null,
      resultatUrl: resultatDoc?.url || null,
    };
  });

  return res.status(200).json({
    success: true,
    results,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  });
});


const getResultDetail = asyncHandler(async (req, res) => {
  const offer = await Offer.findById(req.params.id);
  if (!offer) throw ApiError.notFound('Offre introuvable.');

  const hasPublishedResult = offer.documentsConcours.some((doc) => doc.type === RESULT_DOC_TYPE);
  if (!hasPublishedResult) {
    throw ApiError.notFound("Aucun resultat de concours n'est encore publie pour cette offre.");
  }

  return res.status(200).json({
    success: true,
    offre: {
      id: offer._id,
      titre: offer.titre,
      description: offer.description,
      typeStage: offer.typeStage,
      nbPostes: offer.nbPostes,
      sujets: offer.sujets,
      documentsConcours: offer.documentsConcours.filter((doc) => CONCOURS_DOCUMENT_TYPES.includes(doc.type)),
    },
  });
});

module.exports = { getResults, getResultDetail };