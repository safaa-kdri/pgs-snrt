// src/controllers/conventionController.js
// ✅ CONTROLLER POUR LA GESTION DES CONVENTIONS
// ✅ AJOUT : Ajouter la signature sur le PDF existant avec pdf-lib
// ✅ AJOUT : Fonctions uploadConvention, signConvention, downloadConvention
// ✅ CORRECTION : Liste complète des statuts autorisés (avec accents)
// ✅ CORRECTION : Logs de débogage pour identifier les statuts exacts

const Internship = require('../models/Internship');
const Application = require('../models/Application');
const Offer = require('../models/Offer');
const Role = require('../models/Role');
const UtilisateurInterne = require('../models/UtilisateurInterne');
const UtilisateurExterne = require('../models/UtilisateurExterne');
const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');
const gridfsService = require('../services/gridfsService');
const { PDFDocument } = require('pdf-lib');
const { getSignedStampCoordinates } = require('../utils/conventionStamp');

const resolveInternshipForConvention = async (id, userId) => {
    let internship = await Internship.findById(id);

    if (!internship && id) {
        const application = await Application.findById(id);
        if (application && (application.statut === 'Acceptee' || application.statut === 'Acceptée')) {
            internship = await Internship.findOne({ applicationId: application._id });
        }
    }

    if (!internship) {
        return null;
    }

    if (userId && internship.etudiantId?.toString() !== userId.toString()) {
        return null;
    }

    return internship;
};

const getConventionPdfBytes = async (convention) => {
    if (convention.gridFsId) {
        const base64 = await gridfsService.getFileAsBase64(convention.gridFsId.toString());
        return Buffer.from(base64, 'base64');
    }

    const filePath = convention.chemin;
    if (!filePath || !fs.existsSync(filePath)) {
        throw ApiError.notFound('Le fichier PDF original n\'existe plus');
    }

    return fs.readFileSync(filePath);
};

const getOfficialStampBytes = () => {
    const stampPath = path.join(__dirname, '../../uploads/images/Signature-et-cachet-1.png');
    if (!fs.existsSync(stampPath)) {
        throw ApiError.notFound('Le fichier du cachet officiel est introuvable');
    }

    return fs.readFileSync(stampPath);
};

// ============================================
// ✅ LISTE COMPLÈTE DES STATUTS AUTORISÉS POUR LA CONVENTION
// ============================================
const CONVENTION_ALLOWED_STATUSES = [
    // Statuts de base
    'EnCours',
    'Acceptee',
    'Acceptée',           // ← Version avec accent
    'DemandeEnvoyee',
    'EngagementEnvoye',
    'EngagementRecu',
    'EngagementValide',
    'EnAttenteEngagement',
    'ValideParDirecteur',
    'Cloturee',
    'Clôturée',           // ← Version avec accent
    'Termine',
    'Terminé',            // ← Version avec accent
    'Valide',
    'EnCoursCreation',
    'Soumise'
];

const SIGNED_CONVENTION_STATUSES = ['SigneeRH', 'EnvoyeeEtudiant', 'Cloturee'];

const canGenerateSignedPdf = (status) => SIGNED_CONVENTION_STATUSES.includes(status);
const canResendConventionToStudent = (status) => SIGNED_CONVENTION_STATUSES.includes(status);
const canApplyNewSignature = (status) => ['DeposeeEtudiant', 'SigneeRH', 'EnvoyeeEtudiant', 'Cloturee', 'NonGeneree'].includes(status);

exports.canGenerateSignedPdf = canGenerateSignedPdf;
exports.canResendConventionToStudent = canResendConventionToStudent;
exports.canApplyNewSignature = canApplyNewSignature;

// ============================================
// ÉTUDIANT - DÉPOSER LA CONVENTION
// ============================================
exports.deposerConvention = asyncHandler(async (req, res) => {
    const studentId = req.user.id;

    console.log('🔍 [deposerConvention] ===== DEBUT ====');
    console.log('🔍 [deposerConvention] studentId:', studentId);

    // ✅ DEBUG : Afficher tous les stages de l'étudiant
    const allInternships = await Internship.find({ etudiantId: studentId });
    console.log('🔍 [deposerConvention] Stages trouvés:', allInternships.length);
    console.log('🔍 [deposerConvention] Statuts des stages:', 
        allInternships.map(i => ({
            id: i._id,
            statut: i.statut,
            statutJSON: JSON.stringify(i.statut)
        }))
    );

    // ✅ Recherche avec TOUS les statuts autorisés
    const internship = await Internship.findOne({
        etudiantId: studentId,
        statut: { $in: CONVENTION_ALLOWED_STATUSES }
    }).populate('offreId');

    console.log('🔍 [deposerConvention] internship trouvé:', internship ? internship._id : 'NON TROUVÉ');
    console.log('🔍 [deposerConvention] statut internship:', internship?.statut);

    if (!internship) {
        throw ApiError.notFound(
            `Aucun stage actif trouvé pour cet étudiant. Statuts autorisés: ${CONVENTION_ALLOWED_STATUSES.join(', ')}`
        );
    }

    if (!req.file) {
        throw ApiError.badRequest('Aucun fichier fourni');
    }

    console.log('🔍 [deposerConvention] req.file.originalname:', req.file.originalname);
    console.log('🔍 [deposerConvention] req.file.path:', req.file.path);
    console.log('🔍 [deposerConvention] req.file.mimetype:', req.file.mimetype);

    if (req.file.mimetype !== 'application/pdf') {
        throw ApiError.badRequest('Seuls les fichiers PDF sont acceptés');
    }

    const conventionData = {
        nomOriginal: req.file.originalname,
        nomStocke: req.file.filename,
        chemin: req.file.path,
        url: `/uploads/conventions/${req.file.filename}`,
        mimeType: req.file.mimetype,
        taille: req.file.size,
        dateDepot: new Date(),
        statut: 'DeposeeEtudiant',
        signedByRH: false
    };

    console.log('🔍 [deposerConvention] conventionData:', JSON.stringify(conventionData, null, 2));

    internship.convention = conventionData;
    await internship.save();

    console.log('✅ [deposerConvention] APRÈS sauvegarde - internship.convention:', internship.convention);

    const verifyInternship = await Internship.findById(internship._id);
    console.log('✅ [deposerConvention] VÉRIFICATION - verifyInternship.convention:', verifyInternship.convention);

    // ✅ Notification au RH
    try {
        const rhUsers = await UtilisateurInterne.find({ 
            roleId: await Role.findOne({ nom: 'RH' }) 
        }).select('_id');
        
        for (const rh of rhUsers) {
            await Notification.create({
                type: 'InApp',
                titre: '📄 Nouvelle convention déposée',
                message: `L'étudiant ${req.user.prenom} ${req.user.nom} a déposé sa convention signée.`,
                userId: rh._id,
                userModel: 'UtilisateurInterne',
                lien: `/rh/generate-convention`,
            });
        }
        console.log('✅ [deposerConvention] Notifications envoyées aux RH');
    } catch (notifError) {
        console.warn('⚠️ [deposerConvention] Erreur notification:', notifError.message);
    }

    logger.audit('CONVENTION_DEPOSEE', {
        studentId: studentId,
        internshipId: internship._id,
        fileName: req.file.originalname
    });

    return res.status(201).json({
        success: true,
        message: 'Convention déposée avec succès',
        data: {
            convention: conventionData,
            internship: internship._id
        }
    });
});

// ============================================
// ÉTUDIANT - RÉCUPÉRER LE STATUT DE LA CONVENTION
// ============================================
exports.getConventionStatus = asyncHandler(async (req, res) => {
    const studentId = req.user.id;
    const { id } = req.params;

    console.log('🔍 [getConventionStatus] studentId:', studentId, 'routeId:', id);

    let internship = null;

    if (id) {
        internship = await resolveInternshipForConvention(id, studentId);
    }

    if (!internship) {
        internship = await Internship.findOne({
            etudiantId: studentId,
            statut: { $in: CONVENTION_ALLOWED_STATUSES }
        });
    }

    if (!internship) {
        console.log('🔍 [getConventionStatus] Aucun stage trouvé');
        return res.status(200).json({
            success: true,
            data: null,
            message: 'Aucun stage actif'
        });
    }

    console.log('🔍 [getConventionStatus] statut convention:', internship.convention?.statut);

    return res.status(200).json({
        success: true,
        data: {
            statut: internship.convention?.statut || null,
            convention: internship.convention || null,
            internshipId: internship._id
        }
    });
});

// ============================================
// ÉTUDIANT - TÉLÉCHARGER LA CONVENTION SIGNÉE
// ============================================
exports.downloadConvention = asyncHandler(async (req, res) => {
    const studentId = req.user.id;
    const { id } = req.params;

    console.log('🔍 [downloadConvention] studentId:', studentId, 'routeId:', id);

    let internship = null;

    if (id) {
        internship = await resolveInternshipForConvention(id, studentId);
    }

    if (!internship) {
        internship = await Internship.findOne({
            etudiantId: studentId,
            statut: { $in: CONVENTION_ALLOWED_STATUSES }
        });
    }

    if (!internship || !internship.convention) {
        throw ApiError.notFound('Aucune convention trouvée');
    }

    if (internship.convention.statut !== 'EnvoyeeEtudiant' && 
        internship.convention.statut !== 'Cloturee') {
        throw ApiError.badRequest('La convention n\'est pas encore disponible');
    }

    const signedFilePath = internship.convention.cheminSignee;
    if (signedFilePath && fs.existsSync(signedFilePath)) {
        console.log('✅ [downloadConventionRH] PDF signé trouvé:', signedFilePath);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="Convention_Signee_${internship.convention.nomOriginal || 'convention'}.pdf"`);
        return res.sendFile(signedFilePath);
    }

    if (internship.convention.gridFsId) {
        const fileId = internship.convention.gridFsId.toString();
        const downloadStream = gridfsService.downloadFile(fileId);
        res.setHeader('Content-Type', internship.convention.mimeType || 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${internship.convention.nomOriginal || 'convention.pdf'}"`);
        return downloadStream.pipe(res);
    }

    const filePath = internship.convention.chemin;
    if (!filePath || !fs.existsSync(filePath)) {
        throw ApiError.notFound('Le fichier n\'existe plus');
    }

    console.log('✅ [downloadConvention] Fichier trouvé:', filePath);

    return res.download(filePath, `Convention_Stage_${internship.convention.nomOriginal}`);
});

// ============================================
// RH - RÉCUPÉRER TOUTES LES CONVENTIONS
// ============================================
exports.getConventionsDeposees = asyncHandler(async (req, res) => {
    console.log('🔍 [getConventionsDeposees] ===== DEBUT ====');
    console.log('🔍 [getConventionsDeposees] Utilisateur:', req.user?.id);
    console.log('🔍 [getConventionsDeposees] Rôle:', req.user?.role);

    const internships = await Internship.find({
        "convention": { $exists: true }
    })
    .populate('etudiantId', 'nom prenom email')
    .populate('offreId', 'titre typeStage')
    .sort({ 'convention.dateDepot': -1 });

    console.log('🔍 [getConventionsDeposees] Internships avec convention trouvés:', internships.length);

    internships.forEach(i => {
        console.log('🔍 [getConventionsDeposees] Stage:', i._id, 'Statut convention:', i.convention?.statut);
    });

    const conventions = internships
        .filter(internship => internship.convention)
        .map(internship => ({
            _id: internship._id,
            etudiantId: internship.etudiantId,
            offreId: internship.offreId,
            convention: internship.convention
        }));

    console.log('✅ [getConventionsDeposees] Conventions retournées:', conventions.length);

    return res.status(200).json({
        success: true,
        count: conventions.length,
        data: conventions
    });
});

// ============================================
// RH - SIGNER UNE CONVENTION (AJOUTER SIGNATURE DANS BDD)
// ============================================
exports.signerConvention = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { position } = req.body;

    console.log('🔍 [signerConvention] ===== DEBUT ====');
    console.log('🔍 [signerConvention] conventionId:', id);
    console.log('🔍 [signerConvention] rhId:', req.user?.id);
    console.log('🔍 [signerConvention] position reçue:', !!position);

    const internship = await Internship.findById(id);

    if (!internship || !internship.convention) {
        throw ApiError.notFound('Convention non trouvée');
    }

    if (!canApplyNewSignature(internship.convention.statut)) {
        throw ApiError.badRequest(`Cette convention ne peut pas être signée. Statut actuel: ${internship.convention.statut}`);
    }

    internship.convention.statut = 'SigneeRH';
    internship.convention.dateSignature = new Date();
    internship.convention.signedByRH = true;
    internship.convention.signatureRH = {
        date: new Date(),
        rhId: req.user.id,
        rhNom: `${req.user.prenom || ''} ${req.user.nom || ''}`.trim(),
        signatureData: null,
        position: {
            x: Number(position?.x ?? internship.convention.signatureRH?.position?.x ?? 50),
            y: Number(position?.y ?? internship.convention.signatureRH?.position?.y ?? 280),
            width: Number(position?.width ?? internship.convention.signatureRH?.position?.width ?? 150),
            height: Number(position?.height ?? internship.convention.signatureRH?.position?.height ?? 60),
            page: Number(position?.page ?? internship.convention.signatureRH?.position?.page ?? 0)
        }
    };

    await internship.save();

    console.log('✅ [signerConvention] Convention signée:', internship.convention);

    logger.audit('CONVENTION_SIGNEE', {
        internshipId: internship._id,
        rhId: req.user.id
    });

    return res.status(200).json({
        success: true,
        message: 'Convention signée avec succès',
        data: internship.convention
    });
});

// ============================================
// ✅ AJOUTER LA SIGNATURE SUR LE PDF EXISTANT
// ============================================
const addConventionStampToPdfBytes = async (pdfBytes, position = {}) => {
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pngImage = await pdfDoc.embedPng(getOfficialStampBytes());
    const pages = pdfDoc.getPages();
    const targetPageIndex = Number(position.page || 0);
    const page = pages[targetPageIndex] || pages[0];
    const pageSize = page.getSize();
    const safePosition = getSignedStampCoordinates(position, pageSize);

    page.drawImage(pngImage, {
        x: safePosition.x,
        y: safePosition.y,
        width: safePosition.width,
        height: safePosition.height,
    });

    return pdfDoc.save();
};

const regenerateSignedPdfFile = async (internship) => {
    const originalPdfBytes = await getConventionPdfBytes(internship.convention);
    const signedPdfBytes = await addConventionStampToPdfBytes(
        originalPdfBytes,
        internship.convention.signatureRH?.position || {}
    );

    const fileName = `convention_signee_${internship._id}_${Date.now()}.pdf`;
    const outputPath = path.join(__dirname, '../../uploads/conventions/', fileName);
    fs.writeFileSync(outputPath, signedPdfBytes);

    internship.convention.cheminSignee = outputPath;
    internship.convention.urlSignee = `/uploads/conventions/${fileName}`;
    internship.convention.dateSignature = internship.convention.dateSignature || new Date();

    return { outputPath, signedPdfBytes, fileName };
};

exports.ajouterSignatureSurPDF = asyncHandler(async (req, res) => {
    const { id } = req.params;

    console.log('🔍 [ajouterSignatureSurPDF] ===== DEBUT ====');
    console.log('🔍 [ajouterSignatureSurPDF] conventionId:', id);

    const internship = await Internship.findById(id)
        .populate('etudiantId', 'nom prenom email')
        .populate('offreId', 'titre typeStage');

    if (!internship || !internship.convention) {
        throw ApiError.notFound('Convention non trouvée');
    }

    if (!canGenerateSignedPdf(internship.convention.statut)) {
        throw ApiError.badRequest(`La convention doit être signée ou déjà envoyée pour générer le PDF final. Statut actuel: ${internship.convention.statut}`);
    }

    if (!internship.convention.signatureRH?.position) {
        internship.convention.signatureRH = {
            ...internship.convention.signatureRH,
            position: {
                x: 50,
                y: 280,
                width: 150,
                height: 60,
                page: 0
            }
        };
    }

    console.log('🔍 [ajouterSignatureSurPDF] Préparation du PDF signé');

    try {
        const { signedPdfBytes, fileName } = await regenerateSignedPdfFile(internship);
        const signedPdfBuffer = Buffer.from(signedPdfBytes);

        console.log('✅ [ajouterSignatureSurPDF] PDF signé sauvegardé:', internship.convention.cheminSignee);
        console.log('✅ [ajouterSignatureSurPDF] PDF prêt à envoyer:', {
            bytes: signedPdfBuffer.length,
            header: signedPdfBuffer.subarray(0, 5).toString('ascii')
        });

        await internship.save();

        logger.audit('CONVENTION_SIGNEE_PDF_GENERATED', {
            internshipId: internship._id,
            fileName: fileName,
            rhId: req.user.id
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="Convention_Signee_${internship.etudiantId?.nom || 'stage'}.pdf"`);
        res.setHeader('Content-Length', signedPdfBuffer.length);
        return res.send(signedPdfBuffer);

    } catch (error) {
        console.error('❌ [ajouterSignatureSurPDF] Erreur:', error);
        throw ApiError.internal('Erreur lors de l\'ajout de la signature sur le PDF');
    }
});

// ============================================
// RH - ENVOYER LA CONVENTION SIGNÉE À L'ÉTUDIANT
// ============================================
exports.envoyerConventionEtudiant = asyncHandler(async (req, res) => {
    const { id } = req.params;

    console.log('🔍 [envoyerConventionEtudiant] ===== DEBUT ====');
    console.log('🔍 [envoyerConventionEtudiant] conventionId:', id);

    const internship = await Internship.findById(id)
        .populate('etudiantId', 'nom prenom email');

    if (!internship || !internship.convention) {
        throw ApiError.notFound('Convention non trouvée');
    }

    if (!canResendConventionToStudent(internship.convention.statut)) {
        throw ApiError.badRequest(`La convention doit déjà être signée ou envoyée pour être renvoyée à l'étudiant. Statut actuel: ${internship.convention.statut}`);
    }

    if (!internship.convention.signatureRH?.position) {
        internship.convention.signatureRH = {
            ...internship.convention.signatureRH,
            position: {
                x: 50,
                y: 280,
                width: 150,
                height: 60,
                page: 0
            }
        };
    }

    await regenerateSignedPdfFile(internship);

    internship.convention.statut = 'EnvoyeeEtudiant';
    internship.convention.dateEnvoi = new Date();

    await internship.save();

    console.log('✅ [envoyerConventionEtudiant] Convention envoyée à:', internship.etudiantId?.email);

    logger.audit('CONVENTION_ENVOYEE_ETUDIANT', {
        internshipId: internship._id,
        studentId: internship.etudiantId._id,
        studentEmail: internship.etudiantId.email
    });

    return res.status(200).json({
        success: true,
        message: 'Convention envoyée à l\'étudiant avec succès',
        data: internship.convention
    });
});

// ============================================
// RH - TÉLÉCHARGER UNE CONVENTION SPÉCIFIQUE
// ============================================
exports.downloadConventionRH = asyncHandler(async (req, res) => {
    const { id } = req.params;

    console.log('🔍 [downloadConventionRH] conventionId:', id);

    const internship = await Internship.findById(id);

    if (!internship || !internship.convention) {
        throw ApiError.notFound('Convention non trouvée');
    }

    if (internship.convention.gridFsId) {
        const fileId = internship.convention.gridFsId.toString();
        const downloadStream = gridfsService.downloadFile(fileId);
        const fileName = internship.convention.nomOriginal || 'convention.pdf';
        const mimeType = internship.convention.mimeType || 'application/pdf';
        res.setHeader('Content-Type', mimeType.includes('pdf') ? 'application/pdf' : mimeType);
        res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
        return downloadStream.pipe(res);
    }

    const filePath = internship.convention.cheminSignee || internship.convention.chemin;
    if (!fs.existsSync(filePath)) {
        throw ApiError.notFound('Le fichier n\'existe plus');
    }

    console.log('✅ [downloadConventionRH] Fichier trouvé:', filePath);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${internship.convention.nomOriginal || 'convention.pdf'}"`);
    return res.sendFile(filePath);
});

// ============================================
// RH - GÉNÉRER UNE CONVENTION VIERGE (MODÈLE)
// ============================================
exports.genererConventionVierge = asyncHandler(async (req, res) => {
    throw ApiError.notImplemented('Cette fonctionnalité sera bientôt disponible');
});

// ============================================
// ✅ CONVENTION - UPLOADER LA CONVENTION SIGNÉE (VIA /:id/convention)
// ============================================
exports.uploadConvention = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const file = req.file;

    console.log('🔍 [uploadConvention] ID:', id);
    console.log('🔍 [uploadConvention] file:', file?.originalname);

    if (!file) {
        throw ApiError.badRequest('Aucun fichier fourni');
    }

    if (file.mimetype !== 'application/pdf') {
        throw ApiError.badRequest('Seuls les fichiers PDF sont acceptés');
    }

    const internship = await resolveInternshipForConvention(id, req.user.id);
    if (!internship) {
        throw ApiError.notFound('Stage non trouvé');
    }

    // Vérifier que l'étudiant est bien le propriétaire
    if (internship.etudiantId.toString() !== req.user.id.toString()) {
        throw ApiError.forbidden('Vous n\'êtes pas autorisé à déposer une convention pour ce stage');
    }

    // Vérifier que le statut du stage est valide
    if (!CONVENTION_ALLOWED_STATUSES.includes(internship.statut)) {
        throw ApiError.badRequest(`Le stage doit avoir un statut valide (${CONVENTION_ALLOWED_STATUSES.join(', ')})`);
    }

    // Vérifier qu'il n'y a pas déjà une convention
    if (internship.convention && internship.convention.statut !== 'NonGeneree') {
        throw ApiError.badRequest('Une convention existe déjà pour ce stage');
    }

    let fileBuffer;
    if (file.buffer && Buffer.isBuffer(file.buffer)) {
        fileBuffer = file.buffer;
    } else if (file.path) {
        fileBuffer = fs.readFileSync(file.path);
    } else if (file.data) {
        fileBuffer = Buffer.from(file.data);
    }

    let gridFsFile = null;
    if (fileBuffer) {
        gridFsFile = await require('../services/gridfsService').uploadFile(
            fileBuffer,
            file.originalname,
            file.mimetype
        );
    }

    const conventionData = {
        nomOriginal: file.originalname,
        nomStocke: file.filename || file.originalname,
        chemin: file.path || '',
        url: gridFsFile ? `/api/v1/documents/file/${gridFsFile._id}` : `/uploads/conventions/${file.filename}`,
        mimeType: file.mimetype,
        taille: file.size,
        gridFsId: gridFsFile ? gridFsFile._id : null,
        dateDepot: new Date(),
        statut: 'DeposeeEtudiant',
        signedByRH: false
    };

    internship.convention = conventionData;
    await internship.save();

    // Notification au RH
    try {
        const rhUsers = await UtilisateurInterne.find({ 
            roleId: await Role.findOne({ nom: 'RH' }) 
        }).select('_id');
        
        for (const rh of rhUsers) {
            await Notification.create({
                type: 'InApp',
                titre: '📄 Nouvelle convention déposée',
                message: `L'étudiant ${req.user.prenom} ${req.user.nom} a déposé sa convention signée.`,
                userId: rh._id,
                userModel: 'UtilisateurInterne',
                lien: `/rh/generate-convention`,
            });
        }
        console.log('✅ [uploadConvention] Notifications envoyées aux RH');
    } catch (notifError) {
        console.warn('⚠️ [uploadConvention] Erreur notification:', notifError.message);
    }

    logger.audit('CONVENTION_UPLOAD', {
        internshipId: internship._id,
        studentId: req.user.id,
        fileName: file.originalname
    });

    return res.status(200).json({
        success: true,
        data: internship.convention,
        message: 'Convention déposée avec succès'
    });
});

// ============================================
// ✅ CONVENTION - SIGNER LA CONVENTION (RH)
// ============================================
exports.signConvention = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { position } = req.body;

    console.log('🔍 [signConvention] ID:', id);
    console.log('🔍 [signConvention] position reçue:', !!position);

    const internship = await Internship.findById(id);
    if (!internship || !internship.convention) {
        throw ApiError.notFound('Convention non trouvée');
    }

    if (internship.convention.statut !== 'DeposeeEtudiant') {
        throw ApiError.badRequest(`La convention doit être déposée par l'étudiant. Statut actuel: ${internship.convention.statut}`);
    }

    internship.convention.statut = 'SigneeRH';
    internship.convention.dateSignature = new Date();
    internship.convention.signedByRH = true;
    internship.convention.signatureRH = {
        date: new Date(),
        rhId: req.user.id,
        rhNom: `${req.user.prenom || ''} ${req.user.nom || ''}`.trim(),
        signatureData: null,
        position: {
            x: Number(position?.x || 50),
            y: Number(position?.y || 280),
            width: Number(position?.width || 150),
            height: Number(position?.height || 60),
            page: Number(position?.page || 0)
        }
    };

    await internship.save();

    logger.audit('CONVENTION_SIGN', {
        internshipId: internship._id,
        rhId: req.user.id
    });

    return res.status(200).json({
        success: true,
        data: internship.convention,
        message: 'Convention signée avec succès'
    });
});

// ============================================
// ✅ CONVENTION - TÉLÉCHARGER LA CONVENTION (GÉNÉRIQUE)
// ============================================
exports.downloadConventionGeneric = asyncHandler(async (req, res) => {
    const { id } = req.params;

    console.log('🔍 [downloadConventionGeneric] ID:', id);

    const internship = await Internship.findById(id);
    if (!internship || !internship.convention) {
        throw ApiError.notFound('Convention non trouvée');
    }

    // Vérifier les permissions
    const isStudent = internship.etudiantId.toString() === req.user.id.toString();
    const isEncadrant = internship.encadrantId && internship.encadrantId.toString() === req.user.id.toString();
    const isRH = req.user.role === 'RH' || req.user.role === 'Administrateur';

    if (!isStudent && !isEncadrant && !isRH) {
        throw ApiError.forbidden('Vous n\'êtes pas autorisé à télécharger cette convention');
    }

    // Si c'est l'étudiant, vérifier que la convention est signée
    if (isStudent && internship.convention.statut !== 'EnvoyeeEtudiant' && 
        internship.convention.statut !== 'Cloturee') {
        throw ApiError.badRequest('La convention n\'est pas encore disponible');
    }

    const filePath = internship.convention.cheminSignee || internship.convention.chemin;
    if (!fs.existsSync(filePath)) {
        throw ApiError.notFound('Le fichier n\'existe plus');
    }

    console.log('✅ [downloadConventionGeneric] Fichier trouvé:', filePath);

    res.download(filePath, `Convention_${internship.convention.nomOriginal || 'stage'}.pdf`);
});

// ============================================
// EXPORTS
// ============================================
module.exports = exports;