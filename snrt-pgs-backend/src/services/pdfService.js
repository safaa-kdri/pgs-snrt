// src/services/pdfService.js
// Installation: npm install pdfkit
// ✅ CORRECTION : Utiliser le fichier PDF existant dans uploads/engagements/
// ✅ AJOUT : Génération de la demande de stage avec logo SNRT - Style professionnel
// ✅ MODIFICATION : generateDemandeStage - Derniers ajustements pour correspondre exactement à l'original SNRT

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
// ✅ GÉNÉRER LA DEMANDE DE STAGE POUR LE DIRECTEUR
// ✅ Version finale ajustée pour correspondre exactement à l'original SNRT
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
            // POLICES - Times New Roman
            // ============================================
            const FONT = 'Times-Roman';
            const FONT_BOLD = 'Times-Bold';
            const FONT_ITALIC = 'Times-Italic';
            const FONT_SIZE = 14;
            const FONT_SIZE_FOOTER = 7.5;

            // ============================================
            // 1. LOGO
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

            // ============================================
            // 2. LETTRE "A"
            // ============================================
            doc.font(FONT_BOLD)
               .fontSize(18)
               .text('A', { align: 'center' })
               .moveDown(0.8);

            // ============================================
            // 3. DESTINATAIRE
            // ============================================
            doc.font(FONT_BOLD)
               .fontSize(13.5)
               .text('Monsieur le Directeur Adjoint Chargé des Infrastructures et des Systèmes', { align: 'center', lineGap: 1 })
               .text("d'Information", { align: 'center', lineGap: 1 })
               .moveDown(2.5);

            // ============================================
            // 4. OBJET
            // ============================================
            doc.x = MARGINS.left;

            doc.font(FONT_BOLD)
               .fontSize(FONT_SIZE)
               .text('Objet : ', { continued: true, lineGap: 4 });

            doc.font(FONT)
               .text(`Demande de stage concernant : ${etudiantNom || 'Nom Prénom'}`)
               .moveDown(1.8);

            // ============================================
            // 5. PARAGRAPHE - Espacement augmenté (lineGap: 14)
            // ============================================
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

            // ✅ lineGap augmenté à 14 pour plus d'espace entre les lignes
            doc.font(FONT)
               .fontSize(13.8)
               .text(
                   `Faisant suite à votre accord de stage concernant ${studentName} pour la période du ${dateDebutFormatted} au ${dateFinFormatted} au sein de votre direction ; j'ai l'honneur de vous demander de bien vouloir renseigner la fiche de stage ci-jointe, afin de confirmer la période du stage et de la retourner à la Direction des Ressources Humaines.`,
                   {
                       align: 'justify',
                       lineGap: 14 // ✅ Augmenté de 10 à 14 pour plus d'espace
                   }
               );

            // ============================================
            // BLOC BAS DE PAGE - Cachet descendu pour alignement avec la date
            // ============================================
            const pageBottom = doc.page.height;

            // Pied de page
            const footerY = pageBottom - MARGINS.bottom - 45;

            // NB
            const nbY = footerY - 70;

            // ✅ CACHET - Descendu davantage pour alignement avec la date
            const cachetWidth = 172;
            const cachetHeight = 115;
            const cachetGapToNB = 45;
            
            const cachetPath = path.join(__dirname, '../../uploads/images/cachet-snrt-original.png');
            const cachetExists = fs.existsSync(cachetPath);
            const finalCachetPath = cachetExists 
                ? cachetPath 
                : path.join(__dirname, '../../uploads/images/Signature-et-cachet-1.png');
            
            const cachetX = MARGINS.left + 37;
            // ✅ Descendu davantage pour alignement avec la date (augmenté la valeur de descente)
            const cachetY = nbY - cachetGapToNB - cachetHeight - 30; // Descendu (était -45)

            // DATE - alignée avec le cachet
            const dateWidth = 200;
            const dateX = doc.page.width - MARGINS.right - 200 + 15;
            const dateY = cachetY + (cachetHeight / 2) + 28; // Ajusté pour alignement

            // ============================================
            // CACHET + SIGNATURE DRH
            // ============================================
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

            // ============================================
            // DATE - Alignée à droite
            // ============================================
            doc.font(FONT)
               .fontSize(13)
               .text(`Fait à Rabat le : ${dateFormatted}`, dateX, dateY, {
                   width: dateWidth,
                   align: 'right'
               });

            // ============================================
            // NB
            // ============================================
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

            // ============================================
            // LIGNE HORIZONTALE
            // ============================================
            const footerLineInset = 40;
            doc.moveTo(footerLineInset, footerY)
               .lineTo(doc.page.width - footerLineInset, footerY)
               .strokeColor('#888888')
               .lineWidth(0.5)
               .stroke();

            // ============================================
            // PIED DE PAGE
            // ============================================
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