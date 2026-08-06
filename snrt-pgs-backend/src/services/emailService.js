// src/services/emailService.js
const nodemailer = require('nodemailer');
const { CONFIG } = require('../config/constants');
const logger = require('../utils/logger');

let transporterPromise = null;

function buildTransporter() {
  if (CONFIG.smtp.host) {
    return Promise.resolve(
      nodemailer.createTransport({
        host: CONFIG.smtp.host,
        port: CONFIG.smtp.port,
        secure: CONFIG.smtp.secure,
        auth: CONFIG.smtp.user ? { user: CONFIG.smtp.user, pass: CONFIG.smtp.password } : undefined,
      })
    );
  }

  logger.warn(
    "[Email] Aucun SMTP_HOST defini : utilisation d'un compte de test Ethereal (dev uniquement, aucun email reellement envoye)."
  );

  return nodemailer.createTestAccount().then((testAccount) =>
    nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    })
  );
}

function getTransporter() {
  if (!transporterPromise) {
    transporterPromise = buildTransporter().catch((err) => {
      logger.error(`[Email] Echec de creation du transporteur SMTP: ${err.message}`);
      transporterPromise = null;
      throw err;
    });
  }
  return transporterPromise;
}

async function sendMail({ to, subject, html, text, attachments }) {
  try {
    const transporter = await getTransporter();
    const info = await transporter.sendMail({
      from: CONFIG.smtp.from,
      to,
      subject,
      text,
      html,
      attachments: attachments || []
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      logger.info(`[Email] (Ethereal) Previsualisation de l'email envoye a ${to} : ${previewUrl}`);
    }
    return info;
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

// ============================================
// AUTHENTIFICATION
// ============================================

async function sendTwoFactorCodeEmail(to, code) {
  const html = baseTemplate(
    'Code de verification',
    `<p>Votre code de connexion a la Plateforme de Gestion des Stages est :</p>
     <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${code}</p>
     <p>Ce code est valable ${CONFIG.twoFactor.ttlMinutes} minutes. Si vous n'etes pas a l'origine de cette demande, ignorez cet email.</p>`
  );
  await sendMail({
    to,
    subject: 'Votre code de verification PGS',
    html,
    text: `Votre code de verification est : ${code}`
  });
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
  await sendMail({
    to,
    subject: 'Bienvenue sur la Plateforme de Gestion des Stages',
    html,
    text: `Bonjour ${prenom}, votre compte a bien ete cree.`
  });
}

// ============================================
// CANDIDATURES
// ============================================

async function sendApplicationSubmittedEmail({ to, studentName, offerTitle }) {
  const html = baseTemplate(
    'Candidature soumise avec succès',
    `<p>Bonjour ${studentName},</p>
     <p>Votre candidature pour l'offre <strong>${offerTitle}</strong> a été soumise avec succès.</p>
     <p>Vous pouvez suivre son avancement depuis votre espace candidat.</p>`
  );
  await sendMail({
    to,
    subject: 'Candidature soumise avec succès',
    html,
    text: `Bonjour ${studentName}, votre candidature pour l'offre ${offerTitle} a été soumise avec succès.`,
  });
}

async function sendApplicationStatusChangedEmail({ to, studentName, offerTitle, status }) {
  const html = baseTemplate(
    'Mise à jour de votre candidature',
    `<p>Bonjour ${studentName},</p>
     <p>Le statut de votre candidature pour <strong>${offerTitle}</strong> est maintenant : <strong>${status}</strong>.</p>`
  );
  await sendMail({
    to,
    subject: 'Mise à jour de votre candidature',
    html,
    text: `Bonjour ${studentName}, le statut de votre candidature pour ${offerTitle} est maintenant : ${status}.`,
  });
}

async function sendDocumentRejectedEmail({ to, studentName, documentName, reason }) {
  const html = baseTemplate(
    'Document refusé',
    `<p>Bonjour ${studentName},</p>
     <p>Votre document <strong>${documentName}</strong> a été refusé.</p>
     <p>Motif : ${reason || 'Non précisé'}</p>`
  );
  await sendMail({
    to,
    subject: 'Document refusé',
    html,
    text: `Bonjour ${studentName}, votre document ${documentName} a été refusé. Motif : ${reason || 'Non précisé'}.`,
  });
}

// ============================================
// ENTRETIENS
// ============================================

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

// ============================================
// ✅ DOCUMENTS DE STAGE - NOUVELLES FONCTIONS
// ============================================

// ============================================
// ENVOI DE L'ENGAGEMENT DE CONFIDENTIALITÉ
// ============================================
async function sendEngagementConfidentialiteEmail({ to, studentName, pdfPath }) {
    const html = baseTemplate(
        'Engagement de Confidentialité - SNRT',
        `<p>Bonjour ${studentName},</p>
         <p>Suite à l'acceptation de votre candidature, veuillez trouver ci-joint le document <strong>PSRH-PR01-EN10-A - Engagement de Confidentialité</strong>.</p>
         <p>Veuillez imprimer ce document, le signer, puis le déposer sur la plateforme dans la section prévue à cet effet.</p>
         <p>Ce document est obligatoire pour la poursuite de votre processus d'intégration.</p>
         <p>Cordialement,</p>
         <p>Direction des Ressources Humaines</p>`
    );

    await sendMail({
        to,
        subject: 'Engagement de Confidentialité - SNRT',
        html,
        text: `Bonjour ${studentName}, veuillez trouver ci-joint votre engagement de confidentialité.`,
        attachments: [
            {
                filename: 'Engagement_Confidentialite_SNRT.pdf',
                path: pdfPath,
            }
        ]
    });
}

// ============================================
// ENVOI DE LA DEMANDE AU DIRECTEUR
// ============================================
async function sendDemandeDirecteurEmail({ to, directeurNom, studentName, startDate, endDate, pdfPath }) {
    const html = baseTemplate(
        'Demande de Stage - Validation Directeur',
        `<p>Bonjour Monsieur ${directeurNom},</p>
         <p>Je vous prie de trouver ci-joint la fiche de demande de stage concernant <strong>${studentName}</strong>.</p>
         <p><strong>Période du stage :</strong> du ${startDate} au ${endDate}</p>
         <p>Je vous remercie de bien vouloir apposer votre signature et le cachet de la direction, puis de nous retourner ce document.</p>
         <p>Cordialement,</p>
         <p>Direction des Ressources Humaines</p>`
    );

    await sendMail({
        to,
        subject: 'Demande de Stage - Validation Directeur',
        html,
        text: `Bonjour Monsieur ${directeurNom}, veuillez trouver ci-joint la fiche de demande de stage pour ${studentName}.`,
        attachments: [
            {
                filename: `Demande_Stage_${studentName}.pdf`,
                path: pdfPath,
            }
        ]
    });
}

// ============================================
// ENVOI DE LA FICHE SIGNÉE À L'ÉTUDIANT
// ============================================
async function sendFicheSigneeEtudiant({ to, studentName, pdfPath }) {
    const html = baseTemplate(
        'Validation de votre stage - SNRT',
        `<p>Bonjour ${studentName},</p>
         <p>Nous avons le plaisir de vous informer que votre demande de stage a été <strong>validée</strong> par la Direction.</p>
         <p>Vous trouverez ci-joint votre fiche de stage signée et cachetée.</p>
         <p><strong>Prochaines étapes :</strong></p>
         <ul>
            <li>Conservez cette fiche avec votre rapport de stage</li>
            <li>Présentez les deux documents à la Direction des Ressources Humaines pour obtenir votre attestation de stage</li>
         </ul>
         <p>Félicitations pour votre acceptation !</p>
         <p>Cordialement,</p>
         <p>Direction des Ressources Humaines</p>`
    );

    await sendMail({
        to,
        subject: 'Validation de votre stage - SNRT',
        html,
        text: `Bonjour ${studentName}, votre stage a été validé. Trouvez ci-joint votre fiche signée.`,
        attachments: [
            {
                filename: `Fiche_Stage_Validee_${studentName}.pdf`,
                path: pdfPath,
            }
        ]
    });
}

// ============================================
// ENVOI DE L'ATTESTATION DE STAGE
// ============================================
async function sendAttestationStage({ to, studentName, pdfPath }) {
    const html = baseTemplate(
        'Attestation de Stage - SNRT',
        `<p>Bonjour ${studentName},</p>
         <p>Suite à la validation de votre rapport de stage, nous avons le plaisir de vous délivrer votre <strong>attestation de stage</strong>.</p>
         <p>Ce document officiel atteste de votre passage au sein de la SNRT et de votre contribution.</p>
         <p>Nous vous souhaitons une excellente continuation dans vos projets futurs.</p>
         <p>Cordialement,</p>
         <p>Direction des Ressources Humaines</p>`
    );

    await sendMail({
        to,
        subject: 'Attestation de Stage - SNRT',
        html,
        text: `Bonjour ${studentName}, veuillez trouver ci-joint votre attestation de stage.`,
        attachments: [
            {
                filename: `Attestation_Stage_${studentName}.pdf`,
                path: pdfPath,
            }
        ]
    });
}

// ============================================
// EXPORTS
// ============================================
module.exports = {
  // Authentification
  sendTwoFactorCodeEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,

  // Candidatures
  sendApplicationSubmittedEmail,
  sendApplicationStatusChangedEmail,
  sendDocumentRejectedEmail,

  // Entretiens
  sendInterviewScheduledEmail,

  // ✅ Documents de stage
  sendEngagementConfidentialiteEmail,
  sendDemandeDirecteurEmail,
  sendFicheSigneeEtudiant,
  sendAttestationStage,
};