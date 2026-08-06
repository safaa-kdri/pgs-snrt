// src/controllers/interviewController.js
const Interview = require('../models/Interview');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const { getModelSafe } = require('../utils/lazyModel');
const { assertDepartmentOwnsOffer, departmentOfferIds } = require('../utils/departmentScope');
const { ROLES, APPLICATION_STATUS, STAFF_TREATMENT_ROLES } = require('../config/constants');



async function notifyStudentInterviewScheduled(application, interview) {
  try {
    const { sendInterviewScheduledEmail } = require('../services/emailService');
    if (application?.etudiantEmail) {
      await sendInterviewScheduledEmail(application.etudiantEmail, interview);
    }
  } catch (err) {
    logger.warn(`[Interview] Notification email non envoyee: ${err.message}`);
  }
}


async function assertDepartmentOwnsInterview(req, interview) {
  if (req.user.role !== ROLES.DEPARTEMENT) return;

  const Application = getModelSafe('Application');
  if (!Application) return; 

  const application = await Application.findById(interview.applicationId).select('offreId');
  if (!application) throw ApiError.notFound('Candidature associee introuvable.');

  await assertDepartmentOwnsOffer(req, application.offreId);
}


const createInterview = asyncHandler(async (req, res) => {
  if (!STAFF_TREATMENT_ROLES.includes(req.user.role)) {
    throw ApiError.forbidden('Seuls le RH ou le departement peuvent planifier un entretien.');
  }

  const Application = getModelSafe('Application');
  if (!Application) {
    throw ApiError.internal(
      "Le module Candidatures (models/Application.js) n'est pas encore disponible sur cet environnement."
    );
  }

  const application = await Application.findById(req.body.applicationId);
  if (!application) throw ApiError.notFound('Candidature introuvable.');

  await assertDepartmentOwnsOffer(req, application.offreId);

  if (![APPLICATION_STATUS.EN_ANALYSE, APPLICATION_STATUS.SOUMISE].includes(application.statut)) {
    throw ApiError.badRequest(
      "Un entretien ne peut etre planifie que pour une candidature soumise ou en cours d'analyse."
    );
  }

  const interview = await Interview.create({
    ...req.body,
    planificateurId: req.user.id,
  });

  application.statut = APPLICATION_STATUS.ENTRETIEN;
  await application.save();

  logger.audit('INTERVIEW_SCHEDULED', {
    interviewId: interview._id.toString(),
    applicationId: application._id.toString(),
    userId: req.user.id,
  });

  await notifyStudentInterviewScheduled(application, interview);

  return res.status(201).json({ success: true, message: 'Entretien planifie.', interview });
});


const listInterviews = asyncHandler(async (req, res) => {
  if (req.user.role === ROLES.ETUDIANT) {
    throw ApiError.forbidden('Acces reserve au personnel interne.');
  }

  const { applicationId, statut, from, to, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (applicationId) filter.applicationId = applicationId;
  if (statut) filter.statut = statut;
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);
  }

  if (applicationId) {
    const Application = getModelSafe('Application');
    if (Application) {
      const application = await Application.findById(applicationId).select('offreId');
      if (application) {
        await assertDepartmentOwnsOffer(req, application.offreId);
      }
    }
  } else {
    const restrictedOfferIds = await departmentOfferIds(req);
    if (restrictedOfferIds !== null) {
      const Application = getModelSafe('Application');
      const applicationIds = Application
        ? (await Application.find({ offreId: { $in: restrictedOfferIds } }).select('_id')).map((a) => a._id)
        : [];
      filter.applicationId = { $in: applicationIds };
    }
  }

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

  const [interviews, total] = await Promise.all([
    Interview.find(filter)
      .sort({ date: 1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Interview.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    interviews,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
});

// ============================================
// ✅ NOUVEAU : RÉCUPÉRER LES ENTRETIENS DU DÉPARTEMENT
// ============================================
const listDepartmentInterviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, statut } = req.query;
  
  // Récupérer l'ID du département de l'utilisateur
  const { departementId } = req.user;
  
  if (!departementId) {
    throw ApiError.forbidden("Votre compte n'est rattaché à aucun département.");
  }

  const Offer = getModelSafe('Offer');
  if (!Offer) {
    throw ApiError.internal("Le module Offres n'est pas disponible.");
  }

  // Récupérer toutes les offres du département
  const offerIds = await Offer.find({ departementId }).distinct('_id');
  
  if (offerIds.length === 0) {
    return res.status(200).json({
      success: true,
      interviews: [],
      pagination: { page: 1, limit, total: 0, pages: 0 }
    });
  }

  // Récupérer les candidatures liées aux offres du département
  const Application = getModelSafe('Application');
  if (!Application) {
    return res.status(200).json({
      success: true,
      interviews: [],
      pagination: { page: 1, limit, total: 0, pages: 0 }
    });
  }

  const applications = await Application.find({ offreId: { $in: offerIds } }).select('_id');
  const applicationIds = applications.map(a => a._id);

  if (applicationIds.length === 0) {
    return res.status(200).json({
      success: true,
      interviews: [],
      pagination: { page: 1, limit, total: 0, pages: 0 }
    });
  }

  // Construire le filtre
  const filter = { applicationId: { $in: applicationIds } };
  if (statut) filter.statut = statut;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

  const [interviews, total] = await Promise.all([
    Interview.find(filter)
      .sort({ date: 1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Interview.countDocuments(filter),
  ]);

  // Populer les données supplémentaires
  const populatedInterviews = await Promise.all(interviews.map(async (interview) => {
    const app = await Application.findById(interview.applicationId)
      .populate('etudiantId', 'nom prenom email')
      .populate('offreId', 'titre typeStage');
    return {
      ...interview.toObject(),
      candidat: app?.etudiantId || null,
      offre: app?.offreId || null,
    };
  }));

  return res.status(200).json({
    success: true,
    interviews: populatedInterviews,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
});


const getInterviewById = asyncHandler(async (req, res) => {
  if (req.user.role === ROLES.ETUDIANT) throw ApiError.forbidden('Acces reserve au personnel interne.');

  const interview = await Interview.findById(req.params.id);
  if (!interview) throw ApiError.notFound('Entretien introuvable.');

  await assertDepartmentOwnsInterview(req, interview);

  return res.status(200).json({ success: true, interview });
});


const updateInterview = asyncHandler(async (req, res) => {
  if (!STAFF_TREATMENT_ROLES.includes(req.user.role)) {
    throw ApiError.forbidden("Vous n'avez pas les droits pour modifier cet entretien.");
  }

  const interview = await Interview.findById(req.params.id);
  if (!interview) throw ApiError.notFound('Entretien introuvable.');

  await assertDepartmentOwnsInterview(req, interview);

  Object.assign(interview, req.body);
  if (req.body.resultat && req.body.resultat !== 'EnAttente') {
    interview.statut = 'Realise';
  }

  await interview.save();
  logger.audit('INTERVIEW_UPDATED', { interviewId: interview._id.toString(), userId: req.user.id });

  return res.status(200).json({ success: true, message: 'Entretien mis a jour.', interview });
});


const cancelInterview = asyncHandler(async (req, res) => {
  if (!STAFF_TREATMENT_ROLES.includes(req.user.role)) {
    throw ApiError.forbidden("Vous n'avez pas les droits pour annuler cet entretien.");
  }

  const interview = await Interview.findById(req.params.id);
  if (!interview) throw ApiError.notFound('Entretien introuvable.');

  await assertDepartmentOwnsInterview(req, interview);

  interview.statut = 'Annule';
  await interview.save();

  logger.audit('INTERVIEW_CANCELLED', { interviewId: interview._id.toString(), userId: req.user.id });

  return res.status(200).json({ success: true, message: 'Entretien annule.', interview });
});

// ============================================
// ✅ EXPORTATION AVEC LA NOUVELLE FONCTION
// ============================================
module.exports = {
  createInterview,
  listInterviews,
  listDepartmentInterviews,
  getInterviewById,
  updateInterview,
  cancelInterview,
};