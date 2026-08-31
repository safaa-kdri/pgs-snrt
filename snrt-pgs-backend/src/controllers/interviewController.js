// src/controllers/interviewController.js
const Interview = require('../models/Interview');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const { getModelSafe } = require('../utils/lazyModel');
const { assertDepartmentOwnsOffer, departmentOfferIds } = require('../utils/departmentScope');
const { ROLES, APPLICATION_STATUS, STAFF_TREATMENT_ROLES } = require('../config/constants');

// Nouvelle fonction : Récupérer les candidatures par CIN
async function getApplicationsByCIN(cinList) {
  const UtilisateurExterne = getModelSafe('UtilisateurExterne');
  if (!UtilisateurExterne) {
    throw new Error('Module UtilisateurExterne non disponible');
  }

  // Rechercher les étudiants par leur CIN
  const students = await UtilisateurExterne.find({
    cin: { $in: cinList },
    actif: true
  }).select('_id');

  if (students.length === 0) {
    throw ApiError.badRequest('Aucun étudiant trouvé avec les CIN fournis');
  }

  const studentIds = students.map(s => s._id);

  // Récupérer les candidatures de ces étudiants
  const Application = getModelSafe('Application');
  const applications = await Application.find({
    etudiantId: { $in: studentIds },
    statut: { $in: ['Soumise', 'EnAnalyse'] }
  });

  if (applications.length === 0) {
    throw ApiError.badRequest('Aucune candidature éligible trouvée pour ces étudiants');
  }

  return applications;
}

// Nouvelle fonction : Récupérer les candidats valides par offre
const getCandidatesByOffer = asyncHandler(async (req, res) => {
  const { offerId } = req.params;

  // Vérifier les droits
  await assertDepartmentOwnsOffer(req, offerId);

  const Application = getModelSafe('Application');
  if (!Application) {
    throw ApiError.internal('Module Application non disponible');
  }

  // UNIQUEMENT les candidatures avec statut "EnAnalyse"
  const applications = await Application.find({
    offreId: offerId,
    statut: APPLICATION_STATUS.EN_ANALYSE
  }).populate('etudiantId', 'nom prenom cin email telephone');

  if (applications.length === 0) {
    return res.status(200).json({
      success: true,
      candidates: [],
      message: 'Aucun candidat validé pour cette offre'
    });
  }

  // Formater la réponse
  const candidates = applications.map(app => ({
    applicationId: app._id,
    etudiant: {
      id: app.etudiantId._id,
      cin: app.etudiantId.cin,
      nom: app.etudiantId.nom,
      prenom: app.etudiantId.prenom,
      email: app.etudiantId.email,
      telephone: app.etudiantId.telephone,
    },
    offreId: offerId,
    statut: app.statut,
  }));

  return res.status(200).json({
    success: true,
    candidates,
    count: candidates.length,
  });
});

// Modification : notifyStudentInterviewScheduled
async function notifyStudentInterviewScheduled(studentEmail, interview, student) {
  try {
    const { sendInterviewScheduledEmail } = require('../services/emailService');
    await sendInterviewScheduledEmail({
      to: studentEmail,
      studentName: `${student.prenom} ${student.nom}`,
      date: interview.date,
      heure: interview.heure,
      type: interview.type,
      lieu: interview.lieu,
      lienVisio: interview.lienVisio,
      duree: interview.duree,
      commentaires: interview.commentaires
    });
  } catch (err) {
    logger.warn(`[Interview] Notification email non envoyée à ${studentEmail}: ${err.message}`);
  }
}

async function assertDepartmentOwnsInterview(req, interview) {
  if (req.user.role !== ROLES.DEPARTEMENT) return;

  const Application = getModelSafe('Application');
  if (!Application) return;

  // Vérifier toutes les candidatures associées à l'entretien
  for (const appId of interview.applicationIds) {
    const application = await Application.findById(appId).select('offreId');
    if (!application) throw ApiError.notFound('Candidature associée introuvable.');
    await assertDepartmentOwnsOffer(req, application.offreId);
  }
}

// Modification : createInterview (avec offreId et cins)
const createInterview = asyncHandler(async (req, res) => {
  if (!STAFF_TREATMENT_ROLES.includes(req.user.role)) {
    throw ApiError.forbidden('Seuls le RH ou le département peuvent planifier un entretien.');
  }

  // Récupérer les données (avec offreId et cins)
  const { offreId, cins, date, heure, duree, type, lieu, lienVisio, commentaires } = req.body;

  // Vérifier que cins est un tableau
  if (!cins || !Array.isArray(cins) || cins.length === 0) {
    throw ApiError.badRequest('Veuillez fournir au moins un CIN d\'étudiant');
  }

  if (!offreId) {
    throw ApiError.badRequest('Veuillez fournir une offre');
  }

  // Récupérer les candidatures par offre et CIN
  const UtilisateurExterne = getModelSafe('UtilisateurExterne');
  const Application = getModelSafe('Application');

  if (!UtilisateurExterne || !Application) {
    throw ApiError.internal('Modules nécessaires non disponibles');
  }

  // Rechercher les étudiants par CIN
  const students = await UtilisateurExterne.find({
    cin: { $in: cins },
    actif: true
  }).select('_id');

  if (students.length === 0) {
    throw ApiError.badRequest('Aucun étudiant trouvé avec les CIN fournis');
  }

  const studentIds = students.map(s => s._id);

  // Récupérer les candidatures pour cette offre
  const applications = await Application.find({
    offreId: offreId,
    etudiantId: { $in: studentIds },
    statut: { $in: ['Soumise', 'EnAnalyse'] }
  });

  if (applications.length === 0) {
    throw ApiError.badRequest('Aucune candidature éligible trouvée pour ces étudiants');
  }

  // Vérifier les droits départementaux
  for (const app of applications) {
    await assertDepartmentOwnsOffer(req, app.offreId);
  }

  // Normaliser le type (première lettre majuscule)
  const normalizedType = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();

  // Créer l'entretien avec applicationIds
  const interview = await Interview.create({
    applicationIds: applications.map(a => a._id),
    planificateurId: req.user.id,
    date,
    heure,
    duree: duree || 30,
    type: normalizedType,
    lieu: normalizedType === 'Presentiel' ? lieu : null,
    lienVisio: normalizedType === 'Visio' ? lienVisio : null,
    commentaires: commentaires || null,
    statut: 'Planifie',
    resultat: 'EnAttente'
  });

  // Mettre à jour le statut de TOUTES les candidatures
  await Application.updateMany(
    { _id: { $in: applications.map(a => a._id) } },
    { $set: { statut: APPLICATION_STATUS.ENTRETIEN } }
  );

  // Audit log
  logger.audit('INTERVIEW_SCHEDULED', {
    interviewId: interview._id.toString(),
    applicationIds: applications.map(a => a._id.toString()),
    userId: req.user.id,
    candidateCount: applications.length,
    offreId: offreId
  });

  // Envoyer les emails
  for (const app of applications) {
    await app.populate('etudiantId', 'email nom prenom');
    await notifyStudentInterviewScheduled(
      app.etudiantId.email, 
      interview, 
      app.etudiantId
    );
  }

  return res.status(201).json({
    success: true,
    message: `Entretien planifié pour ${applications.length} candidat(s)`,
    interview,
    candidatesCount: applications.length
  });
});

// Modification : listInterviews avec populate
const listInterviews = asyncHandler(async (req, res) => {
  if (req.user.role === ROLES.ETUDIANT) {
    throw ApiError.forbidden('Acces reserve au personnel interne.');
  }

  const { applicationId, statut, from, to, page = 1, limit = 20 } = req.query;
  const filter = {};
  
  // Support de l'ancien paramètre applicationId pour compatibilité
  if (applicationId) filter.applicationIds = { $in: [applicationId] };
  if (statut) filter.statut = statut;
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);
  }

  // Restriction par département
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
      if (Application) {
        const applicationIds = (await Application.find({ offreId: { $in: restrictedOfferIds } }).select('_id'))
          .map((a) => a._id);
        filter.applicationIds = { $in: applicationIds };
      }
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

  // Ajouter le populate pour chaque entretien
  const populatedInterviews = await Promise.all(
    interviews.map(async (interview) => {
      const interviewObj = interview.toObject();
      
      // Récupérer les candidatures avec populate
      const Application = getModelSafe('Application');
      if (Application && interview.applicationIds && interview.applicationIds.length > 0) {
        // Pour le premier candidat (affichage principal)
        const firstApp = await Application.findById(interview.applicationIds[0])
          .populate('etudiantId', 'nom prenom email')
          .populate('offreId', 'titre typeStage');
        
        if (firstApp) {
          interviewObj.candidat = firstApp.etudiantId || {};
          interviewObj.offre = firstApp.offreId || {};
          interviewObj.applicationId = firstApp._id;
        }
      } else if (Application && interview.applicationId) {
        // Fallback pour l'ancien modèle
        const app = await Application.findById(interview.applicationId)
          .populate('etudiantId', 'nom prenom email')
          .populate('offreId', 'titre typeStage');
        
        if (app) {
          interviewObj.candidat = app.etudiantId || {};
          interviewObj.offre = app.offreId || {};
        }
      }
      
      return interviewObj;
    })
  );

  return res.status(200).json({
    success: true,
    interviews: populatedInterviews,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
});

// Modification : listDepartmentInterviews avec populate
const listDepartmentInterviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, statut } = req.query;
  
  const { departementId } = req.user;
  if (!departementId) {
    throw ApiError.forbidden("Votre compte n'est rattaché à aucun département.");
  }

  const Offer = getModelSafe('Offer');
  if (!Offer) {
    throw ApiError.internal("Le module Offres n'est pas disponible.");
  }

  const offerIds = await Offer.find({ departementId }).distinct('_id');
  
  if (offerIds.length === 0) {
    return res.status(200).json({
      success: true,
      interviews: [],
      pagination: { page: 1, limit, total: 0, pages: 0 }
    });
  }

  const Application = getModelSafe('Application');
  if (!Application) {
    return res.status(200).json({
      success: true,
      interviews: [],
      pagination: { page: 1, limit, total: 0, pages: 0 }
    });
  }

  // Récupérer les candidatures du département
  const applications = await Application.find({ offreId: { $in: offerIds } }).select('_id');
  const applicationIds = applications.map(a => a._id);

  if (applicationIds.length === 0) {
    return res.status(200).json({
      success: true,
      interviews: [],
      pagination: { page: 1, limit, total: 0, pages: 0 }
    });
  }

  // Filtrer les entretiens qui ont au moins une candidature dans la liste
  const filter = { applicationIds: { $in: applicationIds } };
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

  // Ajouter le populate
  const populatedInterviews = await Promise.all(interviews.map(async (interview) => {
    const interviewObj = interview.toObject();
    
    if (Application) {
      // Récupérer la première candidature pour les infos principales
      const firstApp = await Application.findById(interview.applicationIds[0])
        .populate('etudiantId', 'nom prenom email')
        .populate('offreId', 'titre typeStage');
      
      if (firstApp) {
        interviewObj.candidat = firstApp.etudiantId || {};
        interviewObj.offre = firstApp.offreId || {};
        interviewObj.applicationId = firstApp._id;
      }
    }
    
    return interviewObj;
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

  // Populer les candidatures
  const Application = getModelSafe('Application');
  if (Application) {
    const populatedApps = await Application.find({
      _id: { $in: interview.applicationIds }
    }).populate('etudiantId', 'nom prenom email')
      .populate('offreId', 'titre typeStage');
    
    const interviewObj = interview.toObject();
    interviewObj.applications = populatedApps;
    interviewObj.candidateCount = populatedApps.length;
    return res.status(200).json({ success: true, interview: interviewObj });
  }

  return res.status(200).json({ success: true, interview });
});

// Modification : updateInterview - Version qui envoie toujours un email
const updateInterview = asyncHandler(async (req, res) => {
  if (!STAFF_TREATMENT_ROLES.includes(req.user.role)) {
    throw ApiError.forbidden("Vous n'avez pas les droits pour modifier cet entretien.");
  }

  const interview = await Interview.findById(req.params.id);
  if (!interview) throw ApiError.notFound('Entretien introuvable.');

  await assertDepartmentOwnsInterview(req, interview);

  // Sauvegarder l'ancien résultat
  const oldResultat = interview.resultat;
  const oldDate = interview.date;
  const oldHeure = interview.heure;

  // Mettre à jour les champs
  Object.assign(interview, req.body);
  
  // Si le résultat change et n'est pas "EnAttente", passer le statut à "Realise"
  if (req.body.resultat && req.body.resultat !== 'EnAttente') {
    interview.statut = 'Realise';
  }

  await interview.save();
  logger.audit('INTERVIEW_UPDATED', { interviewId: interview._id.toString(), userId: req.user.id });

  // TOUJOURS ENVOYER UN EMAIL (sauf si seul le statut change)
  const Application = getModelSafe('Application');
  const applicationIds = interview.applicationIds || [interview.applicationId];
  
  const emails = [];
  for (const appId of applicationIds) {
    if (Application) {
      const app = await Application.findById(appId).populate('etudiantId', 'email nom prenom');
      if (app?.etudiantId?.email) {
        emails.push({
          email: app.etudiantId.email,
          nom: app.etudiantId.nom || '',
          prenom: app.etudiantId.prenom || '',
        });
      }
    }
  }

  console.log(`[updateInterview] ${emails.length} étudiant(s) à notifier`);

  // Envoyer les emails
  for (const student of emails) {
    try {
      const { sendInterviewUpdatedEmail, sendInterviewResultEmail } = require('../services/emailService');
      const studentName = `${student.prenom} ${student.nom}`.trim() || 'Candidat';
      
      // Si le résultat a changé
      if (oldResultat !== interview.resultat && interview.resultat !== 'EnAttente') {
        console.log(`[updateInterview] Envoi email RESULTAT à ${student.email}`);
        await sendInterviewResultEmail({
          to: student.email,
          studentName: studentName,
          resultat: interview.resultat,
          date: interview.date,
          heure: interview.heure,
          type: interview.type,
          lieu: interview.lieu,
          lienVisio: interview.lienVisio,
        });
      } 
      // TOUJOURS envoyer un email de mise à jour
      else {
        console.log(`[updateInterview] Envoi email MISE A JOUR à ${student.email}`);
        await sendInterviewUpdatedEmail({
          to: student.email,
          studentName: studentName,
          date: interview.date,
          heure: interview.heure,
          type: interview.type,
          lieu: interview.lieu,
          lienVisio: interview.lienVisio,
        });
      }
    } catch (err) {
      console.error(`[updateInterview] Erreur envoi email à ${student.email}:`, err.message);
    }
  }

  return res.status(200).json({ 
    success: true, 
    message: 'Entretien mis à jour et candidats notifiés.', 
    interview,
    emailsSent: emails.length
  });
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

module.exports = {
  createInterview,
  listInterviews,
  listDepartmentInterviews,
  getInterviewById,
  updateInterview,
  cancelInterview,
  getCandidatesByOffer,
};