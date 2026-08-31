// src/services/emailService.js
const nodemailer = require('nodemailer');
const fs = require('fs');
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
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; color: #1f2933; line-height: 1.6;">
      <div style="padding: 20px 24px; border-bottom: 3px solid #0b3d91;">
        <h1 style="color: #0b3d91; margin: 0; font-size: 20px; font-weight: 600;">${title}</h1>
      </div>
      <div style="padding: 24px; background: #ffffff;">
        ${bodyHtml}
      </div>
      <div style="margin-top: 16px; text-align: center; font-size: 12px; color: #6b7280; padding: 16px 0; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0;">
          Société Nationale de Radiodiffusion et de Télévision - Plateforme de Gestion des Stages.<br>
          Ceci est un message automatique, merci de ne pas y répondre.
        </p>
      </div>
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
     <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px; background: #f3f4f6; padding: 12px; text-align: center; border-radius: 4px;">${code}</p>
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
     <p style="text-align: center; margin: 24px 0;">
       <a href="${resetUrl}" style="background: #0b3d91; color: #ffffff; padding: 12px 32px; border-radius: 4px; text-decoration: none; font-weight: 600;">Reinitialiser mon mot de passe</a>
     </p>
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
     <p>Votre compte candidat a bien ete cree. Vous pouvez desormais consulter les offres de stage et postuler en ligne.</p>
     <p>Nous vous souhaitons une excellente experience sur notre plateforme.</p>`
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
     <p>Votre candidature pour l'offre <strong>${offerTitle}</strong> a ete soumise avec succes.</p>
     <p>Vous pouvez suivre son avancement depuis votre espace candidat.</p>`
  );
  await sendMail({
    to,
    subject: 'Candidature soumise avec succès',
    html,
    text: `Bonjour ${studentName}, votre candidature pour l'offre ${offerTitle} a ete soumise avec succes.`,
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
    'Document refuse',
    `<p>Bonjour ${studentName},</p>
     <p>Votre document <strong>${documentName}</strong> a ete refuse.</p>
     <p>Motif : ${reason || 'Non precise'}</p>`
  );
  await sendMail({
    to,
    subject: 'Document refuse',
    html,
    text: `Bonjour ${studentName}, votre document ${documentName} a ete refuse. Motif : ${reason || 'Non precise'}.`,
  });
}

// ============================================
// ENTRETIENS - CONVOCATION
// ============================================

async function sendInterviewScheduledEmail({ 
  to, 
  studentName, 
  date, 
  heure, 
  type, 
  lieu, 
  lienVisio, 
  duree,
  commentaires 
}) {
  const dateFormatted = new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const lieuLigne = type === 'Visio' 
    ? `<strong>Lien de visioconference :</strong> <a href="${lienVisio}">${lienVisio}</a>` 
    : `<strong>Lieu :</strong> ${lieu || 'A confirmer'}`;

  const html = baseTemplate(
    'Convocation a un entretien',
    `
    <p>Bonjour <strong>${studentName}</strong>,</p>
    <p>Nous avons le plaisir de vous convier a un entretien dans le cadre de votre candidature.</p>
    
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600; width: 40%;">Date</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">${dateFormatted}</td>
      </tr>
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Heure</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">${heure} (${duree} minutes)</td>
      </tr>
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Type</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">${type}</td>
      </tr>
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">${type === 'Visio' ? 'Lien' : 'Lieu'}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">${type === 'Visio' ? `<a href="${lienVisio}">${lienVisio}</a>` : (lieu || 'A confirmer')}</td>
      </tr>
      ${commentaires ? `
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Commentaires</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">${commentaires}</td>
      </tr>` : ''}
    </table>
    
    <div style="background: #fef3c7; padding: 16px; border-radius: 4px; margin: 16px 0;">
      <p style="margin: 0; font-size: 14px; color: #92400e;">
        <strong>Informations importantes :</strong><br>
        • Merci de confirmer votre disponibilite dans les plus brefs delais<br>
        • Prevoyez une piece d'identite pour votre passage<br>
        • En cas d'empechement, contactez-nous 48h a l'avance
      </p>
    </div>
    
    <p>Nous vous souhaitons une bonne preparation et restons a votre disposition.</p>
    <p>Cordialement,</p>
    <p><strong>Direction des Ressources Humaines</strong><br>
    Societe Nationale de Radiodiffusion et de Television</p>
    `
  );

  await sendMail({
    to,
    subject: 'Convocation a un entretien - SNRT',
    html,
    text: `Bonjour ${studentName}, vous etes convoque a un entretien le ${dateFormatted} a ${heure}.`
  });
}

// ============================================
// ENTRETIENS - MODIFICATION
// ============================================

async function sendInterviewUpdatedEmail({ to, studentName, date, heure, type, lieu, lienVisio }) {
  const dateFormatted = new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const lieuLigne = type === 'Visio' 
    ? `<strong>Lien de visioconference :</strong> <a href="${lienVisio}">${lienVisio}</a>` 
    : `<strong>Lieu :</strong> ${lieu || 'A confirmer'}`;

  const html = baseTemplate(
    'Modification de votre entretien',
    `
    <p>Bonjour <strong>${studentName}</strong>,</p>
    <p>Les informations de votre entretien ont ete modifiees. Voici les nouveaux details :</p>
    
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600; width: 40%;">Date</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">${dateFormatted}</td>
      </tr>
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Heure</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">${heure}</td>
      </tr>
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Type</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">${type}</td>
      </tr>
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">${type === 'Visio' ? 'Lien' : 'Lieu'}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">${type === 'Visio' ? `<a href="${lienVisio}">${lienVisio}</a>` : (lieu || 'A confirmer')}</td>
      </tr>
    </table>
    
    <div style="background: #dbeafe; padding: 16px; border-radius: 4px; margin: 16px 0;">
      <p style="margin: 0; font-size: 14px; color: #1e40af;">
        <strong>Important :</strong><br>
        • Merci de confirmer votre disponibilite a la nouvelle date<br>
        • En cas d'empechement, contactez-nous 48h a l'avance
      </p>
    </div>
    
    <p>Nous vous remercions de votre comprehension.</p>
    <p>Cordialement,</p>
    <p><strong>Direction des Ressources Humaines</strong><br>
    Societe Nationale de Radiodiffusion et de Television</p>
    `
  );

  await sendMail({
    to,
    subject: 'Modification de votre entretien - SNRT',
    html,
    text: `Bonjour ${studentName}, votre entretien a ete modifie le ${dateFormatted} a ${heure}.`
  });
}

// ============================================
// ENTRETIENS - RÉSULTAT (Positif/Négatif)
// ============================================

async function sendInterviewResultEmail({ to, studentName, resultat, date, heure, type, offreTitre, lieu, lienVisio }) {
  const dateFormatted = new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const isPositive = resultat === 'Positive';
  
  // Messages différents avec offre
  const offreText = offreTitre || 'non spécifiée';
  const message = isPositive 
    ? `Félicitations ! Votre candidature pour l'offre <strong>${offreText}</strong> a été retenue. Vous recevrez prochainement les informations pour la suite du processus d'intégration.`
    : `Nous vous remercions pour votre participation à l'offre <strong>${offreText}</strong> et pour l'intérêt que vous avez porté à notre organisation. Nous vous encourageons à consulter régulièrement nos offres pour de futures opportunités.`;

  // Positif : avec récapitulatif
  // Négatif : sans récapitulatif
  let recapitulatif = '';
  if (isPositive) {
    recapitulatif = `
    <p style="font-size: 14px; color: #4b5563; margin-top: 16px;">
      <strong>Récapitulatif de l'entretien :</strong><br>
      Date : ${dateFormatted}<br>
      Heure : ${heure}<br>
      Type : ${type}
    </p>
    `;
  }

  const html = baseTemplate(
    `Résultat de votre entretien`,
    `
    <p>Bonjour <strong>${studentName}</strong>,</p>
    <p>${message}</p>
    
    ${recapitulatif}
    
    <p style="margin-top: 16px;">
      Cordialement,<br>
      <strong>Direction des Ressources Humaines</strong><br>
      Société Nationale de Radiodiffusion et de Télévision
    </p>
    `
  );

  await sendMail({
    to,
    subject: `Résultat de votre entretien - SNRT`,
    html,
    text: `Bonjour ${studentName}, ${message.replace(/<[^>]*>/g, '')}`
  });
}

// ============================================
// DOCUMENTS DE STAGE
// ============================================

async function sendEngagementConfidentialiteEmail({ to, studentName, pdfPath }) {
    const html = baseTemplate(
        'Engagement de Confidentialite - SNRT',
        `<p>Bonjour ${studentName},</p>
         <p>Suite a l'acceptation de votre candidature, veuillez trouver ci-joint le document <strong>PSRH-PR01-EN10-A - Engagement de Confidentialite</strong>.</p>
         <p>Veuillez imprimer ce document, le signer, puis le deposer sur la plateforme dans la section prevue a cet effet.</p>
         <p>Ce document est obligatoire pour la poursuite de votre processus d'integration.</p>
         <p>Cordialement,</p>
         <p>Direction des Ressources Humaines</p>`
    );

    await sendMail({
        to,
        subject: 'Engagement de Confidentialite - SNRT',
        html,
        text: `Bonjour ${studentName}, veuillez trouver ci-joint votre engagement de confidentialite.`,
        attachments: [
            {
                filename: 'Engagement_Confidentialite_SNRT.pdf',
                path: pdfPath,
            }
        ]
    });
}

async function sendDemandeDirecteurEmail({ to, directeurNom, studentName, startDate, endDate, pdfPath }) {
    const html = baseTemplate(
        'Demande de Stage - Validation Directeur',
        `<p>Bonjour Monsieur ${directeurNom},</p>
         <p>Je vous prie de trouver ci-joint la fiche de demande de stage concernant <strong>${studentName}</strong>.</p>
         <p><strong>Periode du stage :</strong> du ${startDate} au ${endDate}</p>
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

async function sendFicheSigneeEtudiant({ to, studentName, pdfPath }) {
    const html = baseTemplate(
        'Validation de votre stage - SNRT',
        `<p>Bonjour ${studentName},</p>
         <p>Nous avons le plaisir de vous informer que votre demande de stage a ete <strong>validee</strong> par la Direction.</p>
         <p>Vous trouverez ci-joint votre fiche de stage signee et cachetee.</p>
         <p><strong>Prochaines etapes :</strong></p>
         <ul style="margin: 8px 0; padding-left: 20px;">
            <li>Conservez cette fiche avec votre rapport de stage</li>
            <li>Presentez les deux documents a la Direction des Ressources Humaines pour obtenir votre attestation de stage</li>
         </ul>
         <p>Felicitations pour votre acceptation !</p>
         <p>Cordialement,</p>
         <p>Direction des Ressources Humaines</p>`
    );

    await sendMail({
        to,
        subject: 'Validation de votre stage - SNRT',
        html,
        text: `Bonjour ${studentName}, votre stage a ete valide. Trouvez ci-joint votre fiche signee.`,
        attachments: [
            {
                filename: `Fiche_Stage_Validee_${studentName}.pdf`,
                path: pdfPath,
            }
        ]
    });
}

async function sendAttestationStage({ to, studentName, pdfPath }) {
    const html = baseTemplate(
        'Attestation de Stage - SNRT',
        `<p>Bonjour ${studentName},</p>
         <p>Suite a la validation de votre rapport de stage, nous avons le plaisir de vous delivrer votre <strong>attestation de stage</strong>.</p>
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

async function sendDemandeStageToStudent({ to, studentName, pdfPath }) {
    if (!fs.existsSync(pdfPath)) {
        throw new Error(`Fichier PDF introuvable: ${pdfPath}`);
    }

    const html = baseTemplate(
        'Demande de stage - SNRT',
        `<p>Bonjour <strong>${studentName}</strong>,</p>
         <p>Veuillez trouver ci-joint la demande de stage destinee au Directeur.</p>
         <p>Vous devez :</p>
         <ol style="margin: 8px 0; padding-left: 20px;">
             <li>Imprimer ce document</li>
             <li>Le faire signer et cacheter par le Directeur</li>
             <li>Le retourner a la Direction des Ressources Humaines</li>
         </ol>
         <p>Nous vous remercions pour votre collaboration.</p>
         <p>Cordialement,</p>
         <p><strong>Direction des Ressources Humaines</strong></p>
         <p>SNRT</p>`
    );

    await sendMail({
        to,
        subject: `Demande de stage - SNRT`,
        html,
        text: `Bonjour ${studentName}, veuillez trouver ci-joint la demande de stage destinee au Directeur.`,
        attachments: [
            {
                filename: `Demande_Stage_Directeur_${studentName.replace(/\s/g, '_')}.pdf`,
                path: pdfPath,
            }
        ]
    });

    logger.info(`Email demande de stage envoye a ${to}`);
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
  sendInterviewUpdatedEmail,
  sendInterviewResultEmail,

  // Documents de stage
  sendEngagementConfidentialiteEmail,
  sendDemandeDirecteurEmail,
  sendFicheSigneeEtudiant,
  sendAttestationStage,
  sendDemandeStageToStudent,
};