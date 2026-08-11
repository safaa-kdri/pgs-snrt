// src/services/pdfService.js
// Installation: npm install pdfkit
// ✅ CORRECTION : Utiliser le fichier PDF existant dans uploads/engagements/
// ✅ AJOUT : Génération de la demande de stage avec logo SNRT - Style professionnel

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

// ============================================
// CONFIGURATION DES MARGES (2.5cm haut, 2cm bas, 3cm gauche, 2.8cm droite)
// ============================================
const MARGINS = {
    top: 70,    // 2.5 cm
    bottom: 60,  // 2 cm
    left: 85,    // 3 cm
    right: 80    // 2.8 cm
};

// ============================================
// S'assurer que les dossiers existent
// ============================================
const ensureDirectoryExists = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

// ============================================
// Générer une attestation de stage
// ============================================
exports.generateAttestation = async (internship) => {
    try {
        const doc = new PDFDocument({
            size: 'A4',
            margins: MARGINS
        });

        const filePath = path.join(
            __dirname,
            '../../uploads/attestations',
            `attestation_${internship._id}.pdf`
        );

        ensureDirectoryExists(path.dirname(filePath));

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // ============================================
        // POLICES - Times New Roman
        // ============================================
        const FONT = 'Times-Roman';
        const FONT_BOLD = 'Times-Bold';
        const FONT_ITALIC = 'Times-Italic';

        // ============================================
        // LOGO
        // ============================================
        const logoPath = path.join(__dirname, '../../uploads/images/snrt-logo.jpg');
        if (fs.existsSync(logoPath)) {
            const centerX = (doc.page.width - MARGINS.left - MARGINS.right) / 2 + MARGINS.left;
            doc.image(logoPath, centerX - 50, MARGINS.top - 10, { width: 100, height: 40, align: 'center' });
            doc.moveDown(2);
        } else {
            doc.moveDown(0.5);
        }

        doc.fontSize(20)
            .font(FONT_BOLD)
            .text('ATTESTATION DE STAGE', { align: 'center' });

        doc.moveDown(2);

        doc.fontSize(12)
            .font(FONT)
            .text('La Société Nationale de Radiodiffusion et de Télévision (SNRT)', { align: 'center' });

        doc.moveDown();

        const etudiant = internship.etudiantId || {};
        doc.text(`atteste que ${etudiant.prenom || ''} ${etudiant.nom || ''}`, { align: 'center' });
        doc.text(`a effectué un stage du ${new Date(internship.dateDebut).toLocaleDateString('fr-FR')}`, { align: 'center' });
        doc.text(`au ${new Date(internship.dateFin).toLocaleDateString('fr-FR')}`, { align: 'center' });

        doc.moveDown();

        doc.text(`Sujet du stage: ${internship.offreId?.titre || 'Non spécifié'}`, { align: 'center' });

        doc.moveDown();

        if (internship.noteFinale !== undefined && internship.noteFinale !== null) {
            doc.text(`Note finale: ${internship.noteFinale}/20`, { align: 'center' });
        }

        doc.moveDown(2);

        doc.fontSize(10)
            .text(`Fait à Rabat, le ${new Date().toLocaleDateString('fr-FR')}`, { align: 'center' });

        doc.moveDown(2);

        doc.text('Signature du responsable RH', { align: 'center' });

        doc.moveDown(3);

        // Pied de page
        const footerY = doc.page.height - MARGINS.bottom - 30;
        doc.moveTo(MARGINS.left, footerY)
           .lineTo(doc.page.width - MARGINS.right, footerY)
           .strokeColor('#cccccc')
           .lineWidth(0.5)
           .stroke();

        doc.fontSize(8)
            .font(FONT)
            .text('SNRT - Société Nationale de Radiodiffusion et de Télévision', { align: 'center' })
            .text('1 Rue El Brihi Avenue Moulay Abdelaziz - Hassan - Rabat', { align: 'center' });

        doc.end();

        return new Promise((resolve, reject) => {
            stream.on('finish', () => {
                logger.info(`Attestation générée: ${filePath}`);
                resolve(filePath);
            });
            stream.on('error', (error) => {
                logger.error(`Erreur generation attestation: ${error.message}`);
                reject(error);
            });
        });
    } catch (error) {
        logger.error(`Erreur generateAttestation: ${error.message}`);
        throw error;
    }
};

// ============================================
// Générer une convention de stage
// ============================================
exports.generateConvention = async (internship) => {
    try {
        const doc = new PDFDocument({
            size: 'A4',
            margins: MARGINS
        });

        const filePath = path.join(
            __dirname,
            '../../uploads/conventions',
            `convention_${internship._id}.pdf`
        );

        ensureDirectoryExists(path.dirname(filePath));

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        const FONT = 'Times-Roman';
        const FONT_BOLD = 'Times-Bold';

        const logoPath = path.join(__dirname, '../../uploads/images/snrt-logo.jpg');
        if (fs.existsSync(logoPath)) {
            const centerX = (doc.page.width - MARGINS.left - MARGINS.right) / 2 + MARGINS.left;
            doc.image(logoPath, centerX - 50, MARGINS.top - 10, { width: 100, height: 40, align: 'center' });
            doc.moveDown(2);
        } else {
            doc.moveDown(0.5);
        }

        doc.fontSize(20)
            .font(FONT_BOLD)
            .text('CONVENTION DE STAGE', { align: 'center' });

        doc.moveDown(2);

        doc.fontSize(14)
            .font(FONT_BOLD)
            .text('ENTRE :');

        doc.moveDown(0.5);

        doc.fontSize(12)
            .font(FONT)
            .text('La Société Nationale de Radiodiffusion et de Télévision (SNRT)');
        doc.text('1 Rue El Brihi Avenue Moulay Abdelaziz - Hassan - Rabat');
        doc.text('Représentée par Monsieur/Madame le Directeur des Ressources Humaines');

        doc.moveDown();

        doc.fontSize(14)
            .font(FONT_BOLD)
            .text('ET :');

        doc.moveDown(0.5);

        const etudiant = internship.etudiantId || {};
        doc.fontSize(12)
            .font(FONT)
            .text(`Monsieur/Madame ${etudiant.prenom || ''} ${etudiant.nom || ''}`);
        if (etudiant.dateNaissance) {
            doc.text(`Né(e) le ${new Date(etudiant.dateNaissance).toLocaleDateString('fr-FR')}`);
        }
        doc.text(`Adresse: ${etudiant.adresse || 'Non spécifiée'}`);
        doc.text(`Étudiant(e) à ${etudiant.universite || 'Non spécifiée'}`);

        doc.moveDown();

        doc.fontSize(14)
            .font(FONT_BOLD)
            .text('IL A ÉTÉ CONVENU CE QUI SUIT :');

        doc.moveDown();

        doc.fontSize(12)
            .font(FONT_BOLD)
            .text('Article 1 - Objet du stage');

        doc.fontSize(12)
            .font(FONT)
            .text('Le stage a pour objet de permettre à l\'étudiant de mettre en pratique ses connaissances théoriques.');

        doc.moveDown();

        doc.fontSize(12)
            .font(FONT_BOLD)
            .text('Article 2 - Durée du stage');

        doc.fontSize(12)
            .font(FONT)
            .text(`Le stage se déroule du ${new Date(internship.dateDebut).toLocaleDateString('fr-FR')}`);
        doc.text(`au ${new Date(internship.dateFin).toLocaleDateString('fr-FR')}`);

        doc.moveDown();

        doc.fontSize(12)
            .font(FONT_BOLD)
            .text('Article 3 - Missions');

        doc.fontSize(12)
            .font(FONT)
            .text(`Les missions confiées au stagiaire sont définies dans le sujet de stage: ${internship.offreId?.titre || 'Non spécifié'}`);

        doc.moveDown();

        doc.fontSize(12)
            .font(FONT_BOLD)
            .text('Article 4 - Encadrement');

        const encadrant = internship.encadrantId || {};
        doc.fontSize(12)
            .font(FONT)
            .text(`Le stagiaire sera encadré par ${encadrant.prenom || ''} ${encadrant.nom || ''}.`);

        doc.moveDown(2);

        doc.fontSize(10)
            .text(`Fait à Rabat, le ${new Date().toLocaleDateString('fr-FR')}`, { align: 'center' });

        doc.moveDown(2);

        const pageWidth = doc.page.width - MARGINS.left - MARGINS.right;
        const colWidth = pageWidth / 3;

        doc.fontSize(10)
            .text('Signature du stagiaire', MARGINS.left + colWidth * 0, doc.y, { width: colWidth, align: 'center' })
            .text('Signature de l\'encadrant', MARGINS.left + colWidth * 1, doc.y, { width: colWidth, align: 'center' })
            .text('Signature du RH', MARGINS.left + colWidth * 2, doc.y, { width: colWidth, align: 'center' });

        doc.end();

        return new Promise((resolve, reject) => {
            stream.on('finish', () => {
                logger.info(`Convention générée: ${filePath}`);
                resolve(filePath);
            });
            stream.on('error', (error) => {
                logger.error(`Erreur generation convention: ${error.message}`);
                reject(error);
            });
        });
    } catch (error) {
        logger.error(`Erreur generateConvention: ${error.message}`);
        throw error;
    }
};

// ============================================
// Générer un rapport de stage (template)
// ============================================
exports.generateRapportTemplate = async (internship) => {
    try {
        const doc = new PDFDocument({
            size: 'A4',
            margins: MARGINS
        });

        const filePath = path.join(
            __dirname,
            '../../uploads/rapports',
            `rapport_template_${internship._id}.pdf`
        );

        ensureDirectoryExists(path.dirname(filePath));

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        const FONT = 'Times-Roman';
        const FONT_BOLD = 'Times-Bold';

        const logoPath = path.join(__dirname, '../../uploads/images/snrt-logo.jpg');
        if (fs.existsSync(logoPath)) {
            const centerX = (doc.page.width - MARGINS.left - MARGINS.right) / 2 + MARGINS.left;
            doc.image(logoPath, centerX - 50, MARGINS.top - 10, { width: 100, height: 40, align: 'center' });
            doc.moveDown(2);
        } else {
            doc.moveDown(0.5);
        }

        doc.fontSize(24)
            .font(FONT_BOLD)
            .text('RAPPORT DE STAGE', { align: 'center' });

        doc.moveDown(3);

        doc.fontSize(18)
            .font(FONT_BOLD)
            .text(internship.offreId?.titre || 'Stage', { align: 'center' });

        doc.moveDown(2);

        const etudiant = internship.etudiantId || {};
        doc.fontSize(14)
            .font(FONT)
            .text(`Présenté par: ${etudiant.prenom || ''} ${etudiant.nom || ''}`, { align: 'center' });

        doc.moveDown();

        doc.text(`Encadré par: ${internship.encadrantId?.prenom || ''} ${internship.encadrantId?.nom || ''}`, { align: 'center' });

        doc.moveDown(3);

        doc.text(`SNRT - ${new Date().toLocaleDateString('fr-FR')}`, { align: 'center' });

        doc.addPage();

        doc.fontSize(18)
            .font(FONT_BOLD)
            .text('SOMMAIRE', { align: 'center' });

        doc.moveDown(2);

        const sections = [
            '1. Introduction',
            '2. Présentation de l\'entreprise',
            '3. Description des missions',
            '4. Développement du travail réalisé',
            '5. Résultats et réalisations',
            '6. Analyse critique',
            '7. Conclusion',
            '8. Bibliographie'
        ];

        sections.forEach((section, index) => {
            doc.fontSize(12)
                .font(FONT)
                .text(`${section}`, { continued: true })
                .text(`${index + 1}`, { align: 'right' });
            doc.moveDown(0.5);
        });

        doc.end();

        return new Promise((resolve, reject) => {
            stream.on('finish', () => {
                logger.info(`Template rapport généré: ${filePath}`);
                resolve(filePath);
            });
            stream.on('error', (error) => {
                logger.error(`Erreur generation template rapport: ${error.message}`);
                reject(error);
            });
        });
    } catch (error) {
        logger.error(`Erreur generateRapportTemplate: ${error.message}`);
        throw error;
    }
};

// ============================================
// Fonction utilitaire pour supprimer un PDF
// ============================================
exports.deletePDF = async (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            logger.info(`PDF supprimé: ${filePath}`);
            return true;
        }
        return false;
    } catch (error) {
        logger.error(`Erreur deletePDF: ${error.message}`);
        return false;
    }
};

// ============================================
// ✅ GÉNÉRER LA DEMANDE DE STAGE POUR LE DIRECTEUR
// ✅ Style professionnel - Times New Roman - Logo centré
// ============================================
exports.generateDemandeStage = async (internshipData) => {
    return new Promise((resolve, reject) => {
        try {
            const { _id, etudiantId, dateDebut, dateFin, etudiantNom } = internshipData;
            
            // Créer le dossier si inexistant
            const dir = path.join(__dirname, '../../uploads/demandes');
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            const fileName = `demande_stage_${_id || Date.now()}.pdf`;
            const filePath = path.join(dir, fileName);
            
            // Créer le document PDF avec les marges personnalisées
            const doc = new PDFDocument({
                size: 'A4',
                margins: MARGINS,
                info: {
                    Title: 'Demande de Stage - SNRT',
                    Author: 'SNRT - PGS',
                    Subject: 'Demande de stage pour le Directeur'
                }
            });

            const writeStream = fs.createWriteStream(filePath);
            doc.pipe(writeStream);

            // ============================================
            // POLICES - Times New Roman uniquement
            // ============================================
            const FONT = 'Times-Roman';
            const FONT_BOLD = 'Times-Bold';
            const FONT_ITALIC = 'Times-Italic';
            const FONT_SIZE = 14;
            const FONT_SIZE_FOOTER = 9;

            // ============================================
            // LOGO - Centré, taille réduite
            // ============================================
            const logoPath = path.join(__dirname, '../../uploads/images/snrt-logo.jpg');
            const logoExists = fs.existsSync(logoPath);

            const pageWidth = doc.page.width - MARGINS.left - MARGINS.right;
            const centerX = doc.page.width / 2;

            if (logoExists) {
                try {
                    const logoWidth = 90;   // Taille réduite
                    const logoHeight = 35;
                    const logoX = centerX - (logoWidth / 2);
                    const logoY = MARGINS.top - 5;
                    
                    doc.image(logoPath, logoX, logoY, {
                        width: logoWidth,
                        height: logoHeight,
                        align: 'center'
                    });
                    
                    // Espace après le logo (1 cm)
                    doc.moveDown(1.8);
                } catch (err) {
                    logger.warn(`Erreur chargement logo: ${err.message}`);
                    doc.moveDown(0.5);
                }
            } else {
                logger.warn(`Logo non trouvé: ${logoPath}`);
                doc.moveDown(0.5);
            }

            // ============================================
            // LETTRE "A" (centrée, en gras, plus grande)
            // ============================================
            doc.font(FONT_BOLD)
               .fontSize(16)
               .text('A', { align: 'center' })
               .moveDown(0.8);

            // ============================================
            // DESTINATAIRE (2 lignes, centré, gras)
            // ============================================
            doc.font(FONT_BOLD)
               .fontSize(FONT_SIZE)
               .text('Monsieur le Directeur Adjoint', { align: 'center' })
               .text('Chargé des Infrastructures et des Systèmes d\'Information', { align: 'center' })
               .moveDown(0.8);

            // ============================================
            // OBJET
            // ============================================
            // "Objet :" en gras, le reste en normal, nom en gras
            doc.font(FONT_BOLD)
               .fontSize(FONT_SIZE)
               .text('Objet :', { continued: true });
            
            doc.font(FONT)
               .text(' Demande de stage concernant : ', { continued: true });
            
            doc.font(FONT_BOLD)
               .text(etudiantNom || 'Nom Prénom')
               .moveDown(0.8);

            // ============================================
            // CORPS DU TEXTE (justifié, interligne 1.5)
            // ============================================
            const dateFormatted = new Date().toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            });

            const dateDebutFormatted = new Date(dateDebut).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            });

            const dateFinFormatted = new Date(dateFin).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            });

            doc.font(FONT)
               .fontSize(FONT_SIZE)
               .text(
                   `Faisant suite à votre accord de stage concernant "${etudiantNom || 'Nom Prénom'}" pour la période du ${dateDebutFormatted} au ${dateFinFormatted} au sein de votre direction ; j'ai l'honneur de vous demander de bien vouloir renseigner la fiche de stage ci-jointe, afin de confirmer la période du stage et de la retourner à la Direction des Ressources Humaines.`,
                   {
                       align: 'justify',
                       lineGap: 4  // interligne 1.5
                   }
               )
               .moveDown(0.8);

            // ============================================
            // SIGNATURE + DATE
            // ============================================
            // Signature à gauche
            doc.font(FONT_BOLD)
               .fontSize(FONT_SIZE)
               .text('La Direction des Ressources Humaines', {
                   align: 'left',
                   continued: false
               });

            doc.moveDown(0.2)
               .font(FONT_ITALIC)
               .fontSize(FONT_SIZE)
               .text('(Signature et cachet)', {
                   align: 'left',
                   continued: false
               });

            // Date à droite (même niveau que la signature)
            const dateY = doc.y;
            doc.font(FONT)
               .fontSize(FONT_SIZE)
               .text(`Fait à Rabat le : ${dateFormatted}`, {
                   align: 'right',
                   continued: false
               })
               .moveDown(1.5);

            // ============================================
            // NB (en gras, 2 lignes)
            // ============================================
            doc.font(FONT_BOLD)
               .fontSize(FONT_SIZE)
               .text('NB :', { continued: true });
            
            doc.font(FONT)
               .text(' Le stagiaire doit présenter à la Direction des Ressources Humaines la présente lettre')
               .text('pour toute demande d\'attestation de stage.', { indent: 20 })
               .moveDown(1.2);

            // ============================================
            // LIGNE DE SÉPARATION + PIED DE PAGE
            // ============================================
            const footerY = doc.page.height - MARGINS.bottom - 45;
            doc.moveTo(MARGINS.left, footerY)
               .lineTo(doc.page.width - MARGINS.right, footerY)
               .strokeColor('#cccccc')
               .lineWidth(0.5)
               .stroke();

            // Pied de page (centré, taille 9pt, interligne réduit)
            doc.font(FONT)
               .fontSize(FONT_SIZE_FOOTER)
               .text(
                   'SNRT SA, Capital social : 1 275 000 000,00 Dirhams – Siège social : 1, Rue El Brihi - Rabat 10.000 - Maroc',
                   {
                       align: 'center',
                       lineGap: 1,
                       continued: false
                   }
               )
               .text(
                   'Tél. : +212 (0)5 37 66 91 90 / +212 (0)5 37 68 52 00 – Fax : +212 (0)5 37 72 20 47',
                   {
                       align: 'center',
                       lineGap: 1,
                       continued: false
                   }
               )
               .text(
                   'R.C. : 60485 – T.P. : 25197490 – I.F. : 3304097 – I.C.E. : 000211903000067',
                   {
                       align: 'center',
                       lineGap: 1,
                       continued: false
                   }
               )
               .text(
                   'Site Web : www.snrt.ma',
                   {
                       align: 'center',
                       lineGap: 1,
                       continued: false
                   }
               );

            // Finaliser le PDF
            doc.end();

            writeStream.on('finish', () => {
                logger.info(`Demande de stage générée: ${filePath}`);
                resolve(filePath);
            });

            writeStream.on('error', (err) => {
                logger.error(`Erreur écriture PDF: ${err.message}`);
                reject(err);
            });

        } catch (error) {
            logger.error(`Erreur generateDemandeStage: ${error.message}`);
            reject(error);
        }
    });
};

// ============================================
// GÉNÉRER LE PDF D'ENGAGEMENT DE CONFIDENTIALITÉ
// Utiliser le fichier PDF existant dans uploads/engagements/
// ============================================
exports.generateEngagementConfidentialite = async (internshipData) => {
    try {
        // Chemin du fichier PDF existant dans uploads/engagements/
        const pdfPath = path.join(
            __dirname,
            '../../uploads/engagements/PSRH-PR01-EN10-A ENGAGEMENT DE CONFIDENTIALITE RESERVE AUX STAGIAIRES.pdf'
        );

        logger.info(`[generateEngagementConfidentialite] Recherche du fichier: ${pdfPath}`);

        // Vérifier que le fichier existe
        if (fs.existsSync(pdfPath)) {
            logger.info(`[generateEngagementConfidentialite] Fichier trouvé: ${pdfPath}`);

            // Créer le dossier temporaire si nécessaire
            const tempDir = path.join(__dirname, '../../uploads/engagements');
            ensureDirectoryExists(tempDir);

            // Copier le fichier avec un nom unique pour le stage
            const fileName = `engagement_confidentialite_${internshipData._id || Date.now()}.pdf`;
            const destPath = path.join(tempDir, fileName);

            // Copier le fichier
            fs.copyFileSync(pdfPath, destPath);

            logger.info(`[generateEngagementConfidentialite] Fichier copié: ${destPath}`);

            return destPath;
        }

        // Fallback : Le fichier n'existe pas, générer un PDF simple
        logger.warn(`[generateEngagementConfidentialite] Fichier non trouvé: ${pdfPath}, génération du fallback...`);
        return await generateEngagementFallback(internshipData);

    } catch (error) {
        logger.error(`[generateEngagementConfidentialite] Erreur: ${error.message}`);
        // Fallback en cas d'erreur
        return await generateEngagementFallback(internshipData);
    }
};

// ============================================
// FALLBACK : Générer un PDF simple si le fichier n'existe pas
// ============================================
const generateEngagementFallback = async (internshipData) => {
    try {
        const doc = new PDFDocument({
            size: 'A4',
            margins: MARGINS
        });

        const filePath = path.join(
            __dirname,
            '../../uploads/engagements',
            `engagement_confidentialite_${internshipData._id || Date.now()}.pdf`
        );

        ensureDirectoryExists(path.dirname(filePath));

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        const FONT = 'Times-Roman';
        const FONT_BOLD = 'Times-Bold';

        const logoPath = path.join(__dirname, '../../uploads/images/snrt-logo.jpg');
        if (fs.existsSync(logoPath)) {
            const centerX = (doc.page.width - MARGINS.left - MARGINS.right) / 2 + MARGINS.left;
            doc.image(logoPath, centerX - 50, MARGINS.top - 10, { width: 100, height: 40, align: 'center' });
            doc.moveDown(2);
        } else {
            doc.moveDown(0.5);
        }

        doc.fontSize(16)
            .font(FONT_BOLD)
            .text('PSRH-PR01-EN10-A', { align: 'center' });

        doc.moveDown(0.5);

        doc.fontSize(14)
            .font(FONT_BOLD)
            .text('ENGAGEMENT DE CONFIDENTIALITÉ', { align: 'center' });
        doc.text('RÉSERVÉ AUX STAGIAIRES', { align: 'center' });

        doc.moveDown(3);

        const etudiant = internshipData.etudiantId || {};
        
        doc.fontSize(12)
            .font(FONT)
            .text(`Je soussigné(e), ${etudiant.prenom || ''} ${etudiant.nom || ''}, stagiaire au sein de la Société Nationale de Radiodiffusion et de Télévision (SNRT), m'engage à respecter la confidentialité des informations auxquelles j'aurai accès durant mon stage.`);

        doc.moveDown();

        doc.text(`Je m'engage à :`);

        const engagements = [
            'Ne pas divulguer les informations confidentielles de la SNRT',
            'Ne pas reproduire ou copier les documents sans autorisation',
            'Respecter les règles de sécurité et de confidentialité',
            'Ne pas utiliser les informations à des fins personnelles',
            'Restituer tous les documents et supports à la fin du stage'
        ];

        engagements.forEach((item, index) => {
            doc.text(`  ${index + 1}. ${item}`);
        });

        doc.moveDown();

        doc.text(`Fait à Rabat, le ${new Date().toLocaleDateString('fr-FR')}`);

        doc.moveDown(2);

        doc.text('Signature du stagiaire : _________________________');

        doc.end();

        return new Promise((resolve, reject) => {
            stream.on('finish', () => {
                logger.info(`Engagement confidentialité généré (fallback): ${filePath}`);
                resolve(filePath);
            });
            stream.on('error', (error) => {
                logger.error(`Erreur generation engagement (fallback): ${error.message}`);
                reject(error);
            });
        });
    } catch (error) {
        logger.error(`Erreur generateEngagementFallback: ${error.message}`);
        throw error;
    }
};

// ============================================
// EXPORTS
// ============================================
module.exports = {
    generateAttestation: exports.generateAttestation,
    generateConvention: exports.generateConvention,
    generateRapportTemplate: exports.generateRapportTemplate,
    deletePDF: exports.deletePDF,
    generateDemandeStage: exports.generateDemandeStage,
    generateEngagementConfidentialite: exports.generateEngagementConfidentialite,
};