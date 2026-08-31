// src/components/student/StudentLivrables.jsx
// ✅ VERSION FINALE - HISTORIQUE DES DÉPÔTS AVEC MOTIF DE REJET

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Alert,
    CircularProgress,
    Chip,
    Paper,
    Collapse,
    IconButton,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    CloudUpload,
    Download,
    PictureAsPdf,
    History,
    CheckCircle,
    Pending,
    Cancel,
    ErrorOutline,
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
    flexWrap: 'wrap',
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
    color: '#64748b',
});

const StatusBadge = styled(Chip)(({ status }) => {
    const colors = {
        Valide: { bg: '#d1fae5', text: '#065f46' },
        EnAttente: { bg: '#fef3c7', text: '#d97706' },
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

// ✅ MOTIF DE REJET - STYLE NEUTRE AVEC ACCENT ROUGE
const RejectionBox = styled(Box)({
    backgroundColor: '#fff7f7',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '14px 16px',
    marginTop: '8px',
    textAlign: 'left',
});

const RejectionLabel = styled(Typography)({
    fontSize: '11px',
    fontWeight: 600,
    color: '#991b1b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '5px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
});

const RejectionText = styled(Typography)({
    fontSize: '13px',
    color: '#991b1b',
    lineHeight: 1.5,
});

// ✅ PASTILLE ROUGE
const NotificationDot = styled(Box)({
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    backgroundColor: '#dc2626',
    position: 'absolute',
    top: '2px',
    right: '2px',
});

// ✅ ZONE DE DÉPÔT
const UploadZone = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    padding: '16px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px dashed #cbd5e1',
    marginTop: '16px',
    flexWrap: 'wrap',
    '&:hover': {
        borderColor: '#0f766e',
        backgroundColor: '#f0fdfa',
    },
});

const HistoryItem = styled(Box)(({ status }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 16px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    marginBottom: '8px',
    flexWrap: 'wrap',
    gap: '8px',
    borderLeft: status === 'Rejete' ? '3px solid #dc2626' : 
                status === 'Valide' ? '3px solid #16a34a' : 
                '3px solid #d97706',
}));

const HistoryFileName = styled(Typography)({
    fontSize: '13px',
    fontWeight: 500,
    color: '#0f172a',
});

const HistoryDate = styled(Typography)({
    fontSize: '12px',
    color: '#64748b',
});

const HistoryRejection = styled(Typography)({
    fontSize: '12px',
    color: '#991b1b',
    marginTop: '4px',
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
    const [showUpload, setShowUpload] = useState(false);
    const [readRejection, setReadRejection] = useState({});

    const REPORT_TYPE = 'Rapport';

    useEffect(() => {
        fetchLivrables();
        const savedRead = localStorage.getItem(`readRejection_${internshipId}`);
        if (savedRead) {
            try {
                setReadRejection(JSON.parse(savedRead));
            } catch (e) {
                setReadRejection({});
            }
        }
    }, [internshipId]);

    const fetchLivrables = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getLivrables(internshipId);
            const onlyReports = (data || []).filter((item) => !item.type || item.type === REPORT_TYPE);
            // Trier par date décroissante (le plus récent en premier)
            const sorted = onlyReports.sort((a, b) => 
                new Date(b.dateDepot) - new Date(a.dateDepot)
            );
            setLivrables(sorted);
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
                setShowUpload(false);
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
        if (livrable.valide === true || livrable.statut === 'ValideEncadrant') return 'Valide';
        if (livrable.statut === 'Rejete') return 'Rejete';
        return 'EnAttente';
    };

    const getStatusIcon = (status) => {
        if (status === 'Valide') return <CheckCircle sx={{ fontSize: 16, color: '#16a34a' }} />;
        if (status === 'Rejete') return <ErrorOutline sx={{ fontSize: 16, color: '#dc2626' }} />;
        return <Pending sx={{ fontSize: 16, color: '#d97706' }} />;
    };

    const hasUnreadRejection = (livrableId) => {
        const livrable = livrables.find(l => l._id === livrableId);
        if (!livrable) return false;
        const isRejected = livrable.statut === 'Rejete' || livrable.valide === false;
        return isRejected && livrable.commentaire && !readRejection[livrableId];
    };

    const markAsRead = (livrableId) => {
        setReadRejection(prev => {
            const updated = { ...prev, [livrableId]: true };
            localStorage.setItem(`readRejection_${internshipId}`, JSON.stringify(updated));
            return updated;
        });
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={28} sx={{ color: '#0f766e' }} />
            </Box>
        );
    }

    const hasRapport = livrables.length > 0;
    const latestRapport = hasRapport ? livrables[0] : null;
    const status = latestRapport ? getStatusLabel(latestRapport) : 'EnAttente';
    const isRejected = status === 'Rejete';
    const hasRejectionReason = latestRapport?.commentaire && isRejected;
    const showUnreadDot = latestRapport ? hasUnreadRejection(latestRapport._id) : false;

    return (
        <Container>
            <SectionTitle>Rapport de stage</SectionTitle>

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

            <Card>
                {!hasRapport ? (
                    // ===== PREMIER DÉPÔT =====
                    <Box sx={{ textAlign: 'center' }}>
                        <EmptyIcon>
                            <PictureAsPdf sx={{ fontSize: 48 }} />
                        </EmptyIcon>
                        <EmptyTitle>Rapport de stage</EmptyTitle>
                        <EmptySubtitle>Aucun document déposé</EmptySubtitle>

                        <Typography variant="body2" color="#94a3b8" sx={{ mb: 2 }}>
                            PDF uniquement · 10 MB maximum
                        </Typography>

                        <UploadZone>
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
                                <>
                                    <Typography variant="body2" color="#64748b">
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
                                </>
                            )}
                        </UploadZone>
                    </Box>
                ) : (
                    // ===== RAPPORT EXISTANT =====
                    <Box>
                        {/* === DERNIER RAPPORT === */}
                        <FileInfo>
                            <PictureAsPdf sx={{ color: '#ef4444', fontSize: 32 }} />
                            <FileDetails>
                                <FileName>{latestRapport.nom || 'Rapport_Stage.pdf'}</FileName>
                                <FileMeta>
                                    {latestRapport.taille ? `${(latestRapport.taille / 1024 / 1024).toFixed(1)} MB` : ''}
                                    {latestRapport.dateDepot && ` • Déposé le ${formatDate(latestRapport.dateDepot)}`}
                                </FileMeta>
                            </FileDetails>
                            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                                <StatusBadge label={status} status={status} />
                                {showUnreadDot && <NotificationDot />}
                            </Box>
                        </FileInfo>

                        {/* === MOTIF DE REJET === */}
                        {hasRejectionReason && (
                            <RejectionBox>
                                <RejectionLabel>
                                    <ErrorOutline sx={{ fontSize: 14 }} />
                                    Motif du rejet
                                </RejectionLabel>
                                <RejectionText>
                                    {latestRapport.commentaire}
                                </RejectionText>
                            </RejectionBox>
                        )}

                        {/* === ACTIONS === */}
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'flex-end', 
                            mt: 2,
                            gap: '12px',
                            flexWrap: 'wrap',
                        }}>
                            <Button
                                variant="outlined"
                                startIcon={<Download />}
                                onClick={() => {
                                    const href = latestRapport.gridFsId 
                                        ? `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1'}/documents/file/${latestRapport.gridFsId}`
                                        : null;
                                    if (href) window.open(href, '_blank');
                                    else setError('Impossible de télécharger ce document');
                                }}
                                sx={{
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    borderColor: '#cbd5e1',
                                    color: '#475569',
                                    fontWeight: 500,
                                    '&:hover': {
                                        borderColor: '#0f766e',
                                        color: '#0f766e',
                                        backgroundColor: '#f0fdfa',
                                    },
                                }}
                            >
                                Télécharger
                            </Button>
                        </Box>

                        {/* === REDÉPÔT UNIQUEMENT SI REJETÉ === */}
                        {isRejected && (
                            <>
                                <Divider sx={{ my: 3 }} />

                                {!showUpload ? (
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Button
                                            variant="contained"
                                            onClick={() => {
                                                setShowUpload(true);
                                                if (latestRapport) markAsRead(latestRapport._id);
                                            }}
                                            sx={{
                                                backgroundColor: '#0f766e',
                                                borderRadius: '8px',
                                                textTransform: 'none',
                                                fontWeight: 500,
                                                px: 4,
                                                '&:hover': { backgroundColor: '#115e59' },
                                            }}
                                        >
                                            Déposer une nouvelle version
                                        </Button>
                                    </Box>
                                ) : (
                                    <UploadZone>
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
                                            <>
                                                <Typography variant="body2" color="#64748b">
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
                                            </>
                                        )}
                                    </UploadZone>
                                )}
                            </>
                        )}

                        {/* === HISTORIQUE DES DÉPÔTS === */}
                        {livrables.length > 1 && (
                            <>
                                <Divider sx={{ my: 3 }} />
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <History sx={{ fontSize: 18, color: '#64748b' }} />
                                    <Typography variant="subtitle2" fontWeight={600} color="#475569">
                                        Historique des dépôts
                                    </Typography>
                                </Box>

                                {livrables.slice(1).map((item) => {
                                    const itemStatus = getStatusLabel(item);
                                    return (
                                        <HistoryItem key={item._id} status={itemStatus}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                {getStatusIcon(itemStatus)}
                                                <Box>
                                                    <HistoryFileName>
                                                        {item.nom || 'Rapport_Stage.pdf'}
                                                    </HistoryFileName>
                                                    <HistoryDate>
                                                        {formatDate(item.dateDepot)}
                                                    </HistoryDate>
                                                    {itemStatus === 'Rejete' && item.commentaire && (
                                                        <HistoryRejection>
                                                            Motif : {item.commentaire}
                                                        </HistoryRejection>
                                                    )}
                                                </Box>
                                            </Box>
                                            <StatusBadge label={itemStatus} status={itemStatus} size="small" />
                                        </HistoryItem>
                                    );
                                })}
                            </>
                        )}
                    </Box>
                )}
            </Card>
        </Container>
    );
};

export default StudentLivrables;