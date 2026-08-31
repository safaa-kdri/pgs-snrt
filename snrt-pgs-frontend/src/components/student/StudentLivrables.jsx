// src/components/student/StudentLivrables.jsx
// ✅ VERSION ULTRA-SIMPLE - UN SEUL LIVRABLE (RAPPORT)

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Alert,
    CircularProgress,
    Chip,
    Paper,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    CloudUpload,
    CheckCircle,
    Pending,
    Cancel,
    Download,
    PictureAsPdf,
} from '@mui/icons-material';
import { getLivrables, uploadLivrable } from '../../services/api';

// ============================================
// STYLES
// ============================================

const Container = styled(Box)({
    maxWidth: '100%',
});

const SectionTitle = styled(Typography)({
    fontWeight: 600,
    fontSize: '16px',
    color: '#0f172a',
    marginBottom: '16px',
});

const Card = styled(Paper)({
    padding: '24px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    boxShadow: 'none',
    backgroundColor: '#fafbfc',
    textAlign: 'center',
});

const EmptyIcon = styled(Box)({
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '12px',
    color: '#94a3b8',
});

const EmptyTitle = styled(Typography)({
    fontSize: '15px',
    fontWeight: 500,
    color: '#0f172a',
    marginBottom: '4px',
});

const EmptySubtitle = styled(Typography)({
    fontSize: '13px',
    color: '#94a3b8',
    marginBottom: '16px',
});

const FileInfo = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '12px 16px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    marginBottom: '12px',
});

const FileDetails = styled(Box)({
    flex: 1,
    textAlign: 'left',
});

const FileName = styled(Typography)({
    fontSize: '14px',
    fontWeight: 500,
    color: '#0f172a',
});

const FileMeta = styled(Typography)({
    fontSize: '12px',
    color: '#94a3b8',
});

const StatusBadge = styled(Chip)(({ status }) => {
    const colors = {
        Valide: { bg: '#dcfce7', text: '#166534' },
        EnAttente: { bg: '#fef3c7', text: '#a16207' },
        Rejete: { bg: '#fee2e2', text: '#991b1b' },
    };
    const color = colors[status] || colors.EnAttente;
    return {
        backgroundColor: color.bg,
        color: color.text,
        fontWeight: 600,
        fontSize: '11px',
        height: '24px',
        borderRadius: '999px',
        '& .MuiChip-label': { padding: '0 12px' },
    };
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const StudentLivrables = ({ internshipId, user }) => {
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [livrables, setLivrables] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileInputKey, setFileInputKey] = useState(Date.now());

    const REPORT_TYPE = 'Rapport';

    useEffect(() => {
        fetchLivrables();
    }, [internshipId]);

    const fetchLivrables = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getLivrables(internshipId);
            const onlyReports = (data || []).filter((item) => !item.type || item.type === REPORT_TYPE);
            setLivrables(onlyReports);
        } catch (error) {
            console.error('Erreur chargement livrables:', error);
            setError('Erreur lors du chargement du rapport de stage');
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            setError('Seuls les fichiers PDF sont acceptés');
            event.target.value = '';
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setError('Le fichier ne doit pas dépasser 10 Mo');
            event.target.value = '';
            return;
        }

        setSelectedFile(file);
        setError('');
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Veuillez sélectionner un fichier');
            return;
        }

        setUploading(true);
        setError('');
        setSuccess('');

        try {
            const result = await uploadLivrable(internshipId, selectedFile, REPORT_TYPE);
            if (result) {
                setSuccess('Rapport de stage déposé avec succès.');
                setSelectedFile(null);
                setFileInputKey(Date.now());
                await fetchLivrables();
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (error) {
            console.error('Erreur dépôt livrable:', error);
            setError(error.response?.data?.message || 'Erreur lors du dépôt du rapport');
        } finally {
            setUploading(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const getStatusLabel = (livrable) => {
        if (livrable.valide === true) return 'Valide';
        if (livrable.statut === 'Rejete') return 'Rejete';
        return 'EnAttente';
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={28} sx={{ color: '#0f766e' }} />
            </Box>
        );
    }

    const hasRapport = livrables.length > 0;
    const rapport = hasRapport ? livrables[0] : null;
    const status = rapport ? getStatusLabel(rapport) : 'EnAttente';

    return (
        <Container>
            {/* ===== TITRE ===== */}
            <SectionTitle>Rapport de stage</SectionTitle>

            {/* ===== ALERTS ===== */}
            {error && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}
            {success && (
                <Alert severity="success" sx={{ mb: 2, borderRadius: '8px' }} onClose={() => setSuccess('')}>
                    {success}
                </Alert>
            )}

            {/* ===== CARD ===== */}
            <Card>
                {!hasRapport ? (
                    /* ===== ÉTAT VIDE ===== */
                    <Box>
                        <EmptyIcon>
                            <PictureAsPdf sx={{ fontSize: 48 }} />
                        </EmptyIcon>
                        <EmptyTitle>Rapport de stage</EmptyTitle>
                        <EmptySubtitle>Aucun document déposé</EmptySubtitle>

                        <Typography variant="body2" color="#94a3b8" sx={{ mb: 2 }}>
                            PDF uniquement · 10 MB maximum
                        </Typography>

                        <Button
                            variant="outlined"
                            startIcon={<CloudUpload />}
                            onClick={() => document.getElementById('livrable-file-input')?.click()}
                            sx={{
                                borderRadius: '8px',
                                textTransform: 'none',
                                borderColor: '#cbd5e1',
                                color: '#0f172a',
                                fontWeight: 500,
                                '&:hover': { borderColor: '#0f766e', backgroundColor: '#f0fdfa' },
                            }}
                        >
                            {selectedFile ? selectedFile.name : 'Sélectionner le PDF'}
                        </Button>

                        <input
                            key={fileInputKey}
                            id="livrable-file-input"
                            type="file"
                            accept=".pdf"
                            hidden
                            onChange={handleFileSelect}
                        />

                        {selectedFile && (
                            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                                <Typography variant="body2" color="#0f172a" sx={{ fontWeight: 500 }}>
                                    {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                                </Typography>
                                <Button
                                    variant="contained"
                                    onClick={handleUpload}
                                    disabled={uploading}
                                    sx={{
                                        backgroundColor: '#0f766e',
                                        borderRadius: '8px',
                                        textTransform: 'none',
                                        fontWeight: 500,
                                        '&:hover': { backgroundColor: '#115e59' },
                                    }}
                                >
                                    {uploading ? <CircularProgress size={20} color="inherit" /> : 'Déposer'}
                                </Button>
                            </Box>
                        )}
                    </Box>
                ) : (
                    /* ===== RAPPORT DÉPOSÉ ===== */
                    <Box>
                        <FileInfo>
                            <PictureAsPdf sx={{ color: '#ef4444', fontSize: 32 }} />
                            <FileDetails>
                                <FileName>{rapport.nom || 'Rapport_Stage.pdf'}</FileName>
                                <FileMeta>
                                    {rapport.taille ? `${(rapport.taille / 1024 / 1024).toFixed(1)} MB` : ''}
                                    {rapport.dateDepot && ` • Déposé le ${formatDate(rapport.dateDepot)}`}
                                </FileMeta>
                            </FileDetails>
                            <StatusBadge label={status} status={status} />
                        </FileInfo>

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                            <Button
                                variant="outlined"
                                startIcon={<Download />}
                                onClick={() => alert('Téléchargement du rapport...')}
                                sx={{
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    borderColor: '#cbd5e1',
                                    color: '#475569',
                                    fontWeight: 500,
                                }}
                            >
                                Télécharger
                            </Button>
                        </Box>
                    </Box>
                )}
            </Card>
        </Container>
    );
};

export default StudentLivrables;