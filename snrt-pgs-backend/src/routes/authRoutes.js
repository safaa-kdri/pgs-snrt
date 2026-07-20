const express = require('express');
const authController = require('../controllers/authController');
const validate = require('../middlewares/validation');
const { authenticate, loginLimiter, registerLimiter, twoFactorLimiter, forgotPasswordLimiter } = require('../middlewares/auth');
const {
  registerSchema,
  loginSchema,
  verifyTwoFactorSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require('../utils/validators');

const router = express.Router();

// --- Inscription (etudiants uniquement) ---
router.post('/register', registerLimiter, validate(registerSchema), authController.register);

// --- Connexion en 2 etapes (mot de passe puis code 2FA par email) ---
router.post('/login', loginLimiter, validate(loginSchema), authController.login);
router.post('/verify-2fa', twoFactorLimiter, validate(verifyTwoFactorSchema), authController.verifyTwoFactor);
router.post('/resend-2fa', twoFactorLimiter, authController.resendTwoFactorCode);

// --- Gestion de session (JWT via cookies HttpOnly) ---
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

// --- Reinitialisation de mot de passe ---
router.post('/forgot-password', forgotPasswordLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password/:token', validate(resetPasswordSchema), authController.resetPassword);

// --- Profil de l'utilisateur connecte ---
router.get('/me', authenticate(), authController.me);

module.exports = router;
