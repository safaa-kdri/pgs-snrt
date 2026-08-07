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
  const enAttente = soumises + enAnalyse;

  return { total, soumises, enAnalyse, entretien, acceptees, refusees, enAttente, tauxAcceptation };
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
// DASHBOARD DÉPARTEMENT
// ============================================
async function buildDepartmentDashboard(req) {
  const { id: userId, departementId } = req.user;
  
  const offerIds = await Offer.find({ departementId }).distinct('_id');
  
  const candidatures = await applicationStatsFor({ offreId: { $in: offerIds } });
  const stages = await internshipStatsFor({ offreId: { $in: offerIds } });
  const offres = await offerStatsFor({ departementId });
  
  const ApplicationModel = getModelSafe('Application');
  const appIds = ApplicationModel 
    ? (await ApplicationModel.find({ offreId: { $in: offerIds } }).select('_id')).map(a => a._id)
    : [];
  const entretiensAVenir = await Interview.countDocuments({
    applicationId: { $in: appIds },
    statut: 'Planifie',
    date: { $gte: new Date() }
  });
  
  const dernieresCandidatures = ApplicationModel
    ? await ApplicationModel.find({ offreId: { $in: offerIds } })
        .populate('etudiantId', 'nom prenom email')
        .populate('offreId', 'titre')
        .sort({ createdAt: -1 })
        .limit(5)
    : [];
  
  const recentActivities = ApplicationModel
    ? await ApplicationModel.find({ offreId: { $in: offerIds } })
        .populate('etudiantId', 'nom prenom')
        .populate('offreId', 'titre')
        .sort({ updatedAt: -1 })
        .limit(10)
    : [];
  
  const UtilisateurInterne = getModelSafe('UtilisateurInterne');
  const encadrants = UtilisateurInterne
    ? await UtilisateurInterne.countDocuments({ 
        departementId: departementId,
        roleId: { $ne: null }
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
// DASHBOARD RH ✅ CORRIGÉ
// ============================================
async function buildRhDashboard() {
  const [offres, candidatures, stages, entretiensAVenir] = await Promise.all([
    offerStatsFor({}),
    applicationStatsFor({}),
    internshipStatsFor({}),
    entretiensAVenirCount(),
  ]);
  
  // Récupérer les dernières candidatures et activités
  const ApplicationModel = getModelSafe('Application');
  let dernieresCandidatures = [];
  let recentActivities = [];
  
  if (ApplicationModel) {
    // Dernières candidatures (5)
    const apps = await ApplicationModel.find({})
      .populate('etudiantId', 'nom prenom email')
      .populate('offreId', 'titre')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
    
    dernieresCandidatures = apps.map(a => ({
      id: a._id,
      candidat: a.etudiantId ? `${a.etudiantId.prenom} ${a.etudiantId.nom}` : 'Candidat',
      offre: a.offreId?.titre || 'Offre sans titre',
      statut: a.statut,
      date: a.createdAt,
    }));
    
    // Activités récentes (10)
    const activities = await ApplicationModel.find({})
      .populate('etudiantId', 'nom prenom')
      .populate('offreId', 'titre')
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean();
    
    recentActivities = activities.map(a => ({
      id: a._id,
      title: `Candidature ${getStatusLabel(a.statut)}`,
      description: `${a.etudiantId?.prenom || ''} ${a.etudiantId?.nom || ''} — ${a.offreId?.titre || ''}`,
      date: a.updatedAt,
    }));
  }
  
  return { 
    offres, 
    candidatures: {
      ...candidatures,
      enAttente: (candidatures.soumises || 0) + (candidatures.enAnalyse || 0)
    }, 
    stages, 
    entretiensAVenir,
    applicationsList: dernieresCandidatures,
    recentActivities: recentActivities,
  };
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