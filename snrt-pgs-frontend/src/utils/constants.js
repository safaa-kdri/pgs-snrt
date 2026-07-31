// src/utils/constants.js

// ============================================
// TYPES DE STAGE - ALIGNÉS AVEC LE BACKEND
// ============================================
export const OFFER_TYPES = ['PFE', 'PFA', 'Initiation', 'Ete', 'Master', 'Licence', 'Technicien'];

// ============================================
// STATUTS DES OFFRES - ALIGNÉS AVEC LE BACKEND
// ============================================
export const OFFER_STATUS = {
    BROUILLON: 'Brouillon',
    EN_ATTENTE: 'EnAttente',
    PUBLIEE: 'Publiee',
    REFUSEE: 'Refusee',
    ARCHIVEE: 'Archivee',
};

// ============================================
// STATUTS DES CANDIDATURES - ALIGNÉS AVEC LE BACKEND
// ============================================
export const APPLICATION_STATUS = {
    BROUILLON: 'Brouillon',
    SOUMISE: 'Soumise',
    EN_ANALYSE: 'EnAnalyse',
    ENTRETIEN: 'Entretien',
    ACCEPTEE: 'Acceptee',
    REFUSEE: 'Refusee',
};

// ============================================
// TYPES DE DOCUMENTS - ALIGNÉS AVEC LE BACKEND
// ============================================
export const DOCUMENT_TYPES = ['CV', 'LettreMotivation', 'Convention', 'Attestation', 'ReleveNotes', 'Autre'];

// ============================================
// RÔLES - ALIGNÉS AVEC LE BACKEND
// ============================================
export const ROLES = {
    ADMIN: 'Administrateur',
    RH: 'RH',
    DEPARTEMENT: 'Departement',
    ENCADRANT: 'Encadrant',
    ETUDIANT: 'Etudiant',
};

// ============================================
// EXPRESSIONS RÉGULIÈRES
// ============================================
export const CIN_REGEX = /^[A-Z]{1,2}[0-9]{6}$/;
export const PHONE_REGEX = /^(?:\+212|0)[5-7][0-9]{8}$/;

// ============================================
// CONFIGURATION
// ============================================
export const CONFIG = {
    minPasswordLength: {
        externe: 16,
        interne: 20,
    },
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedFileTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
    ],
};