const Offer = require('../models/Offer');
const UtilisateurInterne = require('../models/UtilisateurInterne');
const UtilisateurExterne = require('../models/UtilisateurExterne');
const Interview = require('../models/Interview');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { getModelSafe } = require('../utils/lazyModel');
const { ROLES, OFFER_STATUS } = require('../config/constants');

/**
 * Statistiques globales et export de donnees (Cahier des charges 7.7 :
 * "Export des donnees (PDF, Excel)"). L'export PDF proprement dit est du
 * ressort de services/pdfService.js (Safaa) ; en attendant son integration,
 * cette route propose un export CSV/JSON directement exploitable dans un
 * tableur, sans dependance supplementaire.
 */

// -----------------------------------------------------------------------------
// GET /api/v1/stats/global  (Administrateur uniquement)
// -----------------------------------------------------------------------------
const getGlobalStats = asyncHandler(async (req, res) => {
  if (req.user.role !== ROLES.ADMIN) {
    throw ApiError.forbidden('Reserve a l\'administrateur.');
  }

  const Application = getModelSafe('Application');
  const Internship = getModelSafe('Internship');
  const Department = getModelSafe('Department');

  const [
    utilisateursInternes,
    utilisateursExternes,
    offresParStatut,
    offresParType,
    entretiensPlanifies,
    offresParDepartement,
  ] = await Promise.all([
    UtilisateurInterne.countDocuments({}),
    UtilisateurExterne.countDocuments({}),
    Offer.aggregate([{ $group: { _id: '$statut', count: { $sum: 1 } } }]),
    Offer.aggregate([{ $group: { _id: '$typeStage', count: { $sum: 1 } } }]),
    Interview.countDocuments({ statut: 'Planifie' }),
    Offer.aggregate([{ $group: { _id: '$departementId', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 10 }]),
  ]);

  const candidatures = Application
    ? await Application.countDocuments({})
    : { pending: true, message: 'Module Candidatures non disponible.' };

  const stages = Internship
    ? await Internship.countDocuments({ statut: 'EnCours' })
    : { pending: true, message: 'Module Stages non disponible.' };

  const departements = Department
    ? await Department.countDocuments({ actif: true })
    : { pending: true, message: 'Module Departements non disponible.' };

  return res.status(200).json({
    success: true,
    stats: {
      utilisateurs: { internes: utilisateursInternes, externes: utilisateursExternes },
      offres: {
        parStatut: offresParStatut.reduce((acc, r) => ({ ...acc, [r._id]: r.count }), {}),
        parType: offresParType.reduce((acc, r) => ({ ...acc, [r._id]: r.count }), {}),
        parDepartement: offresParDepartement,
      },
      candidatures,
      stagesEnCours: stages,
      entretiensPlanifies,
      departementsActifs: departements,
    },
  });
});

// -----------------------------------------------------------------------------
// GET /api/v1/stats/export?format=csv|json  (RH, Administrateur)
// -----------------------------------------------------------------------------
const exportOfferStats = asyncHandler(async (req, res) => {
  if (![ROLES.RH, ROLES.ADMIN].includes(req.user.role)) {
    throw ApiError.forbidden('Reserve au RH et a l\'administrateur.');
  }

  const format = (req.query.format || 'json').toLowerCase();
  const offers = await Offer.find({ statut: { $ne: OFFER_STATUS.BROUILLON } })
    .select('titre typeStage statut nbPostes datePublication dateDebut dateFin departementId')
    .lean();

  if (format === 'json') {
    return res.status(200).json({ success: true, count: offers.length, offers });
  }

  if (format === 'csv') {
    const header = ['Titre', 'Type', 'Statut', 'Postes', 'Date publication', 'Date debut', 'Date fin', 'Departement'];
    const escapeCsv = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

    const rows = offers.map((o) =>
      [o.titre, o.typeStage, o.statut, o.nbPostes, o.datePublication, o.dateDebut, o.dateFin, o.departementId]
        .map(escapeCsv)
        .join(',')
    );
    const csv = [header.map(escapeCsv).join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="offres_pgs.csv"');
    return res.status(200).send(csv);
  }

  throw ApiError.badRequest('Format non supporte. Utilisez "json" ou "csv".');
});

module.exports = { getGlobalStats, exportOfferStats };
