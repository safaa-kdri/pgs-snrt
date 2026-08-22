// src/components/supervisor/SupervisorLivrables.jsx
// ✅ Composant : Validation des livrables pour l'encadrant

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Alert,
    CircularProgress,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    Download,
    ThumbUp,
    ThumbDown,
    Visibility,
} from '@mui/icons-material';
import { getLivrables, validateLivrable } from '../../services/api';

// ============================================
// STYLES
// ============================================

const StatusChip = styled(Chip)(({ status }) => {
    const colors = {
        'Valide': { bg: '#d1fae5', text: '#065f46' },
        'EnAttente': { bg: '#fef3c7', text: '#d97706' },
        'Rejete': { bg: '#fee2e2', text: '#991b1b' },
    };
    const color = colors[status] || colors['EnAttente'];
    return {
        backgroundColor: color.bg,
        color: color.text,
        fontWeight: 500,
        fontSize: '11px',
        height: '24px',
    };
});

// ============================================
// COMPOSANT
// ============================================

const SupervisorLivrables = ({ internshipId, user }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [livrables, setLivrables] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedLivrable, setSelectedLivrable] = useState(null);
    const [decision, setDecision] = useState('');
    const [commentaire, setCommentaire] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchLivrables();
    }, [internshipId]);

    const fetchLivrables = async () => {
        setLoading(true);
        try {
            const data = await getLivrables(internshipId);
            setLivrables(data);
        } catch (error) {
            console.error('❌ Erreur chargement livrables:', error);
            setError('Erreur lors du chargement des livrables');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (livrable, decision) => {
        setSelectedLivrable(livrable);
        setDecision(decision);
        setCommentaire('');
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedLivrable(null);
        setCommentaire('');
        setDecision('');
    };

    const handleValidate = async () => {
        if (!selectedLivrable) return;
        if (decision === 'Rejete' && !commentaire.trim()) {
            setError('Veuillez expliquer le motif du rejet');
            return;
        }

        setSubmitting(true);
        setError('');
        try {
            const result = await validateLivrable(
                internshipId,
                selectedLivrable._id,
                decision === 'Valide',
                commentaire
            );
            if (result) {
                setSuccess(`✅ Livrable ${decision === 'Valide' ? 'validé' : 'rejeté'} avec succès`);
                handleCloseDialog();
                await fetchLivrables();
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (error) {
            console.error('❌ Erreur validation:', error);
            setError(error.response?.data?.message || 'Erreur lors de la validation');
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
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
                <CircularProgress size={32} sx={{ color: '#2d3748' }} />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#1a2332' }}>
                📎 Livrables du stagiaire
            </Typography>

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

            {livrables.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    Aucun livrable déposé par le stagiaire
                </Typography>
            ) : (
                <TableContainer component={Paper} sx={{ borderRadius: '12px', boxShadow: 'none', border: '1px solid #eef1f3' }}>
                    <Table>
                        <TableHead sx={{ backgroundColor: '#f7f7f7' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Nom</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Date dépôt</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
                                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {livrables.map((livrable) => {
                                const status = getStatusLabel(livrable);
                                const isPending = status === 'EnAttente';
                                return (
                                    <TableRow key={livrable._id}>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={500}>
                                                {livrable.nom || 'Sans nom'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={livrable.type || 'Autre'}
                                                size="small"
                                                sx={{ backgroundColor: '#e0e7ff', color: '#4338ca' }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {formatDate(livrable.dateDepot)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <StatusChip label={status} status={status} size="small" />
                                            {livrable.commentaire && (
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    {livrable.commentaire}
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                                                <Tooltip title="Télécharger">
                                                    <IconButton size="small" sx={{ color: '#4f46e5' }}>
                                                        <Download fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                {isPending && (
                                                    <>
                                                        <Tooltip title="Valider">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleOpenDialog(livrable, 'Valide')}
                                                                sx={{ color: '#22c55e' }}
                                                            >
                                                                <ThumbUp fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Rejeter">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleOpenDialog(livrable, 'Rejete')}
                                                                sx={{ color: '#ef4444' }}
                                                            >
                                                                <ThumbDown fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </>
                                                )}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Dialog validation */}
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: '16px', padding: '8px' } }}
            >
                <DialogTitle>
                    {decision === 'Valide' ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ThumbUp sx={{ color: '#22c55e' }} /> Valider le livrable
                        </Box>
                    ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ThumbDown sx={{ color: '#ef4444' }} /> Rejeter le livrable
                        </Box>
                    )}
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        {decision === 'Valide'
                            ? `Êtes-vous sûr de vouloir valider le livrable "${selectedLivrable?.nom}" ?`
                            : `Êtes-vous sûr de vouloir rejeter le livrable "${selectedLivrable?.nom}" ?`}
                    </Typography>
                    {decision === 'Rejete' && (
                        <TextField
                            label="Motif du rejet *"
                            value={commentaire}
                            onChange={(e) => setCommentaire(e.target.value)}
                            fullWidth
                            multiline
                            rows={3}
                            placeholder="Expliquez la raison du rejet..."
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                        />
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button onClick={handleCloseDialog} sx={{ borderRadius: '10px', textTransform: 'none' }}>
                        Annuler
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleValidate}
                        disabled={submitting || (decision === 'Rejete' && !commentaire.trim())}
                        sx={{
                            backgroundColor: decision === 'Valide' ? '#22c55e' : '#ef4444',
                            borderRadius: '10px',
                            textTransform: 'none',
                            '&:hover': {
                                backgroundColor: decision === 'Valide' ? '#16a34a' : '#dc2626',
                            },
                        }}
                    >
                        {submitting ? <CircularProgress size={20} color="inherit" /> : 'Confirmer'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default SupervisorLivrables;