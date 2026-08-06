// src/controllers/dashboardController.js
const Offer = require('../models/Offer');
const Interview = require('../models/Interview');
const Favorite = require('../models/Favorite');
const Application = require('../models/Application');
const Internship = require('../models/Internship');
const asyncHandler = require('../utils/asyncHandler');
const { getModelSafe } = require('../utils/lazyModel');
const { ROLES, OFFER_STATUS, APPLICATION_STATUS } = require('../config/constants');

// ============================================
// STATS OFFRES
// ============================================
async function offerStatsFor(filter) {
  const [total, publiees, enAttente, brouillons, archivees] = await Promise.all([
    Offer.countDocuments(filter),
    Offer.countDocuments({ ...filter, statut: OFFER_STATUS.PUBLIEE }),
    Offer.countDocuments({ ...filter, statut: OFFER_STATUS.EN_ATTENTE }),
    Offer.countDocuments({ ...filter, statut: OFFER_STATUS.BROUILLON }),
    Offer.countDocuments({ ...filter, statut: OFFER_STATUS.ARCHIVEE }),
  ]);
  return { total, publiees, enAttente, brouillons, archivees };
}

// ============================================
// STATS CANDIDATURES
// ============================================
async function applicationStatsFor(filter) {
  const ApplicationModel = getModelSafe('Application');
  if (!ApplicationModel) return { pending: true, message: 'Module Candidatures non disponible sur cet environnement.' };

  const [total, soumises, enAnalyse, entretien, acceptees, refusees] = await Promise.all([
    ApplicationModel.countDocuments(filter),
    ApplicationModel.countDocuments({ ...filter, statut: APPLICATION_STATUS.SOUMISE }),
    ApplicationModel.countDocuments({ ...filter, statut: APPLICATION_STATUS.EN_ANALYSE }),
    ApplicationModel.countDocuments({ ...filter, statut: APPLICATION_STATUS.ENTRETIEN }),
    ApplicationModel.countDocuments({ ...filter, statut: APPLICATION_STATUS.ACCEPTEE }),
    ApplicationModel.countDocuments({ ...filter, statut: APPLICATION_STATUS.REFUSEE }),
  ]);
  const tauxAcceptation = total > 0 ? Number(((acceptees / total) * 100).toFixed(1)) : 0;

  return { total, soumises, enAnalyse, entretien, acceptees, refusees, tauxAcceptation };
}

// ============================================
// STATS STAGES
// ============================================
async function internshipStatsFor(filter) {
  const InternshipModel = getModelSafe('Internship');
  if (!InternshipModel) return { pending: true, message: 'Module Stages non disponible sur cet environnement.' };

  const [enCours, termines, total] = await Promise.all([
    InternshipModel.countDocuments({ ...filter, statut: 'EnCours' }),
    InternshipModel.countDocuments({ ...filter, statut: 'Termine' }),
    InternshipModel.countDocuments({ ...filter }),
  ]);
  return { total, enCours, termines };
}

// ============================================
// ENTRETIENS À VENIR
// ============================================
async function entretiensAVenirCount() {
  return Interview.countDocuments({ statut: 'Planifie', date: { $gte: new Date() } });
}

// ============================================
// DASHBOARD ÉTUDIANT
// ============================================
async function buildStudentDashboard(userId) {
  const ApplicationModel = getModelSafe('Application');
  const [favoris, candidatures] = await Promise.all([
    Favorite.countDocuments({ etudiantId: userId }),
    ApplicationModel
      ? applicationStatsFor({ etudiantId: userId })
      : { pending: true, message: 'Module Candidatures non disponible sur cet environnement.' },
  ]);
  return { candidatures, favoris };
}

// ============================================
// DASHBOARD DÉPARTEMENT ✅ NOUVEAU
// ============================================
async function buildDepartmentDashboard(req) {
  const { id: userId, departementId } = req.user;
  
  // ✅ Récupérer les IDs des offres du département
  const offerIds = await Offer.find({ departementId }).distinct('_id');
  
  // ✅ Stats des candidatures du département
  const candidatures = await applicationStatsFor({ 
    offreId: { $in: offerIds } 
  });
  
  // ✅ Stats des stages du département
  const stages = await internshipStatsFor({ 
    offreId: { $in: offerIds } 
  });
  
  // ✅ Stats des offres du département
  const offres = await offerStatsFor({ departementId });
  
  // ✅ Entretiens à venir pour les candidatures du département
  const ApplicationModel = getModelSafe('Application');
  const appIds = ApplicationModel 
    ? (await ApplicationModel.find({ offreId: { $in: offerIds } }).select('_id')).map(a => a._id)
    : [];
  const entretiensAVenir = await Interview.countDocuments({
    applicationId: { $in: appIds },
    statut: 'Planifie',
    date: { $gte: new Date() }
  });
  
  // ✅ Dernières candidatures du département
  const dernieresCandidatures = ApplicationModel
    ? await ApplicationModel.find({ offreId: { $in: offerIds } })
        .populate('etudiantId', 'nom prenom email')
        .populate('offreId', 'titre')
        .sort({ createdAt: -1 })
        .limit(5)
    : [];
  
  // ✅ Dernières activités (ex: changements de statut récents)
  const recentActivities = ApplicationModel
    ? await ApplicationModel.find({ offreId: { $in: offerIds } })
        .populate('etudiantId', 'nom prenom')
        .populate('offreId', 'titre')
        .sort({ updatedAt: -1 })
        .limit(10)
    : [];
  
  // ✅ Nombre d'encadrants dans le département
  const UtilisateurInterne = getModelSafe('UtilisateurInterne');
  const encadrants = UtilisateurInterne
    ? await UtilisateurInterne.countDocuments({ 
        departementId: departementId,
        roleId: { $ne: null } // À ajuster selon votre modèle
      })
    : 0;

  return {
    offres,
    candidatures,
    stages,
    entretiensAVenir,
    encadrants,
    dernieresCandidatures: dernieresCandidatures.map(a => ({
      id: a._id,
      candidat: a.etudiantId ? `${a.etudiantId.prenom} ${a.etudiantId.nom}` : 'Candidat',
      offre: a.offreId?.titre || 'Offre sans titre',
      statut: a.statut,
      date: a.createdAt,
    })),
    recentActivities: recentActivities.map(a => ({
      id: a._id,
      title: `Candidature ${getStatusLabel(a.statut)}`,
      description: `${a.etudiantId?.prenom || ''} ${a.etudiantId?.nom || ''} — ${a.offreId?.titre || ''}`,
      date: a.updatedAt,
    })),
  };
}

// ============================================
// DASHBOARD RH
// ============================================
async function buildRhDashboard() {
  const [offres, candidatures, stages, entretiensAVenir] = await Promise.all([
    offerStatsFor({}),
    applicationStatsFor({}),
    internshipStatsFor({}),
    entretiensAVenirCount(),
  ]);
  return { offres, candidatures, stages, entretiensAVenir };
}

// ============================================
// DASHBOARD ENCADRANT
// ============================================
async function buildSupervisorDashboard(userId) {
  const InternshipModel = getModelSafe('Internship');
  if (!InternshipModel) {
    return { stagiairesSuivis: { pending: true, message: 'Module Stages non disponible sur cet environnement.' } };
  }

  const [stagiairesSuivis, evaluationsEnAttente] = await Promise.all([
    InternshipModel.countDocuments({ encadrantId: userId, statut: 'EnCours' }),
    InternshipModel.countDocuments({ encadrantId: userId, statut: 'EnCours', 'evaluation.note': { $exists: false } }),
  ]);
  return { stagiairesSuivis, evaluationsEnAttente };
}

// ============================================
// DASHBOARD ADMIN
// ============================================
async function buildAdminDashboard() {
  const Department = getModelSafe('Department');
  const [rhDashboard, departementsActifs] = await Promise.all([
    buildRhDashboard(),
    Department
      ? Department.countDocuments({ actif: true })
      : { pending: true, message: 'Module Departements non disponible sur cet environnement.' },
  ]);
  return { ...rhDashboard, departementsActifs };
}

// ============================================
// DASHBOARD DEFAULT
// ============================================
async function buildDefaultDashboard() {
  const [offres, candidatures, stages] = await Promise.all([
    offerStatsFor({}),
    applicationStatsFor({}),
    internshipStatsFor({}),
  ]);
  return { offres, candidatures, stages };
}

// ============================================
// HELPERS
// ============================================
function getStatusLabel(status) {
  const labels = {
    [APPLICATION_STATUS.BROUILLON]: 'Brouillon',
    [APPLICATION_STATUS.SOUMISE]: 'Soumise',
    [APPLICATION_STATUS.EN_ANALYSE]: 'En analyse',
    [APPLICATION_STATUS.ENTRETIEN]: 'Entretien',
    [APPLICATION_STATUS.ACCEPTEE]: 'Acceptée',
    [APPLICATION_STATUS.REFUSEE]: 'Refusée',
  };
  return labels[status] || status;
}

// ============================================
// GET DASHBOARD PRINCIPAL
// ============================================
const getDashboard = asyncHandler(async (req, res) => {
  const { role, id: userId } = req.user;

  let dashboard;
  if (role === ROLES.ETUDIANT) dashboard = await buildStudentDashboard(userId);
  else if (role === ROLES.DEPARTEMENT) dashboard = await buildDepartmentDashboard(req);
  else if (role === ROLES.RH) dashboard = await buildRhDashboard();
  else if (role === ROLES.ENCADRANT) dashboard = await buildSupervisorDashboard(userId);
  else if (role === ROLES.ADMIN) dashboard = await buildAdminDashboard();
  else dashboard = await buildDefaultDashboard();

  return res.status(200).json({ success: true, role, dashboard });
});

// ============================================
// DASHBOARDS SPÉCIFIQUES
// ============================================
const getStudentDashboard = asyncHandler(async (req, res) => {
  const data = await buildStudentDashboard(req.user.id);
  return res.status(200).json({ success: true, data });
});

const getAdminDashboard = asyncHandler(async (req, res) => {
  const data = await buildAdminDashboard();
  return res.status(200).json({ success: true, data });
});

const getRhDashboard = asyncHandler(async (req, res) => {
  const data = await buildRhDashboard();
  return res.status(200).json({ success: true, data });
});

const getSupervisorDashboard = asyncHandler(async (req, res) => {
  const data = await buildSupervisorDashboard(req.user.id);
  return res.status(200).json({ success: true, data });
});

const getDepartmentDashboard = asyncHandler(async (req, res) => {
  const data = await buildDepartmentDashboard(req);
  return res.status(200).json({ success: true, data });
});

// ============================================
// EXPORTS
// ============================================
module.exports = {
  getDashboard,
  getStudentDashboard,
  getAdminDashboard,
  getRhDashboard,
  getSupervisorDashboard,
  getDepartmentDashboard,
};