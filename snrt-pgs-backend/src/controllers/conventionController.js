// src/controllers/conventionController.js
// ✅ CONTROLLER POUR LA GESTION DES CONVENTIONS
// ✅ AJOUT : Ajouter la signature sur le PDF existant avec pdf-lib
// ✅ AJOUT : Fonctions uploadConvention, signConvention, downloadConvention

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
const { PDFDocument } = require('pdf-lib');

// ============================================
// ✅ LISTE DES STATUTS AUTORISÉS POUR LA CONVENTION
// ============================================
const CONVENTION_ALLOWED_STATUSES = [
    'EnCours',
    'Acceptee', 
    'DemandeEnvoyee',
    'EngagementEnvoye',
    'EngagementRecu',
    'EngagementValide',
    'EnAttenteEngagement',
    'ValideParDirecteur',
    'Cloturee',
    'Termine'
];

// ============================================
// ÉTUDIANT - DÉPOSER LA CONVENTION
// ============================================
exports.deposerConvention = asyncHandler(async (req, res) => {
    const studentId = req.user.id;

    console.log('🔍 [deposerConvention] ===== DEBUT ====');
    console.log('🔍 [deposerConvention] studentId:', studentId);

    const allInternships = await Internship.find({ etudiantId: studentId });
    console.log('🔍 [deposerConvention] Tous les stages de l\'étudiant:', allInternships.length);
    console.log('🔍 [deposerConvention] Statuts des stages:', allInternships.map(i => i.statut));

    const internship = await Internship.findOne({
        etudiantId: studentId,
        statut: { $in: CONVENTION_ALLOWED_STATUSES }
    }).populate('offreId');

    console.log('🔍 [deposerConvention] internship trouvé:', internship ? internship._id : 'NON TROUVÉ');
    console.log('🔍 [deposerConvention] statut internship:', internship?.statut);

    if (!internship) {
        throw ApiError.notFound('Aucun stage actif trouvé pour cet étudiant');
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

    console.log('🔍 [getConventionStatus] studentId:', studentId);

    const internship = await Internship.findOne({
        etudiantId: studentId,
        statut: { $in: CONVENTION_ALLOWED_STATUSES }
    });

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

    console.log('🔍 [downloadConvention] studentId:', studentId);

    const internship = await Internship.findOne({
        etudiantId: studentId,
        statut: { $in: CONVENTION_ALLOWED_STATUSES }
    });

    if (!internship || !internship.convention) {
        throw ApiError.notFound('Aucune convention trouvée');
    }

    if (internship.convention.statut !== 'EnvoyeeEtudiant' && 
        internship.convention.statut !== 'Cloturee') {
        throw ApiError.badRequest('La convention n\'est pas encore disponible');
    }

    const filePath = internship.convention.cheminSignee || internship.convention.chemin;
    if (!fs.existsSync(filePath)) {
        throw ApiError.notFound('Le fichier n\'existe plus');
    }

    console.log('✅ [downloadConvention] Fichier trouvé:', filePath);

    res.download(filePath, `Convention_Stage_${internship.convention.nomOriginal}`);
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
    const { signature } = req.body;

    console.log('🔍 [signerConvention] ===== DEBUT ====');
    console.log('🔍 [signerConvention] conventionId:', id);
    console.log('🔍 [signerConvention] rhId:', req.user?.id);
    console.log('🔍 [signerConvention] signature reçue:', !!signature);

    const internship = await Internship.findById(id);

    if (!internship || !internship.convention) {
        throw ApiError.notFound('Convention non trouvée');
    }

    if (internship.convention.statut !== 'DeposeeEtudiant' && 
        internship.convention.statut !== 'NonGeneree') {
        throw ApiError.badRequest('Cette convention ne peut pas être signée');
    }

    internship.convention.statut = 'SigneeRH';
    internship.convention.dateSignature = new Date();
    internship.convention.signedByRH = true;
    internship.convention.signatureRH = {
        date: new Date(),
        rhId: req.user.id,
        rhNom: `${req.user.prenom || ''} ${req.user.nom || ''}`.trim(),
        signatureData: signature || null
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

    if (internship.convention.statut !== 'SigneeRH') {
        throw ApiError.badRequest('La convention doit être signée avant d\'ajouter la signature');
    }

    const signatureData = internship.convention.signatureRH?.signatureData;
    if (!signatureData) {
        throw ApiError.badRequest('Aucune signature trouvée');
    }

    const originalPdfPath = internship.convention.chemin;
    if (!fs.existsSync(originalPdfPath)) {
        throw ApiError.notFound('Le fichier PDF original n\'existe plus');
    }

    console.log('🔍 [ajouterSignatureSurPDF] PDF original:', originalPdfPath);

    try {
        const originalPdfBytes = fs.readFileSync(originalPdfPath);
        const pdfDoc = await PDFDocument.load(originalPdfBytes);

        const base64Data = signatureData.replace(/^data:image\/png;base64,/, '');
        const imageBuffer = Buffer.from(base64Data, 'base64');
        const pngImage = await pdfDoc.embedPng(imageBuffer);

        const pages = pdfDoc.getPages();
        const firstPage = pages[0];
        const { width, height } = firstPage.getSize();

        // Position de la signature (ajuste selon ton PDF)
        const signatureWidth = 150;
        const signatureHeight = 60;
        const signatureX = 50;
        const signatureY = height - 280;

        firstPage.drawImage(pngImage, {
            x: signatureX,
            y: signatureY,
            width: signatureWidth,
            height: signatureHeight,
        });

        // Cadre autour de la signature
        firstPage.drawRectangle({
            x: signatureX - 2,
            y: signatureY - 2,
            width: signatureWidth + 4,
            height: signatureHeight + 4,
            borderColor: { r: 0.6, g: 0.6, b: 0.6 },
            borderWidth: 1,
        });

        const pdfBytes = await pdfDoc.save();

        const fileName = `convention_signee_${internship._id}_${Date.now()}.pdf`;
        const outputPath = path.join(__dirname, '../../uploads/conventions/', fileName);
        fs.writeFileSync(outputPath, pdfBytes);

        console.log('✅ [ajouterSignatureSurPDF] PDF signé sauvegardé:', outputPath);

        internship.convention.cheminSignee = outputPath;
        internship.convention.urlSignee = `/uploads/conventions/${fileName}`;
        internship.convention.statut = 'EnvoyeeEtudiant';
        await internship.save();

        logger.audit('CONVENTION_SIGNEE_PDF_GENERATED', {
            internshipId: internship._id,
            fileName: fileName,
            rhId: req.user.id
        });

        res.download(outputPath, `Convention_Signee_${internship.etudiantId?.nom || 'stage'}.pdf`);

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

    if (internship.convention.statut !== 'SigneeRH') {
        throw ApiError.badRequest('La convention doit être signée avant d\'être envoyée');
    }

    // Si la convention n'a pas encore été signée sur le PDF, le faire maintenant
    if (!internship.convention.cheminSignee) {
        // Appeler la fonction d'ajout de signature
        const signatureData = internship.convention.signatureRH?.signatureData;
        if (!signatureData) {
            throw ApiError.badRequest('Aucune signature trouvée');
        }

        const originalPdfPath = internship.convention.chemin;
        if (!fs.existsSync(originalPdfPath)) {
            throw ApiError.notFound('Le fichier PDF original n\'existe plus');
        }

        const originalPdfBytes = fs.readFileSync(originalPdfPath);
        const pdfDoc = await PDFDocument.load(originalPdfBytes);

        const base64Data = signatureData.replace(/^data:image\/png;base64,/, '');
        const imageBuffer = Buffer.from(base64Data, 'base64');
        const pngImage = await pdfDoc.embedPng(imageBuffer);

        const pages = pdfDoc.getPages();
        const firstPage = pages[0];
        const { width, height } = firstPage.getSize();

        const signatureWidth = 150;
        const signatureHeight = 60;
        const signatureX = 50;
        const signatureY = height - 280;

        firstPage.drawImage(pngImage, {
            x: signatureX,
            y: signatureY,
            width: signatureWidth,
            height: signatureHeight,
        });

        firstPage.drawRectangle({
            x: signatureX - 2,
            y: signatureY - 2,
            width: signatureWidth + 4,
            height: signatureHeight + 4,
            borderColor: { r: 0.6, g: 0.6, b: 0.6 },
            borderWidth: 1,
        });

        const pdfBytes = await pdfDoc.save();

        const fileName = `convention_signee_${internship._id}_${Date.now()}.pdf`;
        const outputPath = path.join(__dirname, '../../uploads/conventions/', fileName);
        fs.writeFileSync(outputPath, pdfBytes);

        internship.convention.cheminSignee = outputPath;
        internship.convention.urlSignee = `/uploads/conventions/${fileName}`;
    }

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

    const filePath = internship.convention.cheminSignee || internship.convention.chemin;
    if (!fs.existsSync(filePath)) {
        throw ApiError.notFound('Le fichier n\'existe plus');
    }

    console.log('✅ [downloadConventionRH] Fichier trouvé:', filePath);

    res.download(filePath, `Convention_${internship.convention.nomOriginal}`);
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

    const internship = await Internship.findById(id);
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

    const conventionData = {
        nomOriginal: file.originalname,
        nomStocke: file.filename,
        chemin: file.path,
        url: `/uploads/conventions/${file.filename}`,
        mimeType: file.mimetype,
        taille: file.size,
        dateDepot: new Date(),
        statut: 'DeposeeEtudiant',
        signedByRH: false
    };

    internship.convention = conventionData;
    await internship.save();

    // Notification au RH
    const rhUsers = await UtilisateurInterne.find({ roleId: await Role.findOne({ nom: 'RH' }) }).select('_id');
    for (const rh of rhUsers) {
        await Notification.create({
            type: 'InApp',
            titre: 'Convention déposée',
            message: `L'étudiant ${req.user.prenom} ${req.user.nom} a déposé sa convention signée.`,
            userId: rh._id,
            userModel: 'UtilisateurInterne',
            lien: `/rh/generate-convention`,
        });
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
    const { signature } = req.body;

    console.log('🔍 [signConvention] ID:', id);
    console.log('🔍 [signConvention] signature reçue:', !!signature);

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
        signatureData: signature || null
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