const Offer = require('../models/Offer');
const Interview = require('../models/Interview');
const Favorite = require('../models/Favorite');
const asyncHandler = require('../utils/asyncHandler');
const { getModelSafe } = require('../utils/lazyModel');
const { ROLES, OFFER_STATUS, APPLICATION_STATUS } = require('../config/constants');



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

async function applicationStatsFor(filter) {
  const Application = getModelSafe('Application');
  if (!Application) return { pending: true, message: 'Module Candidatures non disponible sur cet environnement.' };

  const [total, soumises, enAnalyse, entretien, acceptees, refusees] = await Promise.all([
    Application.countDocuments(filter),
    Application.countDocuments({ ...filter, statut: APPLICATION_STATUS.SOUMISE }),
    Application.countDocuments({ ...filter, statut: APPLICATION_STATUS.EN_ANALYSE }),
    Application.countDocuments({ ...filter, statut: APPLICATION_STATUS.ENTRETIEN }),
    Application.countDocuments({ ...filter, statut: APPLICATION_STATUS.ACCEPTEE }),
    Application.countDocuments({ ...filter, statut: APPLICATION_STATUS.REFUSEE }),
  ]);
  const tauxAcceptation = total > 0 ? Number(((acceptees / total) * 100).toFixed(1)) : 0;

  return { total, soumises, enAnalyse, entretien, acceptees, refusees, tauxAcceptation };
}

async function internshipStatsFor(filter) {
  const Internship = getModelSafe('Internship');
  if (!Internship) return { pending: true, message: 'Module Stages non disponible sur cet environnement.' };

  const [enCours, termines] = await Promise.all([
    Internship.countDocuments({ ...filter, statut: 'EnCours' }),
    Internship.countDocuments({ ...filter, statut: 'Termine' }),
  ]);
  return { enCours, termines };
}

async function entretiensAVenirCount() {
  return Interview.countDocuments({ statut: 'Planifie', date: { $gte: new Date() } });
}



async function buildStudentDashboard(userId) {
  const Application = getModelSafe('Application');
  const [favoris, candidatures] = await Promise.all([
    Favorite.countDocuments({ etudiantId: userId }),
    Application
      ? applicationStatsFor({ etudiantId: userId })
      : { pending: true, message: 'Module Candidatures non disponible sur cet environnement.' },
  ]);
  return { candidatures, favoris };
}

async function buildDepartmentDashboard(req) {
  const { id: userId, departementId } = req.user;
  const filter = departementId ? { departementId } : { createurId: userId };
  const [offres, entretiensAVenir] = await Promise.all([offerStatsFor(filter), entretiensAVenirCount()]);
  return { offres, entretiensAVenir };
}

async function buildRhDashboard() {
  const [offres, candidatures, stages, entretiensAVenir] = await Promise.all([
    offerStatsFor({}),
    applicationStatsFor({}),
    internshipStatsFor({}),
    entretiensAVenirCount(),
  ]);
  return { offres, candidatures, stages, entretiensAVenir };
}

async function buildSupervisorDashboard(userId) {
  const Internship = getModelSafe('Internship');
  if (!Internship) {
    return { stagiairesSuivis: { pending: true, message: 'Module Stages non disponible sur cet environnement.' } };
  }

  const [stagiairesSuivis, evaluationsEnAttente] = await Promise.all([
    Internship.countDocuments({ encadrantId: userId, statut: 'EnCours' }),
    Internship.countDocuments({ encadrantId: userId, statut: 'EnCours', 'evaluation.note': { $exists: false } }),
  ]);
  return { stagiairesSuivis, evaluationsEnAttente };
}

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

async function buildDefaultDashboard() {
  const [offres, candidatures, stages] = await Promise.all([
    offerStatsFor({}),
    applicationStatsFor({}),
    internshipStatsFor({}),
  ]);
  return { offres, candidatures, stages };
}


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

module.exports = {
  getDashboard,
  getStudentDashboard,
  getAdminDashboard,
  getRhDashboard,
  getSupervisorDashboard,
  getDepartmentDashboard,
};