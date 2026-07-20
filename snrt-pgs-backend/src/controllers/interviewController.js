const Interview = require('../models/Interview');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const { getModelSafe } = require('../utils/lazyModel');
const { ROLES, APPLICATION_STATUS } = require('../config/constants');



async function notifyStudentInterviewScheduled(application, interview) {
  try {
    // services/emailService.js (Mohammed) - notification non bloquante.
    const { sendInterviewScheduledEmail } = require('../services/emailService');
    if (application?.etudiantEmail) {
      await sendInterviewScheduledEmail(application.etudiantEmail, interview);
    }
  } catch (err) {
    logger.warn(`[Interview] Notification email non envoyee: ${err.message}`);
  }
}


const createInterview = asyncHandler(async (req, res) => {
  if (![ROLES.RH, ROLES.DEPARTEMENT, ROLES.ADMIN].includes(req.user.role)) {
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


const getInterviewById = asyncHandler(async (req, res) => {
  if (req.user.role === ROLES.ETUDIANT) throw ApiError.forbidden('Acces reserve au personnel interne.');

  const interview = await Interview.findById(req.params.id);
  if (!interview) throw ApiError.notFound('Entretien introuvable.');

  return res.status(200).json({ success: true, interview });
});


const updateInterview = asyncHandler(async (req, res) => {
  if (![ROLES.RH, ROLES.DEPARTEMENT, ROLES.ADMIN].includes(req.user.role)) {
    throw ApiError.forbidden("Vous n'avez pas les droits pour modifier cet entretien.");
  }

  const interview = await Interview.findById(req.params.id);
  if (!interview) throw ApiError.notFound('Entretien introuvable.');

  Object.assign(interview, req.body);
  if (req.body.resultat && req.body.resultat !== 'EnAttente') {
    interview.statut = 'Realise';
  }

  await interview.save();
  logger.audit('INTERVIEW_UPDATED', { interviewId: interview._id.toString(), userId: req.user.id });

  return res.status(200).json({ success: true, message: 'Entretien mis a jour.', interview });
});


const cancelInterview = asyncHandler(async (req, res) => {
  if (![ROLES.RH, ROLES.DEPARTEMENT, ROLES.ADMIN].includes(req.user.role)) {
    throw ApiError.forbidden("Vous n'avez pas les droits pour annuler cet entretien.");
  }

  const interview = await Interview.findById(req.params.id);
  if (!interview) throw ApiError.notFound('Entretien introuvable.');

  interview.statut = 'Annule';
  await interview.save();

  logger.audit('INTERVIEW_CANCELLED', { interviewId: interview._id.toString(), userId: req.user.id });

  return res.status(200).json({ success: true, message: 'Entretien annule.', interview });
});

module.exports = {
  createInterview,
  listInterviews,
  getInterviewById,
  updateInterview,
  cancelInterview,
};
