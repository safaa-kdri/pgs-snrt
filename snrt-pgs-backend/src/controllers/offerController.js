const Offer = require('../models/Offer');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const storageService = require('../services/storageService');
const { ROLES, OFFER_STATUS, CONCOURS_DOCUMENT_TYPES, STAFF_TREATMENT_ROLES, HR_ADMIN_ROLES } = require('../config/constants');


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
  const { statut, typeStage, departementId, periodeId, search, date, page = 1, limit = 20 } = req.query;
  const filter = {};

  console.log('📥 [listOffers] Paramètres reçus:', { statut, typeStage, departementId, periodeId, search, date, page, limit });

  if (!req.user || req.user.role === ROLES.ETUDIANT) {
    filter.statut = OFFER_STATUS.PUBLIEE;
  } else if (statut) {
    filter.statut = statut;
  }

  if (typeStage) filter.typeStage = typeStage;
  if (departementId) filter.departementId = departementId;
  if (periodeId) filter.periodeId = periodeId;
  
  if (search) {
    filter.$text = { $search: search };
    console.log('📥 [listOffers] Recherche textuelle:', search);
  }

  // ✅ SUPPORT DE LA DATE (recherche par date limite de candidature)
  if (date) {
    const searchDate = new Date(date);
    filter.$or = [
      { dateLimiteCandidature: { $lte: searchDate } },
      { dateDebut: { $lte: searchDate }, dateFin: { $gte: searchDate } }
    ];
    console.log('📥 [listOffers] Recherche par date:', date);
  }

  console.log('📥 [listOffers] Filter final:', JSON.stringify(filter, null, 2));

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

  // ✅ TRI AVEC PRIORITÉ AUX OFFRES DISPONIBLES (NON EXPIRÉES)
  // 1. Offres disponibles (dateLimiteCandidature >= aujourd'hui) : triées par date limite (proche → lointain)
  // 2. Offres expirées (dateLimiteCandidature < aujourd'hui) : en dernier
  const [offers, total] = await Promise.all([
    Offer.find(filter)
      .sort({ 
        // ✅ 1. Priorité : Offres disponibles (non expirées) en premier
        // MongoDB ne permet pas de tri conditionnel directement,
        // on utilise l'agrégation ou on trie en 2 étapes.
        // Solution : on trie par dateLimiteCandidature et on sépare
        dateLimiteCandidature: 1,
        // ✅ 2. datePublication en second tri
        datePublication: -1,
        // ✅ 3. createdAt en dernier
        createdAt: -1
      })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Offer.countDocuments(filter),
  ]);

  // ✅ TRI MANUEL : Offres disponibles en premier, expirées en dernier
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const sortedOffers = offers.sort((a, b) => {
    const dateA = a.dateLimiteCandidature ? new Date(a.dateLimiteCandidature) : null;
    const dateB = b.dateLimiteCandidature ? new Date(b.dateLimiteCandidature) : null;
    
    // Mettre à minuit pour comparer les dates
    if (dateA) dateA.setHours(0, 0, 0, 0);
    if (dateB) dateB.setHours(0, 0, 0, 0);
    
    const aExpired = !dateA || dateA < today;
    const bExpired = !dateB || dateB < today;
    
    // ✅ 1. Priorité : Offres disponibles (non expirées) en premier
    if (aExpired && !bExpired) return 1;
    if (!aExpired && bExpired) return -1;
    
    // ✅ 2. Pour les offres disponibles : tri par date limite (proche → lointain)
    if (!aExpired && !bExpired) {
      if (!dateA) return 1;
      if (!dateB) return -1;
      return dateA - dateB;
    }
    
    // ✅ 3. Pour les offres expirées : tri par date limite (proche → lointain)
    if (aExpired && bExpired) {
      if (!dateA) return 1;
      if (!dateB) return -1;
      return dateB - dateA; // Expirées : les plus anciennes en premier
    }
    
    return 0;
  });

  console.log(`📥 [listOffers] ${sortedOffers.length} offres trouvées sur ${total}`);
  console.log(`📥 [listOffers] Tri : disponibles en premier, expirées en dernier`);

  return res.status(200).json({
    success: true,
    offers: sortedOffers,
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
  if (!HR_ADMIN_ROLES.includes(req.user.role)) {
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
  if (!isOwner && !HR_ADMIN_ROLES.includes(req.user.role)) {
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


const uploadConcoursDocument = asyncHandler(async (req, res) => {
  if (!STAFF_TREATMENT_ROLES.includes(req.user.role)) {
    throw ApiError.forbidden('Seuls le departement ou le RH peuvent publier un document de concours.');
  }

  const offer = await Offer.findById(req.params.id);
  if (!offer) throw ApiError.notFound('Offre introuvable.');

  const isOwner = offer.createurId.toString() === req.user.id;
  if (req.user.role === ROLES.DEPARTEMENT && !isOwner) {
    throw ApiError.forbidden('Vous ne pouvez publier des documents que sur vos propres offres.');
  }

  const { type } = req.body;
  if (!CONCOURS_DOCUMENT_TYPES.includes(type)) {
    throw ApiError.badRequest(`Type de document invalide. Valeurs autorisees : ${CONCOURS_DOCUMENT_TYPES.join(', ')}.`);
  }
  if (!req.file) {
    throw ApiError.badRequest('Aucun fichier fourni.');
  }


  const replacedDocs = offer.documentsConcours.filter((doc) => doc.type === type);
  offer.documentsConcours = offer.documentsConcours.filter((doc) => doc.type !== type);
  offer.documentsConcours.push({
    type,
    nomOriginal: req.file.originalname,
    nomStocke: req.file.filename,
    chemin: req.file.path,
    url: `/uploads/concours/${req.file.filename}`,
    mimeType: req.file.mimetype,
    taille: req.file.size,
    publieParId: req.user.id,
  });

  await offer.save();

  if (replacedDocs.length > 0) {
    await Promise.all(
      replacedDocs.map((doc) =>
        storageService.deletePhysicalFile(doc).catch((err) => {
          logger.warn(`[Offer] Fichier de concours remplace non supprime du disque (${doc.chemin}): ${err.message}`);
        })
      )
    );
  }

  logger.audit('OFFER_CONCOURS_DOCUMENT_UPLOADED', { offerId: offer._id.toString(), type, userId: req.user.id });

  return res.status(201).json({ success: true, message: 'Document de concours publie avec succes.', offer });
});

const deleteConcoursDocument = asyncHandler(async (req, res) => {
  if (!STAFF_TREATMENT_ROLES.includes(req.user.role)) {
    throw ApiError.forbidden("Vous n'avez pas les droits pour supprimer ce document.");
  }

  const offer = await Offer.findById(req.params.id);
  if (!offer) throw ApiError.notFound('Offre introuvable.');

  const isOwner = offer.createurId.toString() === req.user.id;
  if (req.user.role === ROLES.DEPARTEMENT && !isOwner) {
    throw ApiError.forbidden('Vous ne pouvez supprimer que les documents de vos propres offres.');
  }


  const docToDelete = offer.documentsConcours.find((doc) => doc._id.toString() === req.params.docId);
  if (!docToDelete) {
    throw ApiError.notFound('Document introuvable.');
  }

  offer.documentsConcours = offer.documentsConcours.filter((doc) => doc._id.toString() !== req.params.docId);

  await offer.save();

  await storageService.deletePhysicalFile(docToDelete).catch((err) => {
    logger.warn(`[Offer] Fichier de concours supprime non retire du disque (${docToDelete.chemin}): ${err.message}`);
  });

  logger.audit('OFFER_CONCOURS_DOCUMENT_DELETED', {
    offerId: offer._id.toString(),
    docId: req.params.docId,
    userId: req.user.id,
  });

  return res.status(200).json({ success: true, message: 'Document supprime avec succes.' });
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
  uploadConcoursDocument,
  deleteConcoursDocument,
};