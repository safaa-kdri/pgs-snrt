// src/services/pdfService.js
// Installation: npm install pdfkit
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

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
            margin: 50
        });

        const filePath = path.join(
            __dirname,
            '../../uploads/attestations',
            `attestation_${internship._id}.pdf`
        );

        // S'assurer que le dossier existe
        ensureDirectoryExists(path.dirname(filePath));

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // ============ EN-TÊTE ============
        doc.fontSize(20)
            .font('Helvetica-Bold')
            .text('ATTESTATION DE STAGE', { align: 'center' });

        doc.moveDown(2);

        // ============ CONTENU ============
        doc.fontSize(12)
            .font('Helvetica')
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

        // ============ SIGNATURE ============
        doc.fontSize(10)
            .text(`Fait à Rabat, le ${new Date().toLocaleDateString('fr-FR')}`, { align: 'center' });

        doc.moveDown(2);

        doc.text('Signature du responsable RH', { align: 'center' });

        // ============ PIED DE PAGE ============
        doc.moveDown(3);
        doc.fontSize(8)
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
            margin: 50
        });

        const filePath = path.join(
            __dirname,
            '../../uploads/conventions',
            `convention_${internship._id}.pdf`
        );

        ensureDirectoryExists(path.dirname(filePath));

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // ============ TITRE ============
        doc.fontSize(20)
            .font('Helvetica-Bold')
            .text('CONVENTION DE STAGE', { align: 'center' });

        doc.moveDown(2);

        // ============ ENTREPRISE ============
        doc.fontSize(14)
            .font('Helvetica-Bold')
            .text('ENTRE :');

        doc.moveDown(0.5);

        doc.fontSize(12)
            .font('Helvetica')
            .text('La Société Nationale de Radiodiffusion et de Télévision (SNRT)');
        doc.text('1 Rue El Brihi Avenue Moulay Abdelaziz - Hassan - Rabat');
        doc.text('Représentée par Monsieur/Madame le Directeur des Ressources Humaines');

        doc.moveDown();

        // ============ STAGIAIRE ============
        doc.fontSize(14)
            .font('Helvetica-Bold')
            .text('ET :');

        doc.moveDown(0.5);

        const etudiant = internship.etudiantId || {};
        doc.fontSize(12)
            .font('Helvetica')
            .text(`Monsieur/Madame ${etudiant.prenom || ''} ${etudiant.nom || ''}`);
        if (etudiant.dateNaissance) {
            doc.text(`Né(e) le ${new Date(etudiant.dateNaissance).toLocaleDateString('fr-FR')}`);
        }
        doc.text(`Adresse: ${etudiant.adresse || 'Non spécifiée'}`);
        doc.text(`Étudiant(e) à ${etudiant.universite || 'Non spécifiée'}`);

        doc.moveDown();

        // ============ OBJET ============
        doc.fontSize(14)
            .font('Helvetica-Bold')
            .text('IL A ÉTÉ CONVENU CE QUI SUIT :');

        doc.moveDown();

        doc.fontSize(12)
            .font('Helvetica-Bold')
            .text('Article 1 - Objet du stage');

        doc.fontSize(12)
            .font('Helvetica')
            .text('Le stage a pour objet de permettre à l\'étudiant de mettre en pratique ses connaissances théoriques.');

        doc.moveDown();

        doc.fontSize(12)
            .font('Helvetica-Bold')
            .text('Article 2 - Durée du stage');

        doc.fontSize(12)
            .font('Helvetica')
            .text(`Le stage se déroule du ${new Date(internship.dateDebut).toLocaleDateString('fr-FR')}`);
        doc.text(`au ${new Date(internship.dateFin).toLocaleDateString('fr-FR')}`);

        doc.moveDown();

        doc.fontSize(12)
            .font('Helvetica-Bold')
            .text('Article 3 - Missions');

        doc.fontSize(12)
            .font('Helvetica')
            .text(`Les missions confiées au stagiaire sont définies dans le sujet de stage: ${internship.offreId?.titre || 'Non spécifié'}`);

        doc.moveDown();

        doc.fontSize(12)
            .font('Helvetica-Bold')
            .text('Article 4 - Encadrement');

        const encadrant = internship.encadrantId || {};
        doc.fontSize(12)
            .font('Helvetica')
            .text(`Le stagiaire sera encadré par ${encadrant.prenom || ''} ${encadrant.nom || ''}.`);

        doc.moveDown(2);

        // ============ SIGNATURES ============
        doc.fontSize(10)
            .text(`Fait à Rabat, le ${new Date().toLocaleDateString('fr-FR')}`, { align: 'center' });

        doc.moveDown(2);

        // 3 colonnes pour les signatures
        const pageWidth = doc.page.width - 100;
        const colWidth = pageWidth / 3;

        doc.fontSize(10)
            .text('Signature du stagiaire', colWidth * 0, doc.y, { width: colWidth, align: 'center' })
            .text('Signature de l\'encadrant', colWidth * 1, doc.y, { width: colWidth, align: 'center' })
            .text('Signature du RH', colWidth * 2, doc.y, { width: colWidth, align: 'center' });

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
            margin: 50
        });

        const filePath = path.join(
            __dirname,
            '../../uploads/rapports',
            `rapport_template_${internship._id}.pdf`
        );

        ensureDirectoryExists(path.dirname(filePath));

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // ============ PAGE DE GARDE ============
        doc.fontSize(24)
            .font('Helvetica-Bold')
            .text('RAPPORT DE STAGE', { align: 'center' });

        doc.moveDown(3);

        doc.fontSize(18)
            .font('Helvetica-Bold')
            .text(internship.offreId?.titre || 'Stage', { align: 'center' });

        doc.moveDown(2);

        const etudiant = internship.etudiantId || {};
        doc.fontSize(14)
            .font('Helvetica')
            .text(`Présenté par: ${etudiant.prenom || ''} ${etudiant.nom || ''}`, { align: 'center' });

        doc.moveDown();

        doc.text(`Encadré par: ${internship.encadrantId?.prenom || ''} ${internship.encadrantId?.nom || ''}`, { align: 'center' });

        doc.moveDown(3);

        doc.text(`SNRT - ${new Date().toLocaleDateString('fr-FR')}`, { align: 'center' });

        // ============ SOMMAIRE ============
        doc.addPage();

        doc.fontSize(18)
            .font('Helvetica-Bold')
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
                .font('Helvetica')
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
// GÉNÉRER LA FICHE DE DEMANDE DE STAGE (RH → DIRECTEUR)
// ============================================
exports.generateDemandeStage = async (internshipData) => {
    try {
        const doc = new PDFDocument({
            size: 'A4',
            margin: 50
        });

        const filePath = path.join(
            __dirname,
            '../../uploads/demandes_stage',
            `demande_stage_${internshipData._id}.pdf`
        );

        ensureDirectoryExists(path.dirname(filePath));

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Logo SNRT
        const logoPath = path.join(__dirname, '../../public/logo_snrt_final.png');
        if (fs.existsSync(logoPath)) {
            doc.image(logoPath, 50, 30, { width: 80 });
        }

        doc.moveDown(2);

        doc.fontSize(12)
            .font('Helvetica-Bold')
            .text('Société Nationale de Radiodiffusion et de Télévision', { align: 'center' });

        doc.moveDown(3);

        doc.fontSize(12)
            .font('Helvetica')
            .text('A', { align: 'left' });

        doc.moveDown(0.5);

        doc.fontSize(12)
            .font('Helvetica-Bold')
            .text(`Monsieur le Directeur Adjoint Chargé des Infrastructures et des Systèmes d'Information`);

        doc.moveDown(2);

        doc.fontSize(12)
            .font('Helvetica-Bold')
            .text(`Objet : Demande de stage concernant : "${internshipData.etudiantNom || 'Nom Prénom'}"`);

        doc.moveDown(2);

        const dateDebut = new Date(internshipData.dateDebut).toLocaleDateString('fr-FR');
        const dateFin = new Date(internshipData.dateFin).toLocaleDateString('fr-FR');
        const today = new Date().toLocaleDateString('fr-FR');

        doc.fontSize(12)
            .font('Helvetica')
            .text(`Faisant suite à votre accord de stage concernant "${internshipData.etudiantNom || 'Nom Prénom'}" pour la période du ${dateDebut} au ${dateFin} au sein de votre direction ; j’ai l’honneur de vous demander de bien vouloir renseigner la fiche de stage ci-jointe, afin de confirmer la période du stage et de la retourner à la Direction des Ressources Humaines.`);

        doc.moveDown(2);

        doc.text(`Fait à Rabat le : ${today}`);

        doc.moveDown(2);

        doc.fontSize(10)
            .font('Helvetica-Oblique')
            .text('NB : Le stagiaire doit présenter à la Direction des Ressources Humaines la présente lettre pour toute demande d’attestation de stage.');

        doc.moveDown(2);

        doc.fontSize(8)
            .font('Helvetica')
            .text('SNRT SA, Capital social : 1 275 000 000,00 Dirhams – Siège social : 1, Rue El Brihi - Rabat 10.000 - Maroc', { align: 'center' })
            .text('Tél. : +212 (0)5 37 66 91 90 / +212 (0)5 37 68 52 00 – Fax : +212 (0)5 37 72 20 47', { align: 'center' })
            .text('R.C. : 60485 – T.P. : 25197490 – I.F. : 3304097 – I.C.E. : 000211903000067', { align: 'center' })
            .text('Site Web : www.snrt.ma', { align: 'center' });

        doc.end();

        return new Promise((resolve, reject) => {
            stream.on('finish', () => {
                logger.info(`Demande de stage générée: ${filePath}`);
                resolve(filePath);
            });
            stream.on('error', (error) => {
                logger.error(`Erreur generation demande stage: ${error.message}`);
                reject(error);
            });
        });
    } catch (error) {
        logger.error(`Erreur generateDemandeStage: ${error.message}`);
        throw error;
    }
};

// ============================================
// GÉNÉRER LE PDF D'ENGAGEMENT DE CONFIDENTIALITÉ (PSRH-PR01-EN10-A)
// ============================================
exports.generateEngagementConfidentialite = async (internshipData) => {
    try {
        const doc = new PDFDocument({
            size: 'A4',
            margin: 50
        });

        const filePath = path.join(
            __dirname,
            '../../uploads/engagements',
            `engagement_confidentialite_${internshipData._id}.pdf`
        );

        ensureDirectoryExists(path.dirname(filePath));

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        const logoPath = path.join(__dirname, '../../public/logo_snrt_final.png');
        if (fs.existsSync(logoPath)) {
            doc.image(logoPath, 50, 30, { width: 80 });
        }

        doc.moveDown(2);

        doc.fontSize(16)
            .font('Helvetica-Bold')
            .text('PSRH-PR01-EN10-A', { align: 'center' });

        doc.moveDown(0.5);

        doc.fontSize(14)
            .font('Helvetica-Bold')
            .text('ENGAGEMENT DE CONFIDENTIALITÉ', { align: 'center' });
        doc.text('RÉSERVÉ AUX STAGIAIRES', { align: 'center' });

        doc.moveDown(3);

        const etudiant = internshipData.etudiantId || {};
        
        doc.fontSize(12)
            .font('Helvetica')
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
                logger.info(`Engagement confidentialité généré: ${filePath}`);
                resolve(filePath);
            });
            stream.on('error', (error) => {
                logger.error(`Erreur generation engagement: ${error.message}`);
                reject(error);
            });
        });
    } catch (error) {
        logger.error(`Erreur generateEngagementConfidentialite: ${error.message}`);
        throw error;
    }
};