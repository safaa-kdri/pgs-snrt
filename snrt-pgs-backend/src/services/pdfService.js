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