// src/services/internshipService.js
// ✅ Service pour gérer les appels API liés aux stages

import api from './api';

/**
 * Récupérer tous les stages de l'étudiant connecté
 */
export const getStudentInternships = async () => {
  const response = await api.get('/internships/student');
  return response.data?.data || [];
};

/**
 * Vérifier si l'étudiant a au moins un stage actif/accepté
 */
export const hasActiveInternship = async () => {
  const response = await api.get('/internships/student/has-active');
  return response.data?.hasActive || false;
};

/**
 * Récupérer les détails d'un stage spécifique
 */
export const getInternshipDetail = async (internshipId) => {
  const response = await api.get(`/internships/${internshipId}`);
  return response.data?.data || null;
};

/**
 * Récupérer le journal de suivi d'un stage
 */
export const getTimeline = async (internshipId) => {
  const response = await api.get(`/internships/${internshipId}/timeline`);
  return response.data?.data || [];
};

/**
 * Publier un message dans le journal de suivi
 */
export const postTimelineMessage = async (internshipId, message, file = null) => {
  const formData = new FormData();
  formData.append('message', message);
  if (file) {
    formData.append('file', file);
  }
  const response = await api.post(`/internships/${internshipId}/timeline`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data?.data || null;
};

/**
 * Récupérer le statut de la convention d'un stage
 */
export const getConventionStatus = async (internshipId) => {
  const response = await api.get(`/internships/${internshipId}/convention`);
  return response.data?.data || null;
};

/**
 * Déposer la convention signée
 */
export const uploadConvention = async (internshipId, file) => {
  const formData = new FormData();
  formData.append('convention', file);
  const response = await api.post(`/internships/${internshipId}/convention`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data?.data || null;
};

/**
 * Télécharger la convention signée
 */
export const downloadConvention = async (internshipId) => {
  const response = await api.get(`/internships/${internshipId}/convention/download`, {
    responseType: 'blob',
  });
  return response.data;
};

/**
 * Récupérer les livrables d'un stage
 */
export const getLivrables = async (internshipId) => {
  const response = await api.get(`/internships/${internshipId}/livrables`);
  return response.data?.data || [];
};

/**
 * Déposer un livrable
 */
export const uploadLivrable = async (internshipId, file, type) => {
  const formData = new FormData();
  formData.append('livrable', file);
  formData.append('type', type);
  const response = await api.post(`/internships/${internshipId}/livrables`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data?.data || null;
};

/**
 * Valider ou rejeter un livrable (encadrant)
 */
export const validateLivrable = async (internshipId, livrableId, valide, commentaire = '') => {
  const response = await api.put(`/internships/${internshipId}/livrables/${livrableId}/validate`, {
    valide,
    commentaire,
  });
  return response.data?.data || null;
};

/**
 * Récupérer l'évaluation d'un stage
 */
export const getEvaluation = async (internshipId) => {
  const response = await api.get(`/internships/${internshipId}/evaluation`);
  return response.data?.data || null;
};

/**
 * Télécharger l'attestation
 */
export const downloadAttestation = async (internshipId) => {
  const response = await api.get(`/internships/${internshipId}/attestation`, {
    responseType: 'blob',
  });
  return response.data;
};

/**
 * Clôturer le stage (encadrant)
 */
export const closeInternship = async (internshipId, remarques = '') => {
  const response = await api.put(`/internships/${internshipId}/close`, { remarques });
  return response.data?.data || null;
};