// src/controllers/applicationController.js
// ✅ CORRECTION : Ajout de la transition EnAnalyse -> Acceptee + vérification du rôle

const Application = require('../models/Application');
const Document = require('../models/Document');
const Offer = require('../models/Offer');
const Notification = require('../models/Notification');
const UtilisateurExterne = require('../models/UtilisateurExterne');
const { APPLICATION_STATUS, ROLES, STAFF_TREATMENT_ROLES } = require('../config/constants');
const { sendApplicationStatusChangedEmail, sendApplicationSubmittedEmail } = require('../services/emailService');
const { assertDepartmentOwnsOffer, departmentOfferIds } = require('../utils/departmentScope');
const logger = require('../utils/logger');


async function fetchApplicationParties(application) {
    const [student, offer] = await Promise.all([
        UtilisateurExterne.findById(application.etudiantId).select('email nom prenom'),
        Offer.findById(application.offreId).select('titre'),
    ]);
    return { student, offer };
}


async function notifyStudentStatusChanged(application, statut) {
    try {
        const { student, offer } = await fetchApplicationParties(application);
        if (!student) return;

        await Notification.create({
            type: 'InApp',
            titre: 'Mise a jour de candidature',
            message: `Le statut de votre candidature pour "${offer?.titre || 'une offre'}" est maintenant : ${statut}.`,
            lien: `/candidatures/${application._id}`,
            userId: student._id,
            userModel: 'UtilisateurExterne',
        });

        await sendApplicationStatusChangedEmail({
            to: student.email,
            studentName: `${student.prenom} ${student.nom}`,
            offerTitle: offer?.titre || 'votre offre',
            status: statut,
        });
    } catch (err) {
        logger.warn(`[Application] Notification de changement de statut non envoyee: ${err.message}`);
    }
}


async function notifyStudentApplicationSubmitted(application) {
    try {
        const { student, offer } = await fetchApplicationParties(application);
        if (!student) return;

        await Notification.create({
            type: 'InApp',
            titre: 'Candidature soumise',
            message: `Votre candidature pour "${offer?.titre || 'une offre'}" a ete soumise avec succes.`,
            lien: `/candidatures/${application._id}`,
            userId: student._id,
            userModel: 'UtilisateurExterne',
        });

        await sendApplicationSubmittedEmail({
            to: student.email,
            studentName: `${student.prenom} ${student.nom}`,
            offerTitle: offer?.titre || 'votre offre',
        });
    } catch (err) {
        logger.warn(`[Application] Notification de soumission non envoyee: ${err.message}`);
    }
}


const STATUTS = Object.values(APPLICATION_STATUS);

// ✅ CORRECTION : Ajouter la transition EnAnalyse -> Acceptee
const TRANSITIONS_AUTORISEES = {
    [APPLICATION_STATUS.BROUILLON]: [APPLICATION_STATUS.SOUMISE],
    [APPLICATION_STATUS.SOUMISE]: [APPLICATION_STATUS.EN_ANALYSE, APPLICATION_STATUS.REFUSEE],
    [APPLICATION_STATUS.EN_ANALYSE]: [
        APPLICATION_STATUS.ENTRETIEN,
        APPLICATION_STATUS.ACCEPTEE,  // ✅ AJOUTÉ
        APPLICATION_STATUS.REFUSEE,
    ],
    [APPLICATION_STATUS.ENTRETIEN]: [APPLICATION_STATUS.ACCEPTEE, APPLICATION_STATUS.REFUSEE],
    [APPLICATION_STATUS.ACCEPTEE]: [],
    [APPLICATION_STATUS.REFUSEE]: [],
};

const canChangeStatus = (ancienStatut, nouveauStatut) => {
    return TRANSITIONS_AUTORISEES[ancienStatut]?.includes(nouveauStatut);
};


const isOwnerOrStaff = (req, etudiantIdField) => {
    if (req.user?.role !== ROLES.ETUDIANT) return true;
    const ownerId = etudiantIdField?._id ? etudiantIdField._id.toString() : etudiantIdField?.toString();
    return ownerId === req.user.id;
};

exports.createApplication = async (req, res) => {
    try {

        if (req.user?.role !== ROLES.ETUDIANT) {
            return res.status(403).json({
                success: false,
                message: 'Seul un etudiant peut creer une candidature.'
            });
        }

        const etudiantId = req.user.id;
        const { offreId, commentaire, documents } = req.body;

        const offer = await Offer.findById(offreId);

        if (!offer) {
            return res.status(404).json({
                success: false,
                message: 'Offre non trouvée'
            });
        }

        const existingApplication = await Application.findOne({
            etudiantId,
            offreId
        });

        if (existingApplication) {
            return res.status(400).json({
                success: false,
                message: 'Une candidature existe déjà pour cette offre'
            });
        }


        let safeDocuments = [];
        if (documents && documents.length > 0) {
            const foundDocuments = await Document.find({ _id: { $in: documents } }).select('candidatId');
            const allOwnedByCaller =
                foundDocuments.length === documents.length &&
                foundDocuments.every((doc) => doc.candidatId.toString() === etudiantId);

            if (!allOwnedByCaller) {
                return res.status(403).json({
                    success: false,
                    message: 'Vous ne pouvez associer que vos propres documents a votre candidature'
                });
            }
            safeDocuments = documents;
        }

        const application = await Application.create({
            etudiantId,
            offreId,
            commentaire,
            documents: safeDocuments,
            statut: APPLICATION_STATUS.BROUILLON,
            createdBy: req.user?._id
        });

        return res.status(201).json({
            success: true,
            message: 'Candidature créée avec succès',
            data: application
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la création de la candidature',
            error: error.message
        });
    }
};

exports.getAllApplications = async (req, res) => {
    try {
        const { statut, etudiantId, offreId } = req.query;

        const filter = {};

        if (statut) filter.statut = statut;

 
        if (req.user?.role === ROLES.ETUDIANT) {
            filter.etudiantId = req.user.id;
        } else if (etudiantId) {
            filter.etudiantId = etudiantId;
        }

  
        if (offreId) {
            await assertDepartmentOwnsOffer(req, offreId);
            filter.offreId = offreId;
        } else {
            const restrictedOfferIds = await departmentOfferIds(req);
            if (restrictedOfferIds !== null) {
                filter.offreId = { $in: restrictedOfferIds };
            }
        }

        const applications = await Application.find(filter)
            .populate('etudiantId', 'nom prenom email cin')
            .populate('offreId', 'titre typeStage statut dateLimiteCandidature')
            .populate('traiteurId', 'nom prenom email')
            .populate('documents')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: applications.length,
            data: applications
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            success: false,
            message: statusCode === 500 ? 'Erreur lors de la récupération des candidatures' : error.message,
            error: statusCode === 500 ? error.message : undefined
        });
    }
};

exports.getApplicationById = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id)
            .populate('etudiantId', 'nom prenom email cin telephone')
            .populate('offreId', 'titre description typeStage statut dateDebut dateFin dateLimiteCandidature departementId')
            .populate('traiteurId', 'nom prenom email')
            .populate('documents')
            .populate('historique.auteurId', 'nom prenom email');

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Candidature non trouvée'
            });
        }

        if (!isOwnerOrStaff(req, application.etudiantId)) {
            return res.status(403).json({
                success: false,
                message: "Vous n'avez pas acces a cette candidature"
            });
        }

       
        await assertDepartmentOwnsOffer(req, application.offreId?._id || application.offreId);

        return res.status(200).json({
            success: true,
            data: application
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            success: false,
            message: statusCode === 500 ? 'Erreur lors de la récupération de la candidature' : error.message,
            error: statusCode === 500 ? error.message : undefined
        });
    }
};

exports.updateApplication = async (req, res) => {
    try {
        const { commentaire, documents } = req.body;

        const application = await Application.findById(req.params.id);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Candidature non trouvée'
            });
        }

        
        if (!isOwnerOrStaff(req, application.etudiantId) && req.user?.role !== ROLES.ADMIN) {
            return res.status(403).json({
                success: false,
                message: "Vous n'avez pas acces a cette candidature"
            });
        }

        if (application.statut !== APPLICATION_STATUS.BROUILLON) {
            return res.status(400).json({
                success: false,
                message: 'Seule une candidature en brouillon peut être modifiée'
            });
        }

        if (commentaire !== undefined) application.commentaire = commentaire;
        if (documents !== undefined) application.documents = documents;

        application.updatedBy = req.user?._id;

        await application.save();

        return res.status(200).json({
            success: true,
            message: 'Candidature modifiée avec succès',
            data: application
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la modification de la candidature',
            error: error.message
        });
    }
};

exports.submitApplication = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Candidature non trouvée'
            });
        }

        if (!isOwnerOrStaff(req, application.etudiantId)) {
            return res.status(403).json({
                success: false,
                message: "Vous n'avez pas acces a cette candidature"
            });
        }

        if (application.statut !== APPLICATION_STATUS.BROUILLON) {
            return res.status(400).json({
                success: false,
                message: 'Seule une candidature en brouillon peut être soumise'
            });
        }

        // ✅ Vérifier que la candidature a des documents
        if (!application.documents || application.documents.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Vous devez déposer au moins un document avant de soumettre votre candidature.'
            });
        }

        const documents = await Document.find({ _id: { $in: application.documents } }).select('type');
        const hasCv = documents.some((doc) => doc.type === 'CV');
        if (!hasCv) {
            return res.status(400).json({
                success: false,
                message: 'Un CV est obligatoire avant de soumettre la candidature (RG-016).'
            });
        }

        const ancienStatut = application.statut;

        application.statut = APPLICATION_STATUS.SOUMISE;
        application.dateSoumission = new Date();
        application.updatedBy = req.user?._id;

        application.historique.push({
            ancienStatut,
            nouveauStatut: APPLICATION_STATUS.SOUMISE,
            commentaire: 'Candidature soumise par l’étudiant',
            auteurId: req.user?._id
        });

        await application.save();


        await notifyStudentApplicationSubmitted(application);

        return res.status(200).json({
            success: true,
            message: 'Candidature soumise avec succès',
            data: application
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la soumission de la candidature',
            error: error.message
        });
    }
};

exports.changeApplicationStatus = async (req, res) => {
    try {
        // ✅ CORRECTION : Vérifier explicitement le rôle
        const userRole = req.user?.role;
        const allowedRoles = ['RH', 'Departement', 'Administrateur'];
        
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: "Vous n'avez pas les droits necessaires pour cette action. Rôle requis: RH, Departement ou Administrateur."
            });
        }

        const { statut, commentaire } = req.body;

        if (!STATUTS.includes(statut)) {
            return res.status(400).json({
                success: false,
                message: 'Statut invalide'
            });
        }

        const application = await Application.findById(req.params.id);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Candidature non trouvée'
            });
        }

        try {
            await assertDepartmentOwnsOffer(req, application.offreId);
        } catch (scopeError) {
            const statusCode = scopeError.statusCode || 403;
            return res.status(statusCode).json({ success: false, message: scopeError.message });
        }

        const ancienStatut = application.statut;

        if (!canChangeStatus(ancienStatut, statut)) {
            return res.status(400).json({
                success: false,
                message: `Transition non autorisée : ${ancienStatut} vers ${statut}`
            });
        }

        application.statut = statut;
        application.commentaire = commentaire || application.commentaire;
        application.traiteurId = req.user?._id;
        application.updatedBy = req.user?._id;

        if (!application.historique) application.historique = [];
        application.historique.push({
            ancienStatut,
            nouveauStatut: statut,
            commentaire,
            auteurId: req.user?._id,
            date: new Date()
        });

        await application.save();

        await notifyStudentStatusChanged(application, statut);

        return res.status(200).json({
            success: true,
            message: 'Statut de candidature modifié avec succès',
            data: application
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erreur lors du changement de statut',
            error: error.message
        });
    }
};

exports.getApplicationHistory = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id)
            .populate('historique.auteurId', 'nom prenom email')
            .select('historique etudiantId offreId');

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Candidature non trouvée'
            });
        }


        if (!isOwnerOrStaff(req, application.etudiantId)) {
            return res.status(403).json({
                success: false,
                message: "Vous n'avez pas acces a cette candidature"
            });
        }

        try {
            await assertDepartmentOwnsOffer(req, application.offreId);
        } catch (scopeError) {
            const statusCode = scopeError.statusCode || 403;
            return res.status(statusCode).json({ success: false, message: scopeError.message });
        }

        return res.status(200).json({
            success: true,
            count: application.historique.length,
            data: application.historique
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de l’historique',
            error: error.message
        });
    }
};

exports.deleteApplication = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Candidature non trouvée'
            });
        }

        if (!isOwnerOrStaff(req, application.etudiantId) && req.user?.role !== ROLES.ADMIN) {
            return res.status(403).json({
                success: false,
                message: "Vous n'avez pas acces a cette candidature"
            });
        }

        await application.softDelete(req.user?._id);

        return res.status(200).json({
            success: true,
            message: 'Candidature supprimée avec succès'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression de la candidature',
            error: error.message
        });
    }
};

exports.addDocumentToApplication = async (req, res) => {
    try {
        const { documentId } = req.body;

        const application = await Application.findById(req.params.id);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Candidature non trouvée'
            });
        }


        if (!isOwnerOrStaff(req, application.etudiantId)) {
            return res.status(403).json({
                success: false,
                message: "Vous n'avez pas acces a cette candidature"
            });
        }

        const document = await Document.findById(documentId);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document non trouvé'
            });
        }


        if (document.candidatId.toString() !== application.etudiantId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Ce document n'appartient pas au candidat de cette candidature"
            });
        }

        if (application.documents.includes(documentId)) {
            return res.status(400).json({
                success: false,
                message: 'Ce document est déjà associé à la candidature'
            });
        }

        application.documents.push(documentId);
        application.updatedBy = req.user?._id;

        document.applicationId = application._id;
        await document.save();
        await application.save();

        return res.status(200).json({
            success: true,
            message: 'Document ajouté à la candidature avec succès',
            data: application
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de l’ajout du document',
            error: error.message
        });
    }
};

// ============================================
// ✅ RÉCUPÉRER LES CANDIDATURES DU DÉPARTEMENT
// ============================================
exports.getDepartmentApplications = async (req, res) => {
    try {
        const { statut, search, page = 1, limit = 20 } = req.query;
        const { departementId } = req.user;

        if (!departementId) {
            return res.status(403).json({
                success: false,
                message: "Votre compte n'est rattaché à aucun département."
            });
        }

        // ✅ Récupérer les IDs des offres du département
        const offreIds = await Offer.find({ departementId }).distinct('_id');

        if (offreIds.length === 0) {
            return res.status(200).json({
                success: true,
                count: 0,
                data: [],
                pagination: { page: 1, limit, total: 0, pages: 0 }
            });
        }

        // ✅ Construire le filtre
        const filter = { offreId: { $in: offreIds } };
        if (statut) filter.statut = statut;

        // ✅ Recherche par nom du candidat
        let searchFilter = {};
        if (search) {
            const students = await UtilisateurExterne.find({
                $or: [
                    { nom: { $regex: search, $options: 'i' } },
                    { prenom: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]
            }).select('_id');
            const studentIds = students.map(s => s._id);
            if (studentIds.length > 0) {
                searchFilter.etudiantId = { $in: studentIds };
            } else {
                // Aucun étudiant trouvé → retourner 0 résultat
                return res.status(200).json({
                    success: true,
                    count: 0,
                    data: [],
                    pagination: { page: 1, limit, total: 0, pages: 0 }
                });
            }
        }

        Object.assign(filter, searchFilter);

        // ✅ Pagination
        const pageNum = Math.max(parseInt(page, 10) || 1, 1);
        const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
        const skip = (pageNum - 1) * limitNum;

        // ✅ Récupérer les candidatures
        const [applications, total] = await Promise.all([
            Application.find(filter)
                .populate('etudiantId', 'nom prenom email telephone cin universite filiere niveau')
                .populate('offreId', 'titre typeStage departementId')
                .populate('documents')
                .populate('traiteurId', 'nom prenom email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum),
            Application.countDocuments(filter)
        ]);

        return res.status(200).json({
            success: true,
            count: applications.length,
            data: applications,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('❌ Erreur getDepartmentApplications:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des candidatures',
            error: error.message
        });
    }
};