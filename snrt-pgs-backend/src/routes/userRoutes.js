// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const userController = require('../controllers/userController');
const conventionController = require('../controllers/conventionController');
const validate = require('../middlewares/validation');
const { authenticate, authorize } = require('../middlewares/auth');
const { ROLES } = require('../config/constants');
const {
  createInternalUserSchema,
  createExternalUserSchema,
  updateInternalUserSchema,
  updateExternalUserSchema,
  changeUserRoleSchema,
  assignDepartmentToUserSchema,
  changeUserStatusSchema,
} = require('../utils/validators');

// ============================================
// CONFIGURATION MULTER POUR LA SIGNATURE
// ============================================

// Créer le dossier si nécessaire
const signatureDir = path.join(__dirname, '../../uploads/signatures');
if (!fs.existsSync(signatureDir)) {
    fs.mkdirSync(signatureDir, { recursive: true });
}

const signatureStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, signatureDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'signature_' + uniqueSuffix + path.extname(file.originalname));
    }
});

const signatureFileFilter = (req, file, cb) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Seuls les fichiers PNG, JPG et JPEG sont acceptés'), false);
    }
};

const uploadSignature = multer({
    storage: signatureStorage,
    fileFilter: signatureFileFilter,
    limits: { fileSize: 2 * 1024 * 1024 } // 2 Mo
});

// ============================================
// Authentification requise pour toutes les routes
// ============================================
router.use(authenticate());

// ============================================
// ✅ ROUTES SANS PARAMÈTRES (EN PREMIER)
// ============================================

// 1️⃣ GET - Récupérer la signature du RH connecté
router.get(
    '/signature',
    authorize(ROLES.RH, ROLES.ADMIN),
    async (req, res) => {
        try {
            const UtilisateurInterne = require('../models/UtilisateurInterne');
            const user = await UtilisateurInterne.findById(req.user.id).select('signature');
            
            if (user?.signature) {
                const baseUrl = `${req.protocol}://${req.get('host')}`;
                return res.status(200).json({
                    success: true,
                    signature: `${baseUrl}${user.signature}`
                });
            }
            
            return res.status(404).json({
                success: false,
                message: 'Aucune signature trouvée pour cet utilisateur'
            });
        } catch (error) {
            console.error('❌ Erreur récupération signature:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération de la signature'
            });
        }
    }
);

// 2️⃣ POST - Uploader la signature (RH)
router.post(
    '/signature/upload',
    authorize(ROLES.RH, ROLES.ADMIN),
    uploadSignature.single('signature'),
    async (req, res) => {
        try {
            const UtilisateurInterne = require('../models/UtilisateurInterne');
            const file = req.file;

            if (!file) {
                return res.status(400).json({
                    success: false,
                    message: 'Aucun fichier fourni'
                });
            }

            const user = await UtilisateurInterne.findById(req.user.id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Utilisateur non trouvé'
                });
            }

            // Supprimer l'ancienne signature si elle existe
            if (user.signature) {
                const oldPath = path.join(__dirname, '../../', user.signature.replace(/^\//, ''));
                if (fs.existsSync(oldPath)) {
                    try {
                        fs.unlinkSync(oldPath);
                    } catch (unlinkError) {
                        console.warn('⚠️ Impossible de supprimer l\'ancienne signature:', unlinkError.message);
                    }
                }
            }

            user.signature = `/uploads/signatures/${file.filename}`;
            await user.save();

            const baseUrl = `${req.protocol}://${req.get('host')}`;

            console.log('✅ [uploadSignature] Signature uploadée pour:', req.user.email);
            console.log('✅ [uploadSignature] Chemin:', user.signature);

            return res.status(200).json({
                success: true,
                message: 'Signature uploadée avec succès',
                signature: `${baseUrl}${user.signature}`
            });
        } catch (error) {
            console.error('❌ Erreur upload signature:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de l\'upload de la signature'
            });
        }
    }
);

// 3️⃣ DELETE - Supprimer la signature (RH)
router.delete(
    '/signature',
    authorize(ROLES.RH, ROLES.ADMIN),
    async (req, res) => {
        try {
            const UtilisateurInterne = require('../models/UtilisateurInterne');
            const user = await UtilisateurInterne.findById(req.user.id);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Utilisateur non trouvé'
                });
            }

            if (user.signature) {
                const filePath = path.join(__dirname, '../../', user.signature.replace(/^\//, ''));
                if (fs.existsSync(filePath)) {
                    try {
                        fs.unlinkSync(filePath);
                    } catch (unlinkError) {
                        console.warn('⚠️ Impossible de supprimer la signature:', unlinkError.message);
                    }
                }
            }

            user.signature = null;
            await user.save();

            return res.status(200).json({
                success: true,
                message: 'Signature supprimée avec succès'
            });
        } catch (error) {
            console.error('❌ Erreur suppression signature:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la suppression de la signature'
            });
        }
    }
);

// 4️⃣ GET - Récupérer les encadrants du département
router.get(
    '/encadrants/department',
    authorize(ROLES.DEPARTEMENT),
    userController.getEncadrantsByDepartment
);

// ============================================
// ✅ ROUTES RH - CONVENTIONS
// ============================================

// GET - Récupérer toutes les conventions déposées
router.get(
    '/conventions',
    authorize(ROLES.RH, ROLES.ADMIN),
    conventionController.getConventionsDeposees
);

// GET - Télécharger une convention spécifique
router.get(
    '/convention/:id/download',
    authorize(ROLES.RH, ROLES.ADMIN),
    conventionController.downloadConventionRH
);

// PUT - Signer une convention (BDD)
router.put(
    '/convention/:id/signer',
    authorize(ROLES.RH, ROLES.ADMIN),
    conventionController.signerConvention
);

// GET - Générer le PDF signé
router.get(
    '/convention/:id/sign-pdf',
    authorize(ROLES.RH, ROLES.ADMIN),
    conventionController.ajouterSignatureSurPDF
);

// PUT - Envoyer la convention à l'étudiant
router.put(
    '/convention/:id/envoyer-etudiant',
    authorize(ROLES.RH, ROLES.ADMIN),
    conventionController.envoyerConventionEtudiant
);

// ============================================
// ✅ ROUTES CRUD UTILISATEURS (SANS PARAMÈTRES)
// ============================================

// GET - Récupérer tous les utilisateurs
router.get('/', userController.getAllUsers);

// POST - Créer un utilisateur interne
router.post(
    '/internal',
    authorize(ROLES.ADMIN, ROLES.DEPARTEMENT),
    userController.createInternalUser
);

// POST - Créer un utilisateur externe
router.post(
    '/externe',
    authorize(ROLES.ADMIN),
    userController.createExterne
);

router.post(
    '/external',
    authorize(ROLES.ADMIN),
    userController.createExterne
);

// ============================================
// ⚠️ ROUTES AVEC PARAMÈTRES (:type/:id) - EN DERNIER
// ============================================

// GET - Récupérer un utilisateur par ID
router.get('/:type/:id', userController.getUserById);

// PUT - Mettre à jour un utilisateur
function validateUpdateUser(req, res, next) {
  const schema = req.params.type === 'interne' ? updateInternalUserSchema : updateExternalUserSchema;
  return validate(schema)(req, res, next);
}
router.put('/:type/:id', authorize(ROLES.ADMIN), validateUpdateUser, userController.updateUser);

// DELETE - Supprimer un utilisateur
router.delete('/:type/:id', authorize(ROLES.ADMIN), userController.deleteUser);

// PATCH - Restaurer un utilisateur
router.patch('/:type/:id/restore', authorize(ROLES.ADMIN), userController.restoreUser);

// PATCH - Changer le rôle d'un utilisateur
router.patch('/:type/:id/role', authorize(ROLES.ADMIN), validate(changeUserRoleSchema), userController.changeUserRole);

// PATCH - Assigner un département
router.patch('/internal/:id/department', authorize(ROLES.ADMIN), validate(assignDepartmentToUserSchema), userController.assignDepartment);

// PATCH - Changer le statut d'un utilisateur
router.patch('/:type/:id/status', authorize(ROLES.ADMIN), validate(changeUserStatusSchema), userController.changeUserStatus);

module.exports = router;