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


const getDashboard = asyncHandler(async (req, res) => {
  const { role, id: userId, departementId } = req.user;

  if (role === ROLES.ETUDIANT) {
    const Application = getModelSafe('Application');
    const [favoris, candidatures] = await Promise.all([
      Favorite.countDocuments({ etudiantId: userId }),
      Application
        ? applicationStatsFor({ etudiantId: userId })
        : { pending: true, message: 'Module Candidatures non disponible sur cet environnement.' },
    ]);

    return res.status(200).json({
      success: true,
      role,
      dashboard: { candidatures, favoris },
    });
  }

  if (role === ROLES.DEPARTEMENT) {
    const filter = departementId ? { departementId } : { createurId: userId };
    const [offres, entretiensAVenir] = await Promise.all([
      offerStatsFor(filter),
      Interview.countDocuments({ statut: 'Planifie', date: { $gte: new Date() } }),
    ]);

    return res.status(200).json({ success: true, role, dashboard: { offres, entretiensAVenir } });
  }

  if (role === ROLES.RH) {
    const [offres, candidatures, stages, entretiensAVenir] = await Promise.all([
      offerStatsFor({}),
      applicationStatsFor({}),
      internshipStatsFor({}),
      Interview.countDocuments({ statut: 'Planifie', date: { $gte: new Date() } }),
    ]);

    return res.status(200).json({ success: true, role, dashboard: { offres, candidatures, stages, entretiensAVenir } });
  }

  if (role === ROLES.ENCADRANT) {
    const Internship = getModelSafe('Internship');
    const stagiairesSuivis = Internship ? await Internship.countDocuments({ encadrantId: userId, statut: 'EnCours' }) : null;

    return res.status(200).json({
      success: true,
      role,
      dashboard: {
        stagiairesSuivis: stagiairesSuivis ?? { pending: true, message: 'Module Stages non disponible sur cet environnement.' },
      },
    });
  }

  const [offres, candidatures, stages] = await Promise.all([offerStatsFor({}), applicationStatsFor({}), internshipStatsFor({})]);

  return res.status(200).json({ success: true, role, dashboard: { offres, candidatures, stages } });
});

module.exports = { getDashboard };
