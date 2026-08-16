// src/components/student/DepotCandidature.jsx
// ✅ WORKFLOW DE CANDIDATURE EN 3 ÉTAPES
// ✅ STYLE EXACTEMENT COMME L'IMAGE DE RÉFÉRENCE
// ✅ ZONE DES TITRES : BLANC (#ffffff)
// ✅ ZONE "Choisir un fichier" AGRANDIE
// ✅ ZONE "Pièces justificatives" AGRANDIE - MARGES RÉDUITES
// ✅ NOMS DE FICHIERS COMPLETS (SANS ELLIPSIS)
// ✅ COLONNES RÉÉQUILIBRÉES POUR MEILLEURE LISIBILITÉ
// ✅ MESSAGES DE SUCCÈS AVEC NOMS LISIBLES
// ✅ ICÔNE TROMBONE CLIQUABLE POUR UPLOAD

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import {
    Box,
    Container,
    Paper,
    Typography,
    Button,
    TextField,
    Alert,
    CircularProgress,
    Divider,
    Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

// ============================================
// MAPPING DES TYPES DE DOCUMENTS
// ============================================

const DOCUMENT_LABELS = {
    'Photo': 'Photo d\'identité',
    'LettreMotivation': 'Lettre de motivation',
    'CV': 'CV',
    'AttestationScolarite': 'Attestation de scolarité',
    'LettreRecommandation': 'Lettre de recommandation',
    'CIN': 'Copie CIN',
    'Assurance': 'Assurance',
    'FicheEngagement': 'Fiche de demande de stage',
};

// ============================================
// STYLES
// ============================================

const PageContainer = styled(Box)({
    padding: '20px 0',
});

const StepCard = styled(Paper)({
    borderRadius: '16px',
    padding: '28px 32px',
    marginTop: '20px',
    backgroundColor: '#f7f7f7',
    boxShadow: 'none',
    border: '1px solid #eef1f3',
});

// ✅ Carte Étape 3 - MARGES TRÈS RÉDUITES
const StepCardWide = styled(Paper)({
    borderRadius: '16px',
    padding: '12px 8px',
    marginTop: '20px',
    backgroundColor: '#f7f7f7',
    boxShadow: 'none',
    border: '1px solid #eef1f3',
    width: '100%',
    maxWidth: '100%',
    marginLeft: '0',
    marginRight: '0',
    boxSizing: 'border-box',
});

const PageTitle = styled(Typography)({
    fontFamily: 'Inter, sans-serif',
    fontWeight: 700,
    fontSize: '28px',
    color: '#1a2332',
    marginBottom: '20px',
    textAlign: 'center',
});

const TitleDivider = styled(Divider)({
    borderColor: '#148aa0',
    borderWidth: '1px',
    width: '95%',
    margin: '0 auto 30px auto',
});

const SectionTitle = styled(Typography)({
    fontFamily: 'Inter, sans-serif',
    fontWeight: 700,
    fontSize: '20px',
    color: '#1a2332',
    marginBottom: '20px',
});

const SectionTitleCentered = styled(Typography)({
    fontFamily: 'Inter, sans-serif',
    fontWeight: 700,
    fontSize: '20px',
    color: '#1a2332',
    marginBottom: '16px',
    textAlign: 'center',
});

const StyledTextField = styled(TextField)({
    '& .MuiOutlinedInput-root': {
        borderRadius: '10px',
        backgroundColor: '#ffffff',
        height: '44px',
        '& fieldset': { borderColor: '#d1d5db' },
        '&:hover fieldset': { borderColor: '#d1d5db' },
        '&.Mui-focused fieldset': { borderColor: '#148aa0' },
    },
    '& .MuiInputBase-input': {
        padding: '0 14px',
        fontSize: '14px',
        color: '#1a2332',
        fontFamily: 'Inter, sans-serif',
    },
    '& .MuiInputLabel-root': {
        fontFamily: 'Inter, sans-serif',
        fontSize: '14px',
        color: '#6d7884',
        '&.Mui-focused': { color: '#148aa0' },
    },
    '& .MuiInputLabel-shrink': {
        transform: 'translate(14px, -6px) scale(0.75)',
    },
});

const NextButton = styled(Button)({
    borderRadius: '10px',
    textTransform: 'none',
    fontFamily: 'Inter, sans-serif',
    backgroundColor: '#148aa0',
    color: '#ffffff',
    padding: '10px 32px',
    fontSize: '15px',
    fontWeight: 600,
    '&:hover': { backgroundColor: '#0b7890' },
    '&:disabled': { backgroundColor: '#a0c4cd' },
});

const PrevButton = styled(Button)({
    borderRadius: '10px',
    textTransform: 'none',
    fontFamily: 'Inter, sans-serif',
    borderColor: '#148aa0',
    color: '#148aa0',
    padding: '10px 32px',
    fontSize: '15px',
    fontWeight: 600,
    '&:hover': {
        borderColor: '#0b7890',
        color: '#0b7890',
        backgroundColor: 'rgba(20, 138, 160, 0.04)',
    },
});

const ValidateButton = styled(Button)({
    borderRadius: '10px',
    textTransform: 'none',
    fontFamily: 'Inter, sans-serif',
    backgroundColor: '#148aa0',
    color: '#ffffff',
    padding: '12px 48px',
    fontSize: '16px',
    fontWeight: 700,
    '&:hover': { backgroundColor: '#0b7890' },
    '&:disabled': { backgroundColor: '#a0c4cd' },
});

const StepCircle = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'active'
})(({ active }) => ({
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    border: `3.5px solid ${active ? '#148aa0' : '#d1d5db'}`,
    backgroundColor: '#ffffff',
    flexShrink: 0,
    transition: 'all 0.3s ease',
    position: 'relative',
    zIndex: 2,
}));

const StepLine = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'active'
})(({ active }) => ({
    flex: 1,
    height: '2px',
    backgroundColor: active ? '#148aa0' : '#d1d5db',
    marginLeft: '-2px',
    marginRight: '-2px',
}));

const WorkflowContainer = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0px',
    marginBottom: '32px',
    width: '100%',
    maxWidth: '500px',
    marginLeft: 'auto',
    marginRight: 'auto',
});

// ============================================
// STYLES ÉTAPE 3 - AGRANDIS ET OPTIMISÉS
// ============================================

const UploadContainer = styled(Box)({
    width: '100%',
    maxWidth: '100%',
    padding: '4px 0 0 0',
    background: 'transparent',
    boxSizing: 'border-box',
    margin: '0 auto',
});

const UploadRow = styled(Box)({
    display: 'flex',
    width: '100%',
    height: '34px',
    marginBottom: '6px',
    border: '1px solid #dddddd',
    borderRadius: '6px',
    overflow: 'hidden',
    background: '#ffffff',
    boxSizing: 'border-box',
});

const UploadLabel = styled(Box)({
    width: '220px',
    flex: '0 0 220px',
    display: 'flex',
    alignItems: 'center',
    padding: '0 14px',
    boxSizing: 'border-box',
    background: '#ffffff',
    color: '#555555',
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontSize: '12px',
    fontWeight: 400,
    lineHeight: 1,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
});

const UploadButtonZone = styled(Box)({
    width: '155px',
    flex: '0 0 155px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#eeeeee',
    borderLeft: '1px solid #dcdcdc',
    borderRight: '1px solid #dcdcdc',
    boxSizing: 'border-box',
    padding: '0 6px',
});

const StyledFileButton = styled(Button)({
    width: '100%',
    height: '100%',
    minWidth: '0',
    padding: '0 4px',
    borderRadius: '0',
    background: 'transparent',
    color: '#555555',
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontSize: '12px',
    fontWeight: 400,
    textTransform: 'none',
    boxShadow: 'none',
    border: 'none',
    whiteSpace: 'nowrap',
    overflow: 'visible',
    '&:hover': {
        background: '#e0e0e0',
        boxShadow: 'none',
    },
});

const UploadFilename = styled(Box)({
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    padding: '0 14px',
    background: '#ffffff',
    color: '#555555',
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontSize: '12px',
    fontWeight: 400,
    whiteSpace: 'nowrap',
    overflow: 'visible',
    boxSizing: 'border-box',
    minWidth: '150px',
});

// ✅ ICÔNE TROMBONE CLIQUABLE AVEC EFFET AU SURVOL
const UploadIcon = styled(Box)({
    width: '50px',
    flex: '0 0 50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#ffffff',
    borderLeft: '1px solid #dddddd',
    color: '#444444',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
    '&:hover': {
        background: 'rgba(20, 138, 160, 0.06)',
        color: '#148aa0',
    },
    '& i': {
        fontSize: '13px',
        transition: 'color 0.2s ease',
    },
    '&:hover i': {
        color: '#148aa0',
    },
});

const UploadSeparator = styled(Box)({
    width: '100%',
    height: '1px',
    marginTop: '12px',
    background: '#e6e6e6',
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const DepotCandidature = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();
    const { user } = useAuth();

    // ✅ Références pour les inputs file
    const fileInputRefs = useRef({});

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [etapeActuelle, setEtapeActuelle] = useState(1);
    const [offerId, setOfferId] = useState(null);
    const [offerTitle, setOfferTitle] = useState('');

    useEffect(() => {
        if (location.state?.offreId) {
            setOfferId(location.state.offreId);
            setOfferTitle(location.state?.offreTitre || 'Offre');
            console.log('🔍 [DepotCandidature] offreId reçu:', location.state.offreId);
        } else {
            console.warn('⚠️ [DepotCandidature] Aucune offreId dans location.state');
        }
        setLoading(false);
    }, [location]);

    const [formData, setFormData] = useState({
        universite: '',
        filiere: '',
        niveau: '',
        annee: '',
    });

    const [ficheAccepte, setFicheAccepte] = useState(false);

    const [documents, setDocuments] = useState({});
    const [documentIds, setDocumentIds] = useState([]);
    const [uploading, setUploading] = useState(false);

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleNext = async () => {
        if (etapeActuelle === 1) {
            if (!formData.universite || !formData.filiere || !formData.niveau) {
                setError('Veuillez remplir les champs obligatoires (Université, Filière, Niveau)');
                return;
            }
            setEtapeActuelle(2);
            setError('');
        } else if (etapeActuelle === 2) {
            if (!ficheAccepte) {
                setError('Vous devez confirmer que vous avez téléchargé la fiche avant de continuer');
                return;
            }
            setEtapeActuelle(3);
            setError('');
        } else if (etapeActuelle === 3) {
            await createAndSubmitCandidature();
            return;
        }
    };

    const handlePrev = () => {
        if (etapeActuelle > 1) {
            setEtapeActuelle(etapeActuelle - 1);
            setError('');
        }
    };

    const createAndSubmitCandidature = async () => {
        try {
            setSaving(true);
            setError('');
            
            const requiredDocs = ['Photo', 'LettreMotivation', 'CV', 'AttestationScolarite', 'LettreRecommandation', 'CIN', 'Assurance', 'FicheEngagement'];
            const missingDocs = requiredDocs.filter(doc => !documents[doc]);
            
            if (missingDocs.length > 0) {
                setError('Veuillez joindre toutes les pièces obligatoires avant de valider votre candidature.');
                setSaving(false);
                return;
            }
            
            if (!offerId) {
                setError('Aucune offre sélectionnée');
                setSaving(false);
                return;
            }
            
            console.log('📤 [createAndSubmitCandidature] Données à envoyer:', {
                offreId: offerId,
                documents: documentIds,
                universite: formData.universite,
                filiere: formData.filiere,
                niveau: formData.niveau,
                annee: formData.annee,
                ficheAccepte: ficheAccepte,
            });

            try {
                const checkResponse = await api.get('/applications', {
                    params: { 
                        offreId: offerId, 
                        etudiantId: user?.id 
                    }
                });
                
                const existingApps = checkResponse.data?.data || [];
                const hasSubmitted = existingApps.some(app => 
                    app.statut === 'Soumise' || app.statut === 'Acceptee'
                );
                
                if (hasSubmitted) {
                    setError('Vous avez déjà soumis une candidature pour cette offre. Une seule candidature par offre est autorisée.');
                    setSaving(false);
                    return;
                }
            } catch (checkError) {
                console.warn('Erreur lors de la vérification:', checkError);
            }
            
            const createResponse = await api.post('/applications', {
                offreId: offerId,
                commentaire: 'Candidature soumise via le workflow',
                documents: documentIds,
                universite: formData.universite,
                filiere: formData.filiere,
                niveau: formData.niveau,
                annee: formData.annee,
                ficheAccepte: ficheAccepte,
            });
            
            console.log('📥 [createAndSubmitCandidature] Réponse du serveur:', createResponse.data);

            if (!createResponse.data.success) {
                setError(createResponse.data.message || 'Erreur lors de la création de la candidature');
                setSaving(false);
                return;
            }
            
            setSuccess('Votre candidature a été déposée avec succès.');
            setTimeout(() => {
                navigate('/dashboard/applications');
            }, 3000);
            
        } catch (error) {
            console.error('❌ Erreur soumission:', error);
            console.error('❌ Réponse:', error.response?.data);
            console.error('❌ Status:', error.response?.status);
            
            const statusCode = error.response?.status;
            const errorMsg = error.response?.data?.message || error.message;
            
            if (statusCode === 400) {
                if (errorMsg?.includes('existe déjà') || errorMsg?.includes('déjà soumis')) {
                    setError('Vous avez déjà soumis une candidature pour cette offre. Une seule candidature par offre est autorisée.');
                } else {
                    setError(errorMsg);
                }
            } else if (statusCode === 500) {
                setError('Une erreur technique est survenue. Veuillez réessayer ultérieurement ou contacter le support.');
                console.error('Erreur serveur 500 - Détails:', error.response?.data);
            } else {
                setError(errorMsg || 'Erreur lors de la soumission de la candidature.');
            }
        } finally {
            setSaving(false);
        }
    };

    // ============================================
    // ✅ handleFileUpload AVEC MESSAGES LISIBLES
    // ============================================
    const handleFileUpload = async (type, file) => {
        if (!file) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('document', file);
            formData.append('type', type);

            console.log('📤 [handleFileUpload] Upload du document:', {
                type: type,
                fileName: file.name
            });

            const response = await api.post('/documents', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            console.log('✅ [handleFileUpload] Réponse:', response.data);

            const docId = response.data.data._id;
            setDocumentIds([...documentIds, docId]);
            setDocuments({ ...documents, [type]: file });

            // ✅ Utiliser le label lisible pour le message de succès
            const label = DOCUMENT_LABELS[type] || type;
            setSuccess(`${label} déposé avec succès`);
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            console.error('❌ Erreur lors du dépôt du document:', error);
            setError('Erreur lors du dépôt du document');
        } finally {
            setUploading(false);
        }
    };

    // ✅ Fonction pour déclencher l'upload depuis l'icône
    const handleIconClick = (type) => {
        if (fileInputRefs.current[type]) {
            fileInputRefs.current[type].click();
        }
    };

    const handleDownloadFiche = () => {
        try {
            const link = document.createElement('a');
            link.href = '/documents/fiche_engagement.pdf';
            link.download = 'Fiche_Demande_Stage_SNRT.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            console.log('✅ Téléchargement de la fiche de demande engagé');
        } catch (error) {
            console.error('❌ Erreur téléchargement:', error);
            window.open('/documents/fiche_engagement.pdf', '_blank');
        }
    };

    // ============================================
    // RENDER - ÉTAPE 1
    // ============================================

    const renderEtape1 = () => (
        <StepCard>
            <SectionTitle>Informations universitaires</SectionTitle>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: '650px', mx: 'auto', width: '90%' }}>
                <StyledTextField
                    fullWidth
                    label="Université *"
                    name="universite"
                    value={formData.universite}
                    onChange={handleFormChange}
                    placeholder="Ex: Université Hassan II"
                />

                <StyledTextField
                    fullWidth
                    label="Filière *"
                    name="filiere"
                    value={formData.filiere}
                    onChange={handleFormChange}
                    placeholder="Ex: Informatique"
                />

                <StyledTextField
                    fullWidth
                    label="Niveau d'études *"
                    name="niveau"
                    value={formData.niveau}
                    onChange={handleFormChange}
                    placeholder="Ex: Master 2"
                />

                <StyledTextField
                    fullWidth
                    label="Année universitaire"
                    name="annee"
                    value={formData.annee}
                    onChange={handleFormChange}
                    placeholder="Ex: 2025-2026"
                />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, pt: 2, borderTop: '1px solid #e5e7eb' }}>
                <NextButton onClick={handleNext} disabled={saving}>
                    {saving ? <CircularProgress size={24} color="inherit" /> : 'Suivant >>'}
                </NextButton>
            </Box>
        </StepCard>
    );

    // ============================================
    // RENDER - ÉTAPE 2
    // ============================================

    const renderEtape2 = () => (
        <StepCard>
            <SectionTitle>Fiche de demande de stage</SectionTitle>

            <Box sx={{ 
                p: 3, 
                backgroundColor: '#ffffff', 
                borderRadius: '12px', 
                mb: 3, 
                border: '1px solid #eef1f3'
            }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                    Téléchargement de la fiche
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Veuillez télécharger la fiche de demande de stage, la compléter avec les informations demandées, puis la déposer avec les autres pièces justificatives à l'étape suivante.
                </Typography>
                <Button
                    variant="outlined"
                    sx={{
                        borderRadius: '8px',
                        textTransform: 'none',
                        borderColor: '#148aa0',
                        color: '#148aa0',
                        '&:hover': { backgroundColor: 'rgba(20, 138, 160, 0.04)' }
                    }}
                    onClick={handleDownloadFiche}
                >
                    Télécharger la fiche de demande de stage
                </Button>
            </Box>

            <Box sx={{ 
                p: 2, 
                backgroundColor: '#ffffff', 
                borderRadius: '12px', 
                border: '1px solid #eef1f3',
                display: 'flex',
                alignItems: 'center'
            }}>
                <input
                    type="checkbox"
                    checked={ficheAccepte}
                    onChange={(e) => setFicheAccepte(e.target.checked)}
                    style={{
                        width: '18px',
                        height: '18px',
                        marginRight: '12px',
                        accentColor: '#148aa0',
                        cursor: 'pointer'
                    }}
                />
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#1a2332' }}>
                    J'ai téléchargé la fiche de demande de stage
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pt: 2, borderTop: '1px solid #e5e7eb' }}>
                <PrevButton onClick={handlePrev}>&lt;&lt; Précédent</PrevButton>
                <NextButton onClick={handleNext} disabled={!ficheAccepte || saving}>
                    {saving ? <CircularProgress size={24} color="inherit" /> : 'Suivant >>'}
                </NextButton>
            </Box>
        </StepCard>
    );

    // ============================================
    // RENDER - ÉTAPE 3 - OPTIMISÉ
    // ============================================

    const renderDocumentRow = (label, type, required = true) => {
        const fileName = documents[type] ? documents[type].name : null;

        return (
            <UploadRow>
                {/* Colonne 1 - Label (BLANC) */}
                <UploadLabel>
                    {required && <span style={{ color: '#d93025' }}>*</span>} {label}
                </UploadLabel>

                {/* Colonne 2 - Bouton "Choisir un fichier" */}
                <UploadButtonZone>
                    <StyledFileButton
                        component="label"
                        disableRipple
                    >
                        Choisir un fichier
                        <input
                            ref={(el) => (fileInputRefs.current[type] = el)}
                            type="file"
                            hidden
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    handleFileUpload(type, file);
                                }
                                e.target.value = '';
                            }}
                        />
                    </StyledFileButton>
                </UploadButtonZone>

                {/* Colonne 3 - Nom du fichier avec Tooltip */}
                {fileName ? (
                    <Tooltip title={fileName} arrow placement="top">
                        <UploadFilename>
                            {fileName}
                        </UploadFilename>
                    </Tooltip>
                ) : (
                    <UploadFilename>
                        Aucun fichier choisi
                    </UploadFilename>
                )}

                {/* Colonne 4 - Icône trombone CLIQUABLE */}
                <UploadIcon onClick={() => handleIconClick(type)}>
                    <i className="fa-solid fa-paperclip"></i>
                </UploadIcon>
            </UploadRow>
        );
    };

    const renderEtape3 = () => (
        <StepCardWide>
            <SectionTitleCentered>Pièces justificatives</SectionTitleCentered>

            <Box sx={{
                p: 2,
                mb: 3,
                backgroundColor: '#fef3c7',
                borderRadius: '8px',
                border: '1px solid #fcd34d',
            }}>
                <Typography variant="body2" color="#92400e" sx={{ fontSize: '13px', lineHeight: 1.5 }}>
                    Veuillez joindre les documents nécessaires à votre candidature de stage. Assurez-vous que les fichiers sont lisibles et respectent les formats et tailles autorisés.
                </Typography>
            </Box>

            <Typography variant="subtitle2" sx={{ 
                mb: 2, 
                fontWeight: 600, 
                fontSize: '12px', 
                color: '#1a2332',
                letterSpacing: '0.3px',
            }}>
                DOCUMENTS À DÉPOSER :
            </Typography>

            <UploadContainer>
                {renderDocumentRow('Photo d\'identité', 'Photo')}
                {renderDocumentRow('Lettre de motivation', 'LettreMotivation')}
                {renderDocumentRow('CV', 'CV')}
                {renderDocumentRow('Attestation de scolarité', 'AttestationScolarite')}
                {renderDocumentRow('Lettre de recommandation', 'LettreRecommandation')}
                {renderDocumentRow('Copie CIN', 'CIN')}
                {renderDocumentRow('Assurance', 'Assurance')}
                {renderDocumentRow('Fiche de demande de stage', 'FicheEngagement')}
                
                <UploadSeparator />
            </UploadContainer>

            <Box sx={{ 
                mt: 2, 
                p: 2, 
                backgroundColor: '#f0f7fa', 
                borderRadius: '6px',
                border: '1px solid #d1e5ed'
            }}>
                <Typography variant="caption" color="#1a2332" sx={{ display: 'block', fontSize: '11px' }}>
                    <strong>Formats acceptés :</strong> PDF, JPG, PNG
                </Typography>
                <Typography variant="caption" color="#1a2332" sx={{ display: 'block', fontSize: '11px' }}>
                    <strong>Taille maximale :</strong> 5 Mo par document
                </Typography>
            </Box>

            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                mt: 4, 
                pt: 2, 
                borderTop: '1px solid #e5e7eb' 
            }}>
                <PrevButton onClick={handlePrev}>&lt;&lt; Précédent</PrevButton>
                <ValidateButton onClick={handleNext} disabled={saving}>
                    {saving ? <CircularProgress size={24} color="inherit" /> : 'Valider'}
                </ValidateButton>
            </Box>
        </StepCardWide>
    );

    // ============================================
    // RENDER PRINCIPAL
    // ============================================

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <CircularProgress size={44} sx={{ color: '#148aa0' }} />
            </Box>
        );
    }

    if (!offerId && !id) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Paper sx={{ p: 4, borderRadius: '16px', textAlign: 'center', backgroundColor: '#f7f7f7' }}>
                    <Typography variant="h6" sx={{ color: '#1a2332', mb: 2 }}>
                        Aucune offre sélectionnée
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Veuillez retourner à la liste des offres et sélectionner une offre.
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={() => navigate('/offres')}
                        sx={{
                            backgroundColor: '#148aa0',
                            borderRadius: '10px',
                            textTransform: 'none',
                            '&:hover': { backgroundColor: '#0b7890' }
                        }}
                    >
                        Voir les offres disponibles
                    </Button>
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg">
            <PageContainer>
                <PageTitle>
                    Candidature à : {offerTitle || 'Offre de stage'}
                </PageTitle>

                <TitleDivider />

                <WorkflowContainer>
                    <StepCircle active={etapeActuelle >= 1} />
                    <StepLine active={etapeActuelle > 1} />
                    <StepCircle active={etapeActuelle >= 2} />
                    <StepLine active={etapeActuelle > 2} />
                    <StepCircle active={etapeActuelle >= 3} />
                </WorkflowContainer>

                {error && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 3, borderRadius: '10px' }}>
                        {success}
                    </Alert>
                )}

                {etapeActuelle === 1 && renderEtape1()}
                {etapeActuelle === 2 && renderEtape2()}
                {etapeActuelle === 3 && renderEtape3()}
            </PageContainer>
        </Container>
    );
};

export default DepotCandidature;