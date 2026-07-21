// src/services/emailService.js
const nodemailer = require('nodemailer');

const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
};

const isEmailConfigured = () => {
    return Boolean(
        process.env.SMTP_HOST &&
        process.env.SMTP_USER &&
        process.env.SMTP_PASS &&
        process.env.EMAIL_FROM
    );
};

exports.sendEmail = async ({ to, subject, html, text }) => {
    if (!isEmailConfigured()) {
        return {
            skipped: true,
            message: 'Configuration SMTP absente'
        };
    }

    const transporter = createTransporter();

    const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html,
        text
    });

    return {
        skipped: false,
        messageId: info.messageId
    };
};

exports.sendApplicationSubmittedEmail = async ({ to, studentName, offerTitle }) => {
    return exports.sendEmail({
        to,
        subject: 'Candidature soumise avec succès',
        text: `Bonjour ${studentName}, votre candidature pour l’offre ${offerTitle} a été soumise avec succès.`,
        html: `
            <p>Bonjour ${studentName},</p>
            <p>Votre candidature pour l’offre <strong>${offerTitle}</strong> a été soumise avec succès.</p>
            <p>Vous pouvez suivre son avancement depuis votre espace candidat.</p>
        `
    });
};

exports.sendApplicationStatusChangedEmail = async ({ to, studentName, offerTitle, status }) => {
    return exports.sendEmail({
        to,
        subject: 'Mise à jour de votre candidature',
        text: `Bonjour ${studentName}, le statut de votre candidature pour ${offerTitle} est maintenant : ${status}.`,
        html: `
            <p>Bonjour ${studentName},</p>
            <p>Le statut de votre candidature pour <strong>${offerTitle}</strong> est maintenant : <strong>${status}</strong>.</p>
        `
    });
};

exports.sendInterviewScheduledEmail = async ({ to, studentName, date, heure, lieu, lienVisio }) => {
    return exports.sendEmail({
        to,
        subject: 'Entretien de stage planifié',
        text: `Bonjour ${studentName}, votre entretien est planifié le ${date} à ${heure}.`,
        html: `
            <p>Bonjour ${studentName},</p>
            <p>Votre entretien de stage est planifié le <strong>${date}</strong> à <strong>${heure}</strong>.</p>
            ${lieu ? `<p>Lieu : ${lieu}</p>` : ''}
            ${lienVisio ? `<p>Lien visio : <a href="${lienVisio}">${lienVisio}</a></p>` : ''}
        `
    });
};

exports.sendDocumentRejectedEmail = async ({ to, studentName, documentName, reason }) => {
    return exports.sendEmail({
        to,
        subject: 'Document refusé',
        text: `Bonjour ${studentName}, votre document ${documentName} a été refusé. Motif : ${reason || 'Non précisé'}.`,
        html: `
            <p>Bonjour ${studentName},</p>
            <p>Votre document <strong>${documentName}</strong> a été refusé.</p>
            <p>Motif : ${reason || 'Non précisé'}</p>
        `
    });
};