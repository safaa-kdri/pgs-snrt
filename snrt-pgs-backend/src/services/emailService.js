const nodemailer = require('nodemailer');
const { CONFIG } = require('../config/constants');
const logger = require('../utils/logger');

/**
 * NOTE D'EQUIPE : ce fichier releve du perimetre de Mohammed dans
 * l'arborescence du projet. Il est fourni ici deja fonctionnel car
 * controllers/authController.js (Badr) et controllers/interviewController.js
 * (Badr) en dependent directement pour l'envoi des codes 2FA, des liens de
 * reinitialisation et des notifications d'entretien. Mohammed peut
 * librement l'etendre (nouveaux templates, files d'attente, etc.).
 */
const transporter = nodemailer.createTransport({
  host: CONFIG.smtp.host,
  port: CONFIG.smtp.port,
  secure: CONFIG.smtp.secure,
  auth: CONFIG.smtp.user ? { user: CONFIG.smtp.user, pass: CONFIG.smtp.password } : undefined,
});

async function sendMail({ to, subject, html, text }) {
  try {
    await transporter.sendMail({ from: CONFIG.smtp.from, to, subject, text, html });
  } catch (err) {
    logger.error(`[Email] Echec d'envoi vers ${to}: ${err.message}`);
    throw err;
  }
}

function baseTemplate(title, bodyHtml) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; color: #1f2933;">
      <h2 style="color: #0b3d91;">${title}</h2>
      ${bodyHtml}
      <hr style="margin-top: 24px; border: none; border-top: 1px solid #e5e7eb;" />
      <p style="font-size: 12px; color: #6b7280;">
        Societe Nationale de Radiodiffusion et de Television - Plateforme de Gestion des Stages.
        Ceci est un message automatique, merci de ne pas y repondre.
      </p>
    </div>
  `;
}

async function sendTwoFactorCodeEmail(to, code) {
  const html = baseTemplate(
    'Code de verification',
    `<p>Votre code de connexion a la Plateforme de Gestion des Stages est :</p>
     <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${code}</p>
     <p>Ce code est valable ${CONFIG.twoFactor.ttlMinutes} minutes. Si vous n'etes pas a l'origine de cette demande, ignorez cet email.</p>`
  );
  await sendMail({ to, subject: 'Votre code de verification PGS', html, text: `Votre code de verification est : ${code}` });
}

async function sendPasswordResetEmail(to, resetUrl) {
  const html = baseTemplate(
    'Reinitialisation de votre mot de passe',
    `<p>Vous avez demande la reinitialisation de votre mot de passe.</p>
     <p><a href="${resetUrl}" style="background:#0b3d91;color:#fff;padding:10px 18px;border-radius:4px;text-decoration:none;">Reinitialiser mon mot de passe</a></p>
     <p>Ce lien expire dans ${CONFIG.resetPassword.ttlMinutes} minutes. Si vous n'etes pas a l'origine de cette demande, ignorez cet email.</p>`
  );
  await sendMail({
    to,
    subject: 'Reinitialisation de votre mot de passe - PGS',
    html,
    text: `Reinitialisez votre mot de passe via ce lien (valable ${CONFIG.resetPassword.ttlMinutes} min) : ${resetUrl}`,
  });
}

async function sendWelcomeEmail(to, prenom) {
  const html = baseTemplate(
    'Bienvenue sur la Plateforme de Gestion des Stages',
    `<p>Bonjour ${prenom},</p>
     <p>Votre compte candidat a bien ete cree. Vous pouvez desormais consulter les offres de stage et postuler en ligne.</p>`
  );
  await sendMail({ to, subject: 'Bienvenue sur la Plateforme de Gestion des Stages', html, text: `Bonjour ${prenom}, votre compte a bien ete cree.` });
}

async function sendInterviewScheduledEmail(to, { date, heure, type, lieu, lienVisio }) {
  const lieuLigne = type === 'Visio' ? `Lien : ${lienVisio}` : `Lieu : ${lieu || 'a confirmer'}`;
  const html = baseTemplate(
    'Entretien planifie',
    `<p>Un entretien a ete planifie dans le cadre de votre candidature :</p>
     <p><strong>Date :</strong> ${new Date(date).toLocaleDateString('fr-FR')} a ${heure}<br/>
     <strong>Type :</strong> ${type}<br/>${lieuLigne}</p>`
  );
  await sendMail({
    to,
    subject: 'Entretien planifie - PGS',
    html,
    text: `Un entretien a ete planifie le ${new Date(date).toLocaleDateString('fr-FR')} a ${heure} (${type}).`,
  });
}

module.exports = {
  sendTwoFactorCodeEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendInterviewScheduledEmail,
};
