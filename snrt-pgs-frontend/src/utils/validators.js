// src/utils/validators.js
import { CIN_REGEX, PHONE_REGEX, CONFIG } from './constants';

// ============================================
// VALIDATION CIN
// ============================================
export const validateCIN = (cin) => {
    if (!cin) return { valid: false, message: 'Le CIN est obligatoire' };
    if (!CIN_REGEX.test(cin)) {
        return { valid: false, message: 'CIN invalide (ex: AB123456)' };
    }
    return { valid: true, message: '' };
};

// ============================================
// VALIDATION TÉLÉPHONE
// ============================================
export const validatePhone = (phone) => {
    if (!phone) return { valid: false, message: 'Le téléphone est obligatoire' };
    if (!PHONE_REGEX.test(phone)) {
        return { valid: false, message: 'Téléphone invalide (ex: 0612345678)' };
    }
    return { valid: true, message: '' };
};

// ============================================
// VALIDATION EMAIL
// ============================================
export const validateEmail = (email) => {
    if (!email) return { valid: false, message: 'L\'email est obligatoire' };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { valid: false, message: 'Email invalide' };
    }
    return { valid: true, message: '' };
};

// ============================================
// VALIDATION MOT DE PASSE (externe = 16 caractères)
// ============================================
export const validatePassword = (password, userType = 'externe') => {
    const errors = [];
    const minLength = CONFIG.minPasswordLength[userType] || 16;

    if (!password) {
        errors.push('Le mot de passe est obligatoire');
        return { valid: false, errors };
    }

    if (password.length < minLength) {
        errors.push(`${minLength} caractères minimum`);
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('une majuscule (A-Z)');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('une minuscule (a-z)');
    }
    if (!/[0-9]/.test(password)) {
        errors.push('un chiffre (0-9)');
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
        errors.push('un caractère spécial (!@#$%^&* etc.)');
    }

    return {
        valid: errors.length === 0,
        errors,
        message: errors.length > 0 ? `Le mot de passe doit contenir : ${errors.join(', ')}` : '',
    };
};

// ============================================
// VALIDATION FICHIER
// ============================================
export const validateFile = (file) => {
    if (!file) return { valid: false, message: 'Aucun fichier sélectionné' };
    
    if (file.size > CONFIG.maxFileSize) {
        return { valid: false, message: `Le fichier ne doit pas dépasser ${CONFIG.maxFileSize / 1024 / 1024}MB` };
    }
    
    if (!CONFIG.allowedFileTypes.includes(file.type)) {
        return { valid: false, message: 'Type de fichier non autorisé (PDF, DOC, DOCX, JPG, PNG)' };
    }
    
    return { valid: true, message: '' };
};

// ============================================
// VALIDATION FORMULAIRE D'INSCRIPTION - ÉTAPE 1
// ============================================
export const validateRegisterStep1 = (form) => {
    const errors = {};

    if (!form.civilite) errors.civilite = 'La civilité est obligatoire';
    if (!form.nom) errors.nom = 'Le nom est obligatoire';
    if (!form.prenom) errors.prenom = 'Le prénom est obligatoire';
    if (!form.dateNaissance) errors.dateNaissance = 'La date de naissance est obligatoire';
    
    const emailValidation = validateEmail(form.email);
    if (!emailValidation.valid) errors.email = emailValidation.message;
    
    if (!form.emailConfirmation) {
        errors.emailConfirmation = 'La confirmation de l\'email est obligatoire';
    } else if (form.email !== form.emailConfirmation) {
        errors.emailConfirmation = 'Les emails ne correspondent pas';
    }
    
    const cinValidation = validateCIN(form.cin);
    if (!cinValidation.valid) errors.cin = cinValidation.message;
    
    const phoneValidation = validatePhone(form.telephone);
    if (!phoneValidation.valid) errors.telephone = phoneValidation.message;
    
    if (!form.adresse) errors.adresse = 'L\'adresse est obligatoire';
    if (!form.ville) errors.ville = 'La ville est obligatoire';
    if (!form.pays) errors.pays = 'Le pays est obligatoire';
    if (!form.acceptTerms) errors.acceptTerms = 'Vous devez accepter les conditions';

    return {
        valid: Object.keys(errors).length === 0,
        errors,
    };
};

// ============================================
// VALIDATION FORMULAIRE D'INSCRIPTION - ÉTAPE 2
// ============================================
export const validateRegisterStep2 = (form) => {
    const errors = {};
    
    const passwordValidation = validatePassword(form.motDePasse, 'externe');
    if (!passwordValidation.valid) {
        errors.motDePasse = passwordValidation.message;
    }
    
    if (form.motDePasse !== form.confirmationMotDePasse) {
        errors.confirmationMotDePasse = 'Les mots de passe ne correspondent pas';
    }
    
    return {
        valid: Object.keys(errors).length === 0,
        errors,
    };
};

// ============================================
// VALIDATION OFFRE
// ============================================
export const validateOffer = (form) => {
    const errors = [];

    if (!form.titre) errors.push('Le titre est obligatoire');
    if (!form.description) errors.push('La description est obligatoire');
    if (!form.typeStage) errors.push('Le type de stage est obligatoire');
    if (!form.periodeId) errors.push('La période est obligatoire');
    if (!form.dateDebut) errors.push('La date de début est obligatoire');
    if (!form.dateFin) errors.push('La date de fin est obligatoire');
    if (!form.dateLimiteCandidature) errors.push('La date limite de candidature est obligatoire');
    
    if (form.sujets) {
        form.sujets.forEach((sujet, index) => {
            if (!sujet.titre) errors.push(`Le titre du sujet ${index + 1} est obligatoire`);
            if (!sujet.description) errors.push(`La description du sujet ${index + 1} est obligatoire`);
        });
    }

    return {
        valid: errors.length === 0,
        errors,
    };
};