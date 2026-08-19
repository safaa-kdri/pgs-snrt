// src/services/pdfService.js
// Installation: npm install pdfkit
// CORRECTION : Utiliser le fichier PDF existant dans uploads/engagements/
// AJOUT : Génération de la demande de stage avec logo SNRT - Style professionnel
// MODIFICATION : generateDemandeStage - Derniers ajustements pour correspondre exactement à l'original SNRT
// AJOUT : generateResultatsStage - Générer le PDF des résultats
// MODIFICATION : generateResultatsStage - Ajouter la description dans le PDF
// CORRECTION : generateResultatsStage - Retourner un chemin relatif
// MODIFICATION : generateResultatsStage - Version alignée sur le PDF de recrutement SNRT
// CORRECTION FINALE : generateResultatsStage - Texte noir, cachet bien positionné, une seule page

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

// ============================================
// CONFIGURATION DES MARGES (ajustées pour correspondre à l'original)
// ============================================
const MARGINS = {
    top: 70,
    bottom: 55,
    left: 85,
    right: 80
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

        const FONT = 'Times-Roman';
        const FONT_BOLD = 'Times-Bold';
        const FONT_ITALIC = 'Times-Italic';

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
// GENERER LA DEMANDE DE STAGE POUR LE DIRECTEUR
// Version finale ajustée pour correspondre exactement à l'original SNRT
// ============================================
exports.generateDemandeStage = async (internshipData) => {
    return new Promise((resolve, reject) => {
        try {
            const { _id, etudiantId, dateDebut, dateFin, etudiantNom } = internshipData;
            
            const dir = path.join(__dirname, '../../uploads/demandes');
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            const fileName = `demande_stage_${_id || Date.now()}.pdf`;
            const filePath = path.join(dir, fileName);
            
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

            const FONT = 'Times-Roman';
            const FONT_BOLD = 'Times-Bold';
            const FONT_ITALIC = 'Times-Italic';
            const FONT_SIZE = 14;
            const FONT_SIZE_FOOTER = 7.5;

            const logoPath = path.join(__dirname, '../../uploads/images/SNRT-logo-scanned.jpg');
            let logoExists = fs.existsSync(logoPath);
            
            if (!logoExists) {
                const fallbackLogoPath = path.join(__dirname, '../../uploads/images/snrt-logo.jpg');
                logoExists = fs.existsSync(fallbackLogoPath);
            }

            const centerX = doc.page.width / 2;

            if (logoExists) {
                try {
                    const logoMaxWidth = 230;
                    const logoMaxHeight = 98;
                    const logoX = centerX - (logoMaxWidth / 2);
                    const logoY = MARGINS.top - 14;

                    const finalLogoPath = fs.existsSync(path.join(__dirname, '../../uploads/images/SNRT-logo-scanned.jpg'))
                        ? path.join(__dirname, '../../uploads/images/SNRT-logo-scanned.jpg')
                        : path.join(__dirname, '../../uploads/images/snrt-logo.jpg');

                    doc.image(finalLogoPath, logoX, logoY, {
                        fit: [logoMaxWidth, logoMaxHeight],
                        align: 'center',
                        valign: 'top'
                    });

                    doc.y = logoY + logoMaxHeight + 17;
                    doc.x = MARGINS.left;
                } catch (err) {
                    logger.warn(`Erreur chargement logo: ${err.message}`);
                    doc.moveDown(0.5);
                }
            } else {
                logger.warn(`Logo non trouvé`);
                doc.moveDown(0.5);
            }

            doc.font(FONT_BOLD)
               .fontSize(18)
               .text('A', { align: 'center' })
               .moveDown(0.8);

            doc.font(FONT_BOLD)
               .fontSize(13.5)
               .text('Monsieur le Directeur Adjoint Chargé des Infrastructures et des Systèmes', { align: 'center', lineGap: 1 })
               .text("d'Information", { align: 'center', lineGap: 1 })
               .moveDown(2.5);

            doc.x = MARGINS.left;

            doc.font(FONT_BOLD)
               .fontSize(FONT_SIZE)
               .text('Objet : ', { continued: true, lineGap: 4 });

            doc.font(FONT)
               .text(`Demande de stage concernant : ${etudiantNom || 'Nom Prénom'}`)
               .moveDown(1.8);

            doc.x = MARGINS.left;

            const formatDateToFrench = (date) => {
                if (!date) return '';
                const d = new Date(date);
                const day = String(d.getDate()).padStart(2, '0');
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const year = d.getFullYear();
                return `${day}/${month}/${year}`;
            };

            const dateFormatted = formatDateToFrench(new Date());
            const dateDebutFormatted = formatDateToFrench(dateDebut);
            const dateFinFormatted = formatDateToFrench(dateFin);

            const studentName = etudiantNom || 'Nom Prénom';

            doc.font(FONT)
               .fontSize(13.8)
               .text(
                   `Faisant suite à votre accord de stage concernant ${studentName} pour la période du ${dateDebutFormatted} au ${dateFinFormatted} au sein de votre direction ; j'ai l'honneur de vous demander de bien vouloir renseigner la fiche de stage ci-jointe, afin de confirmer la période du stage et de la retourner à la Direction des Ressources Humaines.`,
                   {
                       align: 'justify',
                       lineGap: 14
                   }
               );

            const pageBottom = doc.page.height;
            const footerY = pageBottom - MARGINS.bottom - 45;
            const nbY = footerY - 70;

            const cachetWidth = 172;
            const cachetHeight = 115;
            const cachetGapToNB = 45;
            
            const cachetPath = path.join(__dirname, '../../uploads/images/cachet-snrt-original.png');
            const cachetExists = fs.existsSync(cachetPath);
            const finalCachetPath = cachetExists 
                ? cachetPath 
                : path.join(__dirname, '../../uploads/images/Signature-et-cachet-1.png');
            
            const cachetX = MARGINS.left + 37;
            const cachetY = nbY - cachetGapToNB - cachetHeight - 30;

            const dateWidth = 200;
            const dateX = doc.page.width - MARGINS.right - 200 + 15;
            const dateY = cachetY + (cachetHeight / 2) + 28;

            if (fs.existsSync(finalCachetPath)) {
                try {
                    doc.image(finalCachetPath, cachetX, cachetY, {
                        width: cachetWidth,
                        height: cachetHeight,
                    });
                    logger.info(`Cachet ajouté à la demande de stage`);
                } catch (err) {
                    logger.warn(`Erreur chargement cachet: ${err.message}`);
                }
            } else {
                logger.warn(`Cachet non trouvé: ${finalCachetPath}`);
            }

            doc.font(FONT)
               .fontSize(13)
               .text(`Fait à Rabat le : ${dateFormatted}`, dateX, dateY, {
                   width: dateWidth,
                   align: 'right'
               });

            doc.x = MARGINS.left;
            doc.y = nbY;

            doc.font(FONT_BOLD)
               .fontSize(13.5)
               .text('NB : ', { continued: true });

            doc.font(FONT)
               .fontSize(13.5)
               .text(
                   'Le stagiaire doit présenter à la Direction des Ressources Humaines la présente lettre pour toute demande d\'attestation de stage.',
                   { lineGap: 1 }
               );

            const footerLineInset = 40;
            doc.moveTo(footerLineInset, footerY)
               .lineTo(doc.page.width - footerLineInset, footerY)
               .strokeColor('#888888')
               .lineWidth(0.5)
               .stroke();

            const footerTextMargin = MARGINS.left;
            const footerTextWidth = doc.page.width - (footerTextMargin * 2);

            doc.x = footerTextMargin;
            doc.y = footerY + 8;

            doc.font(FONT)
               .fontSize(FONT_SIZE_FOOTER)
               .text(
                   'SNRT SA, Capital social : 1 275 000 000,00 Dirhams – Siège social : 1, Rue El Brihi - Rabat 10.000 - Maroc',
                   {
                       width: footerTextWidth,
                       align: 'center',
                       lineGap: 0,
                       continued: false
                   }
               )
               .text(
                   'Tél. : +212 (0)5 37 66 91 90 / +212 (0)5 37 68 52 00 – Fax : +212 (0)5 37 72 20 47',
                   {
                       width: footerTextWidth,
                       align: 'center',
                       lineGap: 0,
                       continued: false
                   }
               )
               .text(
                   'R.C. : 60485 – T.P. : 25197490 – I.F. : 3304097 – I.C.E. : 000211903000067',
                   {
                       width: footerTextWidth,
                       align: 'center',
                       lineGap: 0,
                       continued: false
                   }
               )
               .text(
                   'Site Web : www.snrt.ma',
                   {
                       width: footerTextWidth,
                       align: 'center',
                       lineGap: 0,
                       continued: false
                   }
               );

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
// GENERER LE PDF D'ENGAGEMENT DE CONFIDENTIALITÉ
// ============================================
exports.generateEngagementConfidentialite = async (internshipData) => {
    try {
        const pdfPath = path.join(
            __dirname,
            '../../uploads/engagements/PSRH-PR01-EN10-A ENGAGEMENT DE CONFIDENTIALITE RESERVE AUX STAGIAIRES.pdf'
        );

        logger.info(`[generateEngagementConfidentialite] Recherche du fichier: ${pdfPath}`);

        if (fs.existsSync(pdfPath)) {
            logger.info(`[generateEngagementConfidentialite] Fichier trouvé: ${pdfPath}`);

            const tempDir = path.join(__dirname, '../../uploads/engagements');
            ensureDirectoryExists(tempDir);

            const fileName = `engagement_confidentialite_${internshipData._id || Date.now()}.pdf`;
            const destPath = path.join(tempDir, fileName);

            fs.copyFileSync(pdfPath, destPath);

            logger.info(`[generateEngagementConfidentialite] Fichier copié: ${destPath}`);

            return destPath;
        }

        logger.warn(`[generateEngagementConfidentialite] Fichier non trouvé: ${pdfPath}, génération du fallback...`);
        return await generateEngagementFallback(internshipData);

    } catch (error) {
        logger.error(`[generateEngagementConfidentialite] Erreur: ${error.message}`);
        return await generateEngagementFallback(internshipData);
    }
};

// ============================================
// FALLBACK
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
// GENERER LE PDF DES RESULTATS DE STAGE
// VERSION ALIGNEE SUR LE PDF DE RECRUTEMENT SNRT (design identique, mise en page aeree)
// - Une seule liste "Candidats retenus" (pas de liste d'attente)
// - Tableau simple 3 colonnes (Classement / Nom Candidat / CIN), centre sur la page
// - Logo agrandi
// - Cachet sous le NB, aligne a droite
// - Garanti sur une seule page (pas de saut de page automatique)
// ============================================
exports.generateResultatsStage = async (data) => {
    return new Promise((resolve, reject) => {
        try {
            const { offre, acceptes, dateCloture, nbPostes, typeStage, departementNom, description } = data;

            // Creer le dossier si inexistant
            const dir = path.join(__dirname, '../../uploads/resultats');
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            // Nom du fichier sans accents
            const safeTitle = (offre.titre || 'OFFRE')
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-zA-Z0-9]/g, '_')
                .toUpperCase();
            const fileName = `RESULTATS_STAGE_${safeTitle}.pdf`;
            const filePath = path.join(dir, fileName);

            // Marges genereuses, proches du PDF de recrutement original
            const PAGE_MARGINS = { top: 65, bottom: 45, left: 75, right: 75 };
            const doc = new PDFDocument({
                size: 'A4',
                margins: PAGE_MARGINS,
                bufferPages: true,
                info: {
                    Title: `Resultats - ${offre.titre || 'Stage'}`,
                    Author: 'SNRT - PGS',
                    Subject: 'Resultats de selection de stage'
                }
            });

            const writeStream = fs.createWriteStream(filePath);
            doc.pipe(writeStream);

            const FONT = 'Times-Roman';
            const FONT_BOLD = 'Times-Bold';
            const FONT_ITALIC = 'Times-Italic';

            // ============================================
            // 1. LOGO SNRT - centre
            // ============================================
            const logoPath = path.join(__dirname, '../../uploads/images/SNRT-logo-scanned.jpg');
            let logoExists = fs.existsSync(logoPath);
            if (!logoExists) {
                const fallbackLogoPath = path.join(__dirname, '../../uploads/images/snrt-logo.jpg');
                logoExists = fs.existsSync(fallbackLogoPath);
            }

            const centerX = doc.page.width / 2;

            if (logoExists) {
                try {
                    const logoMaxWidth = 230;
                    const logoMaxHeight = 130;
                    const logoX = centerX - (logoMaxWidth / 2);
                    const logoY = PAGE_MARGINS.top - 20;

                    const finalLogoPath = fs.existsSync(path.join(__dirname, '../../uploads/images/SNRT-logo-scanned.jpg'))
                        ? path.join(__dirname, '../../uploads/images/SNRT-logo-scanned.jpg')
                        : path.join(__dirname, '../../uploads/images/snrt-logo.jpg');

                    doc.image(finalLogoPath, logoX, logoY, {
                        fit: [logoMaxWidth, logoMaxHeight],
                        align: 'center',
                        valign: 'top'
                    });

                    doc.y = logoY + logoMaxHeight + 14;
                    doc.x = PAGE_MARGINS.left;
                } catch (err) {
                    console.warn(`Erreur chargement logo: ${err.message}`);
                    doc.moveDown(1);
                }
            } else {
                doc.moveDown(1);
            }

            // ============================================
            // 2. TITRE PRINCIPAL - AVIS DES RESULTATS DEFINITIFS
            // ============================================
            doc.font(FONT_BOLD)
               .fontSize(18)
               .fillColor('#000000')
               .text('AVIS DES RESULTATS DEFINITIFS', { align: 'center' });

            doc.moveDown(0.4);

            // Ligne de soulignement sous le titre
            const titleY = doc.y;
            doc.moveTo(centerX - 115, titleY + 2)
               .lineTo(centerX + 115, titleY + 2)
               .strokeColor('#000000')
               .lineWidth(1)
               .stroke();

            doc.moveDown(1);

            // ============================================
            // 3. SOUS-TITRE
            // ============================================
            doc.font(FONT_BOLD)
               .fontSize(12)
               .fillColor('#000000')
               .text('Liste des candidats retenus dans le cadre de l\'operation de selection des stagiaires', { align: 'center' });

            doc.moveDown(0.7);

            // ============================================
            // 4. IDENTIFICATION DE L'OFFRE
            // ============================================
            doc.font(FONT_BOLD)
               .fontSize(11)
               .fillColor('#000000')
               .text(`Stage : ${offre.titre || 'Offre sans titre'} / Nombre de postes : ${nbPostes || 0}`, { align: 'center' });

            doc.moveDown(0.3);

            // ✅ SUPPRESSION DE LA LIGNE "Departement : Departement"
            // La ligne ci-dessous est supprimée :
            // if (departementNom) {
            //     doc.font(FONT)
            //        .fontSize(10)
            //        .fillColor('#000000')
            //        .text(`Departement : ${departementNom}`, { align: 'center' });
            // }

            doc.moveDown(1.4);

            // ============================================
            // 5. TABLEAU DES CANDIDATS - 3 colonnes simples, centre sur la page
            //    (Classement / Nom Candidat / CIN)
            // ============================================
            const tableTop = doc.y;
            const pageUsableLeft = PAGE_MARGINS.left;
            const pageUsableRight = doc.page.width - PAGE_MARGINS.right;
            const pageUsableWidth = pageUsableRight - pageUsableLeft;

            // Colonnes : Classement / Nom Candidat / CIN
            const classColWidth = 90;
            const cinColWidth = 120;
            // Le tableau est plus etroit que la page complete et centre horizontalement
            const tableWidth = Math.min(pageUsableWidth, 430);
            const nomColWidth = tableWidth - classColWidth - cinColWidth;

            const tableLeft = centerX - (tableWidth / 2);
            const tableRight = tableLeft + tableWidth;

            const classColX = tableLeft;
            const nomColX = classColX + classColWidth;
            const cinColX = nomColX + nomColWidth;

            const candidates = acceptes || [];

            // Espace reserve en bas de page pour NB + cachet + footer (mise en page aeree)
            const reservedBottomSpace = 205; // NB (~45) + cachet (~110) + footer (~50)
            const maxTableBottom = doc.page.height - PAGE_MARGINS.bottom - reservedBottomSpace;
            const availableHeight = maxTableBottom - tableTop;

            // Hauteur de ligne "confortable" comme dans l'original (35pt), reduite seulement si necessaire
            const PREFERRED_ROW_HEIGHT = 35;
            const MIN_ROW_HEIGHT = 18;

            const rowsNeeded = Math.max(1, candidates.length);
            let rowHeight = PREFERRED_ROW_HEIGHT;
            let maxRows = rowsNeeded;

            // Si la hauteur preferee ne tient pas pour toutes les lignes, on reduit la hauteur de ligne
            if ((rowsNeeded + 1) * PREFERRED_ROW_HEIGHT > availableHeight) {
                rowHeight = Math.floor(availableHeight / (rowsNeeded + 1));
                if (rowHeight < MIN_ROW_HEIGHT) {
                    // Toujours trop de lignes meme au minimum : on limite le nombre de lignes affichees
                    rowHeight = MIN_ROW_HEIGHT;
                    maxRows = Math.max(1, Math.floor(availableHeight / MIN_ROW_HEIGHT) - 1);
                }
            }

            const displayCandidates = candidates.slice(0, maxRows);

            // ----- En-tete du tableau -----
            const headerY = tableTop;

            doc.rect(classColX, headerY, classColWidth + nomColWidth + cinColWidth, rowHeight)
               .fillColor('#dedede')
               .fill();

            doc.rect(classColX, headerY, classColWidth, rowHeight)
               .strokeColor('#000000').lineWidth(0.8).stroke();
            doc.rect(nomColX, headerY, nomColWidth, rowHeight)
               .strokeColor('#000000').lineWidth(0.8).stroke();
            doc.rect(cinColX, headerY, cinColWidth, rowHeight)
               .strokeColor('#000000').lineWidth(0.8).stroke();

            const headerFontSize = rowHeight < 26 ? 9.5 : 11;
            doc.font(FONT_BOLD)
               .fontSize(headerFontSize)
               .fillColor('#000000')
               .text('Classement', classColX, headerY + (rowHeight - headerFontSize) / 2 - 2, { width: classColWidth, align: 'center' });
            doc.text('Nom Candidat', nomColX, headerY + (rowHeight - headerFontSize) / 2 - 2, { width: nomColWidth, align: 'center' });
            doc.text('CIN', cinColX, headerY + (rowHeight - headerFontSize) / 2 - 2, { width: cinColWidth, align: 'center' });

            // ----- Corps du tableau -----
            let currentY = headerY + rowHeight;
            const bodyTop = currentY;
            const dataFontSize = rowHeight < 26 ? 9.5 : 10.5;

            if (displayCandidates.length === 0) {
                doc.rect(classColX, currentY, classColWidth + nomColWidth + cinColWidth, rowHeight)
                   .fillColor('#ffffff').fill()
                   .strokeColor('#000000').lineWidth(0.8).stroke();

                doc.font(FONT)
                   .fontSize(dataFontSize)
                   .fillColor('#000000')
                   .text('Aucun candidat retenu', classColX, currentY + (rowHeight - dataFontSize) / 2 - 2, { width: classColWidth + nomColWidth + cinColWidth, align: 'center' });
                currentY += rowHeight;
            } else {
                displayCandidates.forEach((app, index) => {
                    const studentName = app.etudiantId
                        ? `${app.etudiantId.prenom || ''} ${app.etudiantId.nom || ''}`.trim().toUpperCase()
                        : 'Candidat sans nom';
                    const cin = app.etudiantId?.cin || 'Non renseigne';

                    doc.rect(classColX, currentY, classColWidth + nomColWidth + cinColWidth, rowHeight)
                       .fillColor('#ffffff').fill();

                    doc.rect(classColX, currentY, classColWidth, rowHeight)
                       .strokeColor('#000000').lineWidth(0.8).stroke();
                    doc.rect(nomColX, currentY, nomColWidth, rowHeight)
                       .strokeColor('#000000').lineWidth(0.8).stroke();
                    doc.rect(cinColX, currentY, cinColWidth, rowHeight)
                       .strokeColor('#000000').lineWidth(0.8).stroke();

                    doc.font(FONT)
                       .fontSize(dataFontSize)
                       .fillColor('#000000')
                       .text(`${index + 1}`, classColX, currentY + (rowHeight - dataFontSize) / 2 - 2, { width: classColWidth, align: 'center' });
                    doc.text(studentName, nomColX + 10, currentY + (rowHeight - dataFontSize) / 2 - 2, { width: nomColWidth - 20, align: 'left' });
                    doc.text(cin, cinColX, currentY + (rowHeight - dataFontSize) / 2 - 2, { width: cinColWidth, align: 'center' });

                    currentY += rowHeight;
                });

                if (candidates.length > displayCandidates.length) {
                    doc.font(FONT_ITALIC)
                       .fontSize(8.5)
                       .fillColor('#666666')
                       .text(`... et ${candidates.length - displayCandidates.length} autre(s) candidat(s)`, classColX, currentY + 3, { width: classColWidth + nomColWidth + cinColWidth, align: 'center' });
                    currentY += 14;
                }
            }

            const tableBottom = currentY;

            doc.y = tableBottom;
            doc.x = PAGE_MARGINS.left;
            doc.moveDown(2);

            // ============================================
            // 6. NB - Remarque
            // ============================================
            const nbY = doc.y;
            doc.font(FONT_BOLD)
               .fontSize(10.5)
               .fillColor('#000000')
               .text('NB :', PAGE_MARGINS.left, nbY, { continued: true, width: pageUsableWidth, lineBreak: true });

            doc.font(FONT)
               .fontSize(10.5)
               .fillColor('#000000')
               .text(' Les candidats retenus doivent se presenter aupres du service concerne afin d\'accomplir les formalites administratives necessaires a leur stage.', {
                   align: 'left',
                   lineGap: 2,
                   width: pageUsableWidth
               });

            const nbBottomY = doc.y;

            // ============================================
            // 7. CACHET - sous le NB, aligne a droite
            // ============================================
            const cachetCandidates = [
                path.join(__dirname, '../../uploads/images/Signature-et-cachet-1.png'),
                path.join(__dirname, '../../uploads/images/cachet-snrt-original.png'),
                path.join(__dirname, '../../uploads/images/cachet-snrt.png'),
            ];
            const cachetPath = cachetCandidates.find((p) => fs.existsSync(p));

            const cachetWidth = 130;
            const cachetHeight = 90;
            const cachetX = pageUsableRight - cachetWidth;
            const cachetY = nbBottomY + 20;

            if (cachetPath) {
                try {
                    doc.image(cachetPath, cachetX, cachetY, {
                        width: cachetWidth,
                        height: cachetHeight,
                    });
                    logger.info(`Cachet ajoute au PDF des resultats (${path.basename(cachetPath)})`);
                } catch (err) {
                    logger.warn(`Erreur chargement cachet: ${err.message}`);
                }
            } else {
                logger.warn(`Cachet non trouve parmi: ${cachetCandidates.join(', ')}`);
            }

            // ============================================
            // 8. PIED DE PAGE - position absolue fixe, sans declencher de saut de page
            // ============================================
            doc.page.margins.bottom = 0;

            const footerY = doc.page.height - 38;
            const footerLineInset = 40;

            doc.moveTo(footerLineInset, footerY - 6)
               .lineTo(doc.page.width - footerLineInset, footerY - 6)
               .strokeColor('#888888')
               .lineWidth(0.5)
               .stroke();

            doc.font(FONT)
               .fontSize(7)
               .fillColor('#000000')
               .text(
                   'SNRT SA, Capital social : 1 275 000 000,00 Dirhams - Siege social : 1, Rue El Brihi - Rabat 10.000 - Maroc',
                   PAGE_MARGINS.left, footerY, { width: doc.page.width - (PAGE_MARGINS.left + PAGE_MARGINS.right), align: 'center', lineBreak: false }
               );
            doc.text(
                   'Tel. : +212 (0)5 37 66 91 90 / +212 (0)5 37 68 52 00 - Fax : +212 (0)5 37 72 20 47',
                   PAGE_MARGINS.left, footerY + 9, { width: doc.page.width - (PAGE_MARGINS.left + PAGE_MARGINS.right), align: 'center', lineBreak: false }
               );
            doc.text(
                   'R.C. : 60485 - T.P. : 25197490 - I.F. : 3304097 - I.C.E. : 000211903000067',
                   PAGE_MARGINS.left, footerY + 18, { width: doc.page.width - (PAGE_MARGINS.left + PAGE_MARGINS.right), align: 'center', lineBreak: false }
               );
            doc.text(
                   'Site Web : www.snrt.ma',
                   PAGE_MARGINS.left, footerY + 27, { width: doc.page.width - (PAGE_MARGINS.left + PAGE_MARGINS.right), align: 'center', lineBreak: false }
               );

            doc.page.margins.bottom = PAGE_MARGINS.bottom;

            // Finaliser le PDF
            doc.end();

            writeStream.on('finish', () => {
                console.log(`PDF des resultats genere (1 page): ${filePath}`);
                const relativePath = path.relative(path.join(__dirname, '../../uploads'), filePath);
                const normalizedPath = relativePath.replace(/\\/g, '/');
                resolve(`/uploads/${normalizedPath}`);
            });

            writeStream.on('error', (err) => {
                console.error('Erreur ecriture PDF:', err);
                reject(err);
            });

        } catch (error) {
            console.error('Erreur generateResultatsStage:', error);
            reject(error);
        }
    });
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
    generateResultatsStage: exports.generateResultatsStage,
};