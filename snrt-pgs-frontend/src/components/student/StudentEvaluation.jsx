// src/components/student/StudentEvaluation.jsx
// ✅ Composant : Affichage de l'évaluation (note, compétences, commentaires)

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    Card,
    Grid,
    Rating,
    Chip,
    Divider,
    Paper,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Star, CheckCircle, Pending } from '@mui/icons-material';
import { getEvaluation } from '../../services/api';

// ============================================
// STYLES
// ============================================

const EvaluationCard = styled(Paper)({
    borderRadius: '12px',
    padding: '20px 24px',
    backgroundColor: '#f7f8fa',
    border: '1px solid #eef1f3',
    boxShadow: 'none',
});

const CompetenceItem = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #f0f2f5',
    '&:last-child': { borderBottom: 'none' },
});

// ============================================
// COMPOSANT
// ============================================

const StudentEvaluation = ({ internshipId }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [evaluation, setEvaluation] = useState(null);

    useEffect(() => {
        fetchEvaluation();
    }, [internshipId]);

    const fetchEvaluation = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getEvaluation(internshipId);
            setEvaluation(data);
        } catch (error) {
            console.error('❌ Erreur chargement évaluation:', error);
            setError('Erreur lors du chargement de l\'évaluation');
            setEvaluation(null);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getNiveauLabel = (niveau) => {
        const labels = {
            'Debutant': 'Débutant',
            'Intermediaire': 'Intermédiaire',
            'Avance': 'Avancé',
            'Expert': 'Expert',
        };
        return labels[niveau] || niveau;
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={32} sx={{ color: '#148aa0' }} />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ borderRadius: '8px' }}>
                {error}
            </Alert>
        );
    }

    if (!evaluation) {
        return (
            <Box sx={{ textAlign: 'center', py: 4, backgroundColor: '#fafafa', borderRadius: '12px' }}>
                <Pending sx={{ fontSize: 48, color: '#d1d5db', mb: 2 }} />
                <Typography variant="h6" sx={{ color: '#1a2332' }}>
                    Pas encore d'évaluation
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    L'encadrant n'a pas encore réalisé l'évaluation de ce stage.
                </Typography>
            </Box>
        );
    }

    const note = evaluation.note || 0;
    const noteSur5 = Math.round((note / 20) * 5 * 10) / 10;

    return (
        <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#1a2332' }}>
                ⭐ Évaluation du stage
            </Typography>

            <Grid container spacing={3}>
                {/* Note générale */}
                <Grid item xs={12} md={4}>
                    <EvaluationCard>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                            Note finale
                        </Typography>
                        <Typography variant="h2" sx={{ fontWeight: 700, color: '#1a2332' }}>
                            {note}/20
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                            <Rating value={Math.min(note / 4, 5)} readOnly precision={0.5} size="large" />
                            <Typography variant="caption" color="text.secondary">
                                ({noteSur5}/5)
                            </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                            Évalué le {formatDate(evaluation.dateEvaluation)}
                        </Typography>
                    </EvaluationCard>
                </Grid>

                {/* Commentaires */}
                <Grid item xs={12} md={8}>
                    <EvaluationCard>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                            Commentaires de l'encadrant
                        </Typography>
                        <Typography variant="body2">
                            {evaluation.commentaires || 'Aucun commentaire'}
                        </Typography>

                        {evaluation.pointsForts && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="caption" color="text.secondary">
                                    ✅ Points forts
                                </Typography>
                                <Typography variant="body2" color="#065f46">
                                    {evaluation.pointsForts}
                                </Typography>
                            </Box>
                        )}
                        {evaluation.pointsFaibles && (
                            <Box sx={{ mt: 1 }}>
                                <Typography variant="caption" color="text.secondary">
                                    ⚠️ Points à améliorer
                                </Typography>
                                <Typography variant="body2" color="#991b1b">
                                    {evaluation.pointsFaibles}
                                </Typography>
                            </Box>
                        )}
                        {evaluation.recommandations && (
                            <Box sx={{ mt: 1 }}>
                                <Typography variant="caption" color="text.secondary">
                                    💡 Recommandations
                                </Typography>
                                <Typography variant="body2">
                                    {evaluation.recommandations}
                                </Typography>
                            </Box>
                        )}
                    </EvaluationCard>
                </Grid>

                {/* Compétences évaluées */}
                {evaluation.competencesEvaluees && evaluation.competencesEvaluees.length > 0 && (
                    <Grid item xs={12}>
                        <EvaluationCard>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                                Compétences évaluées
                            </Typography>
                            <Grid container spacing={2}>
                                {evaluation.competencesEvaluees.map((comp, idx) => (
                                    <Grid item xs={12} sm={6} key={idx}>
                                        <CompetenceItem>
                                            <Box>
                                                <Typography variant="body2" fontWeight={500}>
                                                    {comp.nom}
                                                </Typography>
                                                <Chip
                                                    label={getNiveauLabel(comp.niveau)}
                                                    size="small"
                                                    sx={{
                                                        mt: 0.5,
                                                        backgroundColor: '#e0e7ff',
                                                        color: '#4338ca',
                                                        fontSize: '10px',
                                                        height: '20px',
                                                    }}
                                                />
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Rating value={comp.note || 0} readOnly precision={0.5} size="small" />
                                                <Typography variant="body2" fontWeight={600}>
                                                    {comp.note || 0}/5
                                                </Typography>
                                            </Box>
                                        </CompetenceItem>
                                    </Grid>
                                ))}
                            </Grid>
                        </EvaluationCard>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
};

export default StudentEvaluation;