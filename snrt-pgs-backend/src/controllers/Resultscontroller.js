// src/controllers/resultsController.js
// CORRECTION : Recuperer les resultats des stages clotures avec les candidatures
// MODIFICATION : Inclure la description dans les resultats

const Offer = require('../models/Offer');
const Application = require('../models/Application');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { CONCOURS_DOCUMENT_TYPES } = require('../config/constants');
const path = require('path');

const RESULT_DOC_TYPE = 'ResultatConcours';

function extractResultatDoc(offer) {
  return offer.documentsConcours.find((doc) => doc.type === RESULT_DOC_TYPE) || null;
}

// ============================================
// GET - Recuperer les resultats des offres cloturees
// ============================================
const getResults = asyncHandler(async (req, res) => {
  const { offreId, page = 1, limit = 20 } = req.query;

  // Chercher les offres avec resultatsPublies = true
  const filter = { resultatsPublies: true };
  if (offreId) filter._id = offreId;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

  const [offers, total] = await Promise.all([
    Offer.find(filter)
      .select('titre typeStage nbPostes dateLimiteCandidature datePublication departementId resultatsPdfPath dateCloture nbAcceptes nbRefuses resultatsDescription')
      .populate('departementId', 'nom')
      .sort({ dateCloture: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean(),
    Offer.countDocuments(filter),
  ]);

  const results = offers.map((offer) => ({
    _id: offer._id,
    titreOffre: offer.titre || 'Offre sans titre',
    typeStage: offer.typeStage || 'Stage',
    nbPostes: offer.nbPostes || 0,
    departementId: offer.departementId,
    departementNom: offer.departementId?.nom || 'Departement',
    dateCloture: offer.dateCloture || offer.updatedAt,
    resultatsPublies: true,
    resultatsPdfPath: offer.resultatsPdfPath,
    nbAcceptes: offer.nbAcceptes || 0,
    nbRefuses: offer.nbRefuses || 0,
    resultatsDescription: offer.resultatsDescription || '',
  }));

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

// ============================================
// GET - Recuperer le detail des resultats d'une offre
// ============================================
const getResultDetail = asyncHandler(async (req, res) => {
  const offer = await Offer.findById(req.params.id)
    .populate('departementId', 'nom')
    .lean();

  if (!offer) throw ApiError.notFound('Offre introuvable.');

  // Verifier que les resultats sont publies
  if (!offer.resultatsPublies) {
    throw ApiError.notFound('Les resultats ne sont pas encore disponibles.');
  }

  // Recuperer les candidatures acceptees
  const acceptees = await Application.find({
    offreId: offer._id,
    statut: 'Acceptee'
  }).populate('etudiantId', 'nom prenom email');

  // Recuperer les candidatures refusees
  const refusees = await Application.find({
    offreId: offer._id,
    statut: 'Refusee'
  }).populate('etudiantId', 'nom prenom email');

  // Construire l'URL publique du PDF
  let pdfUrl = null;
  if (offer.resultatsPdfPath) {
    const apiRoot = process.env.API_URL || 'http://localhost:5000';
    // Si le chemin commence par /uploads, l'utiliser directement
    if (offer.resultatsPdfPath.startsWith('/uploads')) {
      pdfUrl = `${apiRoot}${offer.resultatsPdfPath}`;
    } else {
      pdfUrl = `${apiRoot}/uploads/resultats/${path.basename(offer.resultatsPdfPath)}`;
    }
  }

  return res.status(200).json({
    success: true,
    data: {
      offer: {
        _id: offer._id,
        titre: offer.titre,
        typeStage: offer.typeStage,
        nbPostes: offer.nbPostes,
        departementNom: offer.departementId?.nom || 'Departement',
        resultatsPublies: offer.resultatsPublies,
        dateCloture: offer.dateCloture,
        nbAcceptes: offer.nbAcceptes || acceptees.length,
        nbRefuses: offer.nbRefuses || refusees.length,
        resultatsPdfPath: pdfUrl,
        // AJOUTER LA DESCRIPTION
        resultatsDescription: offer.resultatsDescription || '',
      },
      acceptees: acceptees.map(a => ({
        id: a._id,
        etudiant: {
          nom: a.etudiantId?.nom || '',
          prenom: a.etudiantId?.prenom || '',
          email: a.etudiantId?.email || '',
        }
      })),
      refusees: refusees.map(a => ({
        id: a._id,
        etudiant: {
          nom: a.etudiantId?.nom || '',
          prenom: a.etudiantId?.prenom || '',
          email: a.etudiantId?.email || '',
        }
      })),
    }
  });
});

// ============================================
// EXPORTS
// ============================================
module.exports = { getResults, getResultDetail };