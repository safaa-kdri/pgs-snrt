const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

const sendEmail = async (options) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const message = {
            from: `${process.env.EMAIL_FROM_NAME || 'SNRT PGS'} <${process.env.EMAIL_FROM}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html // Optional: if you want to send styled emails
        };

        const info = await transporter.sendMail(message);
        logger.info(`📧 Email envoyé à: ${options.email} (Message ID: ${info.messageId})`);
    } catch (error) {
        logger.error(`❌ Erreur d'envoi d'email: ${error.message}`);
        throw new Error("L'envoi de l'email a échoué.");
    }
};

module.exports = sendEmail;