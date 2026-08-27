// src/components/student/StudentLivrables.jsx
// ✅ CORRIGÉ : Dépôt de livrables avec nom automatique
// ✅ Gestion : Dépôt, liste, statut des livrables

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
// TYPES DE LIVRABLES
// ============================================

const TYPES_LIVRABLES = [
    { value: 'Rapport', label: '📄 Rapport de stage' },
    { value: 'Presentation', label: '🎯 Présentation' },
    { value: 'Autre', label: '📎 Autre document' },
];

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
    const [selectedType, setSelectedType] = useState('');
    const [fileInputKey, setFileInputKey] = useState(Date.now()); // Pour reset input

    useEffect(() => {
        fetchLivrables();
    }, [internshipId]);

    const fetchLivrables = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getLivrables(internshipId);
            setLivrables(data || []);
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

        // ✅ Vérifier le type de fichier
        if (file.type !== 'application/pdf') {
            setError('Seuls les fichiers PDF sont acceptés');
            event.target.value = '';
            return;
        }

        // ✅ Vérifier la taille (max 10 Mo)
        if (file.size > 10 * 1024 * 1024) {
            setError('Le fichier ne doit pas dépasser 10 Mo');
            event.target.value = '';
            return;
        }

        setSelectedFile(file);
        setError('');
    };

    const handleUpload = async () => {
        // ✅ Vérifier qu'un fichier est sélectionné
        if (!selectedFile) {
            setError('Veuillez sélectionner un fichier');
            return;
        }

        // ✅ Vérifier que le type est sélectionné
        if (!selectedType) {
            setError('Veuillez sélectionner un type de livrable');
            return;
        }

        setUploading(true);
        setError('');
        setSuccess('');

        try {
            // ✅ Créer le FormData avec le fichier et le type
            const formData = new FormData();
            formData.append('livrable', selectedFile);
            formData.append('type', selectedType);
            // ✅ Le nom et le chemin seront gérés par le backend

            const result = await uploadLivrable(internshipId, selectedFile, selectedType);

            if (result) {
                setSuccess(`✅ ${selectedType} déposé avec succès !`);
                
                // ✅ Réinitialiser le formulaire
                setSelectedFile(null);
                setSelectedType('');
                setFileInputKey(Date.now()); // Reset input file
                
                // ✅ Recharger la liste
                await fetchLivrables();
                
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (error) {
            console.error('❌ Erreur dépôt livrable:', error);
            setError(error.response?.data?.message || 'Erreur lors du dépôt du livrable');
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

    const getStatusIcon = (status) => {
        if (status === 'Valide') return <CheckCircle sx={{ fontSize: 16, color: '#22c55e' }} />;
        if (status === 'Rejete') return <Cancel sx={{ fontSize: 16, color: '#ef4444' }} />;
        return <Pending sx={{ fontSize: 16, color: '#f59e0b' }} />;
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
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Déposez vos livrables (rapport, présentation, etc.) au format PDF.
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

            {/* ============================================
                ZONE DE DÉPÔT
                ============================================ */}
            <Paper sx={{ p: 3, mb: 3, backgroundColor: '#fafbfc', borderRadius: '12px', border: '1px solid #eef1f3' }}>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                    Déposer un nouveau livrable
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    {/* ✅ Sélecteur de type */}
                    <Box sx={{ minWidth: '200px' }}>
                        <select
                            value={selectedType}
                            onChange={(e) => {
                                setSelectedType(e.target.value);
                                setError('');
                            }}
                            style={{
                                width: '100%',
                                padding: '10px 16px',
                                borderRadius: '8px',
                                border: '1px solid #d1d5db',
                                fontSize: '14px',
                                fontFamily: 'Inter, sans-serif',
                                backgroundColor: '#fff',
                                color: selectedType ? '#1a2332' : '#6b7a8a',
                                cursor: 'pointer',
                            }}
                        >
                            <option value="">Type de livrable *</option>
                            {TYPES_LIVRABLES.map((t) => (
                                <option key={t.value} value={t.value}>
                                    {t.label}
                                </option>
                            ))}
                        </select>
                    </Box>

                    {/* ✅ Zone de drop / sélection de fichier */}
                    <DropZone
                        onClick={() => document.getElementById('livrable-file-input')?.click()}
                        sx={{ flex: 1, padding: '16px 20px' }}
                    >
                        <input
                            key={fileInputKey}
                            id="livrable-file-input"
                            type="file"
                            accept=".pdf"
                            hidden
                            onChange={handleFileSelect}
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                            <CloudUpload sx={{ color: selectedFile ? '#148aa0' : '#9aa4ac', fontSize: 24 }} />
                            <Box>
                                <Typography variant="body2" sx={{ fontWeight: selectedFile ? 500 : 400 }}>
                                    {selectedFile ? `📄 ${selectedFile.name}` : 'Cliquez pour sélectionner un fichier PDF'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Max 10 Mo • PDF uniquement
                                </Typography>
                            </Box>
                        </Box>
                    </DropZone>

                    {/* ✅ Bouton Déposer */}
                    <Button
                        variant="contained"
                        onClick={handleUpload}
                        disabled={uploading || !selectedFile || !selectedType}
                        sx={{
                            backgroundColor: '#148aa0',
                            borderRadius: '8px',
                            textTransform: 'none',
                            padding: '10px 32px',
                            fontWeight: 500,
                            minWidth: '120px',
                            '&:hover': { backgroundColor: '#0b7890' },
                            '&:disabled': { backgroundColor: '#a0c4cd' },
                        }}
                    >
                        {uploading ? (
                            <CircularProgress size={22} color="inherit" />
                        ) : (
                            'Déposer'
                        )}
                    </Button>
                </Box>

                {/* ✅ Résumé du fichier sélectionné */}
                {selectedFile && (
                    <Box sx={{ mt: 2, p: 2, backgroundColor: '#e8f4f8', borderRadius: '8px' }}>
                        <Typography variant="body2" color="#0b7890">
                            <strong>Fichier prêt :</strong> {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} Mo)
                        </Typography>
                        <Typography variant="caption" color="#0b7890">
                            Type sélectionné : {TYPES_LIVRABLES.find(t => t.value === selectedType)?.label || selectedType}
                        </Typography>
                    </Box>
                )}
            </Paper>

            {/* ============================================
                LISTE DES LIVRABLES
                ============================================ */}
            {livrables.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                        Aucun livrable déposé
                    </Typography>
                </Box>
            ) : (
                <TableContainer 
                    component={Paper} 
                    sx={{ 
                        borderRadius: '12px', 
                        boxShadow: 'none', 
                        border: '1px solid #eef1f3',
                        overflow: 'hidden',
                    }}
                >
                    <Table>
                        <TableHead sx={{ backgroundColor: '#f7f7f7' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600, fontSize: '13px' }}>Nom</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: '13px' }}>Type</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: '13px' }}>Date dépôt</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: '13px' }}>Statut</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: '13px', textAlign: 'center' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {livrables.map((livrable) => {
                                const status = getStatusLabel(livrable);
                                return (
                                    <TableRow key={livrable._id} hover>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={500}>
                                                {livrable.nom || 'Sans nom'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={livrable.type || 'Autre'}
                                                size="small"
                                                sx={{ 
                                                    backgroundColor: '#e0e7ff', 
                                                    color: '#4338ca',
                                                    fontWeight: 500,
                                                    fontSize: '11px',
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {formatDate(livrable.dateDepot)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {getStatusIcon(status)}
                                                <StatusChip
                                                    label={status}
                                                    status={status}
                                                    size="small"
                                                />
                                            </Box>
                                            {livrable.commentaire && (
                                                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                                                    {livrable.commentaire}
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Télécharger">
                                                <IconButton 
                                                    size="small" 
                                                    sx={{ 
                                                        color: '#4f46e5',
                                                        '&:hover': { backgroundColor: 'rgba(79, 70, 229, 0.08)' },
                                                    }}
                                                    onClick={() => {
                                                        // Fonction de téléchargement à implémenter
                                                        alert('Téléchargement du livrable...');
                                                    }}
                                                >
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