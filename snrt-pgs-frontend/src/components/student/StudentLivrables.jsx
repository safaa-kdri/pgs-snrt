// src/components/student/StudentLivrables.jsx
// ✅ Composant : Gestion des livrables (dépôt, suivi validation)

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Alert,
    CircularProgress,
    Divider,
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
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    CloudUpload,
    CheckCircle,
    Pending,
    Cancel,
    Download,
    Visibility,
    Delete,
} from '@mui/icons-material';
import { getLivrables, uploadLivrable } from '../../services/api';

// ============================================
// STYLES
// ============================================

const DropZone = styled(Box)({
    border: '2px dashed #d1d5db',
    borderRadius: '12px',
    padding: '24px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backgroundColor: '#fafafa',
    '&:hover': {
        borderColor: '#148aa0',
        backgroundColor: '#f0f7fa',
    },
});

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

const StudentLivrables = ({ internshipId, user }) => {
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [livrables, setLivrables] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedType, setSelectedType] = useState('');

    const TYPES_LIVRABLES = [
        { value: 'Rapport', label: '📄 Rapport de stage' },
        { value: 'Presentation', label: '🎯 Présentation' },
        { value: 'Autre', label: '📎 Autre document' },
    ];

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

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        if (file.type !== 'application/pdf') {
            setError('Seuls les fichiers PDF sont acceptés');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            setError('Le fichier ne doit pas dépasser 10 Mo');
            return;
        }
        setSelectedFile(file);
        setError('');
        // Afficher le type de livrable
        const typeSelect = document.getElementById('livrable-type-select');
        if (typeSelect) {
            setSelectedType(typeSelect.value);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Veuillez sélectionner un fichier');
            return;
        }
        if (!selectedType) {
            setError('Veuillez sélectionner un type de livrable');
            return;
        }

        setUploading(true);
        setError('');
        try {
            const result = await uploadLivrable(internshipId, selectedFile, selectedType);
            if (result) {
                setSuccess(`✅ ${selectedType} déposé avec succès !`);
                setSelectedFile(null);
                setSelectedType('');
                document.getElementById('livrable-file-input').value = '';
                await fetchLivrables();
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (error) {
            console.error('❌ Erreur dépôt livrable:', error);
            setError(error.response?.data?.message || 'Erreur lors du dépôt');
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
                <CircularProgress size={32} sx={{ color: '#148aa0' }} />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#1a2332' }}>
                📎 Livrables
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

            {/* Zone de dépôt */}
            <Paper sx={{ p: 3, mb: 3, backgroundColor: '#fafbfc', borderRadius: '12px' }}>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                    Déposer un livrable
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <select
                        id="livrable-type-select"
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: '1px solid #d1d5db',
                            fontSize: '14px',
                            fontFamily: 'Inter, sans-serif',
                            backgroundColor: '#fff',
                            minWidth: '180px',
                        }}
                    >
                        <option value="">Type de livrable *</option>
                        {TYPES_LIVRABLES.map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                    </select>
                    <DropZone
                        onClick={() => document.getElementById('livrable-file-input')?.click()}
                        sx={{ flex: 1, padding: '16px' }}
                    >
                        <input
                            id="livrable-file-input"
                            type="file"
                            accept=".pdf"
                            hidden
                            onChange={handleFileSelect}
                        />
                        <Typography variant="body2">
                            {selectedFile ? `📄 ${selectedFile.name}` : 'Cliquez pour sélectionner un fichier PDF'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Max 10 Mo • PDF uniquement
                        </Typography>
                    </DropZone>
                    <Button
                        variant="contained"
                        onClick={handleUpload}
                        disabled={uploading || !selectedFile || !selectedType}
                        sx={{
                            backgroundColor: '#148aa0',
                            borderRadius: '8px',
                            textTransform: 'none',
                            '&:hover': { backgroundColor: '#0b7890' },
                        }}
                    >
                        {uploading ? <CircularProgress size={20} color="inherit" /> : 'Déposer'}
                    </Button>
                </Box>
            </Paper>

            {/* Liste des livrables */}
            {livrables.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    Aucun livrable déposé
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
                                            <StatusChip
                                                label={status}
                                                status={status}
                                                size="small"
                                            />
                                            {livrable.commentaire && (
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    {livrable.commentaire}
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Télécharger">
                                                <IconButton size="small" sx={{ color: '#4f46e5' }}>
                                                    <Download fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
};

export default StudentLivrables;