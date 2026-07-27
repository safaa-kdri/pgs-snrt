// src/components/supervisor/InternDetail.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Container,
    Paper,
    Typography,
    Grid,
    Avatar,
    Chip,
    Button,
    Card,
    CardContent,
    Divider,
    LinearProgress,
    CircularProgress,
    Alert,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    IconButton,
    Tooltip,
} from '@mui/material';
import {
    ArrowBack,
    Person,
    Email,
    Phone,
    School,
    Work,
    CalendarToday,
    Assessment,
    Description,
    CheckCircle,
    Pending,
    Cancel,
    Edit,
    Download,
    TrendingUp,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../../hooks/useAuth';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// ============================================
// STYLES
// ============================================

const DetailCard = styled(Paper)({
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    marginBottom: '24px',
});

const SectionTitle = styled(Typography)({
    fontSize: '16px',
    fontWeight: 600,
    color: '#1a2332',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
});

const StatusChip = styled(Chip)(({ status }) => {
    const colors = {
        active: { bg: '#d1fae5', text: '#065f46' },
        pending: { bg: '#fef3c7', text: '#d97706' },
        completed: { bg: '#dbeafe', text: '#1d4ed8' },
        cancelled: { bg: '#fee2e2', text: '#991b1b' },
    };
    const color = colors[status] || colors.pending;
    return {
        backgroundColor: color.bg,
        color: color.text,
        fontWeight: 600,
        fontSize: '13px',
        height: '32px',
        padding: '0 16px',
    };
});

const InfoItem = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 0',
    '& .MuiSvgIcon-root': {
        color: '#148aa0',
        fontSize: '20px',
    },
});

const ActivityItem = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '12px 0',
    borderBottom: '1px solid #f0f2f5',
    '&:last-child': {
        borderBottom: 'none',
    },
});

const ActivityIcon = styled(Box)({
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#e8f0fe',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    flexShrink: 0,
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const InternDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [intern, setIntern] = useState(null);
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        fetchInternDetail();
    }, [id]);

    const fetchInternDetail = async () => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 600));

            const mockIntern = {
                id: id || '1',
                nom: 'EL HASSANI',
                prenom: 'Youssef',
                email: 'youssef@test.ma',
                telephone: '0612345987',
                cin: 'AB123456',
                universite: 'Université Mohammed V',
                filiere: 'Informatique',
                niveau: 'Master 2',
                stage: 'Stage Développement Web',
                department: 'DSI',
                encadrant: 'Mohamed CHERKAOUI',
                progress: 75,
                status: 'active',
                startDate: '2026-06-01',
                endDate: '2026-08-31',
                evaluation: {
                    note: null,
                    status: 'pending',
                    competences: [
                        { nom: 'JavaScript', niveau: 'Intermédiaire', note: null },
                        { nom: 'React', niveau: 'Débutant', note: null },
                        { nom: 'Node.js', niveau: 'Débutant', note: null },
                    ],
                },
                livrables: [
                    { nom: 'Rapport intermédiaire', date: '2026-07-15', valide: true },
                    { nom: 'Présentation', date: null, valide: false },
                    { nom: 'Rapport final', date: null, valide: false },
                ],
                remarques: [
                    { date: '2026-07-01', message: 'Bienvenue dans l\'équipe !', auteur: 'Mohamed CHERKAOUI' },
                    { date: '2026-07-15', message: 'Bon travail sur le sprint 1', auteur: 'Mohamed CHERKAOUI' },
                ],
            };

            setIntern(mockIntern);

            // Activités simulées
            setActivities([
                { date: '2026-07-15', action: 'Rapport intermédiaire déposé', icon: '📄' },
                { date: '2026-07-10', action: 'Sprint 1 terminé', icon: '✅' },
                { date: '2026-07-01', action: 'Début du stage', icon: '🚀' },
                { date: '2026-06-25', action: 'Convention signée', icon: '📝' },
            ]);

        } catch (error) {
            console.error('Erreur chargement stagiaire:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'active': return 'En cours';
            case 'pending': return 'En attente';
            case 'completed': return 'Terminé';
            case 'cancelled': return 'Annulé';
            default: return 'Inconnu';
        }
    };

    const getProgressColor = (progress) => {
        if (progress >= 80) return '#22c55e';
        if (progress >= 50) return '#f59e0b';
        return '#ef4444';
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Non défini';
        return format(new Date(dateStr), 'dd MMM yyyy', { locale: fr });
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <CircularProgress size={60} thickness={4} sx={{ color: '#148aa0' }} />
            </Box>
        );
    }

    if (!intern) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error" sx={{ borderRadius: '12px' }}>
                    Stagiaire non trouvé
                </Alert>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/supervisor/interns')}
                    sx={{ mt: 2 }}
                >
                    Retour à la liste
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* ===== EN-TÊTE ===== */}
            <Box sx={{ mb: 3 }}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/supervisor/interns')}
                    sx={{ mb: 2, textTransform: 'none', color: '#666' }}
                >
                    Retour à la liste
                </Button>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Avatar
                            sx={{
                                width: 80,
                                height: 80,
                                backgroundColor: '#148aa0',
                                fontSize: 32,
                                fontWeight: 700,
                                color: '#fff',
                            }}
                        >
                            {intern.prenom[0]}{intern.nom[0]}
                        </Avatar>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a2332' }}>
                                {intern.prenom} {intern.nom}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {intern.stage} - {intern.department}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                <StatusChip label={getStatusLabel(intern.status)} status={intern.status} />
                                <Chip
                                    label={`${intern.progress}%`}
                                    sx={{
                                        backgroundColor: getProgressColor(intern.progress) + '20',
                                        color: getProgressColor(intern.progress),
                                        fontWeight: 600,
                                    }}
                                />
                            </Box>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="outlined"
                            startIcon={<Assessment />}
                            onClick={() => navigate(`/supervisor/evaluate/${intern.id}`)}
                            sx={{ borderRadius: '12px', textTransform: 'none' }}
                        >
                            Évaluer
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<Description />}
                            sx={{
                                backgroundColor: '#148aa0',
                                borderRadius: '12px',
                                textTransform: 'none',
                                '&:hover': { backgroundColor: '#0b7890' },
                            }}
                        >
                            Générer attestation
                        </Button>
                    </Box>
                </Box>
            </Box>

            {/* ===== PROGRESSION ===== */}
            <DetailCard>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                    Progression du stage
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                        {intern.progress}% complété
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {formatDate(intern.startDate)} - {formatDate(intern.endDate)}
                    </Typography>
                </Box>
                <LinearProgress
                    variant="determinate"
                    value={intern.progress}
                    sx={{
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: '#e5e7eb',
                        '& .MuiLinearProgress-bar': {
                            backgroundColor: getProgressColor(intern.progress),
                            borderRadius: 5,
                        },
                    }}
                />
            </DetailCard>

            <Grid container spacing={3}>
                {/* ===== GAUCHE : Informations ===== */}
                <Grid item xs={12} md={4}>
                    <DetailCard>
                        <SectionTitle>
                            <Person sx={{ color: '#148aa0' }} />
                            Informations personnelles
                        </SectionTitle>
                        <InfoItem>
                            <Email />
                            <Box>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Email
                                </Typography>
                                <Typography variant="body2">{intern.email}</Typography>
                            </Box>
                        </InfoItem>
                        <InfoItem>
                            <Phone />
                            <Box>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Téléphone
                                </Typography>
                                <Typography variant="body2">{intern.telephone}</Typography>
                            </Box>
                        </InfoItem>
                        <InfoItem>
                            <School />
                            <Box>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Université
                                </Typography>
                                <Typography variant="body2">{intern.universite}</Typography>
                            </Box>
                        </InfoItem>
                        <InfoItem>
                            <Work />
                            <Box>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Filière / Niveau
                                </Typography>
                                <Typography variant="body2">{intern.filiere} - {intern.niveau}</Typography>
                            </Box>
                        </InfoItem>
                        <InfoItem>
                            <CalendarToday />
                            <Box>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Période
                                </Typography>
                                <Typography variant="body2">
                                    {formatDate(intern.startDate)} au {formatDate(intern.endDate)}
                                </Typography>
                            </Box>
                        </InfoItem>
                    </DetailCard>

                    {/* ===== Encadrant ===== */}
                    <DetailCard>
                        <SectionTitle>
                            <Person sx={{ color: '#4f46e5' }} />
                            Encadrant
                        </SectionTitle>
                        <InfoItem>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#4f46e5', fontSize: 14, color: '#fff' }}>
                                MC
                            </Avatar>
                            <Box>
                                <Typography variant="body2" fontWeight={500}>
                                    {intern.encadrant}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Tuteur de stage
                                </Typography>
                            </Box>
                        </InfoItem>
                    </DetailCard>
                </Grid>

                {/* ===== DROITE : Détails ===== */}
                <Grid item xs={12} md={8}>
                    {/* ===== Évaluation ===== */}
                    <DetailCard>
                        <SectionTitle>
                            <Assessment sx={{ color: '#f59e0b' }} />
                            Évaluation
                        </SectionTitle>
                        {intern.evaluation.status === 'done' ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Note finale
                                    </Typography>
                                    <Typography variant="h2" sx={{ fontWeight: 700, color: '#22c55e' }}>
                                        {intern.evaluation.note}/20
                                    </Typography>
                                </Box>
                                <Divider orientation="vertical" flexItem />
                                <Box>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        Compétences évaluées
                                    </Typography>
                                    {intern.evaluation.competences.map((comp, idx) => (
                                        <Chip
                                            key={idx}
                                            label={`${comp.nom}: ${comp.note || 'Non évalué'}`}
                                            size="small"
                                            sx={{ m: 0.5 }}
                                        />
                                    ))}
                                </Box>
                            </Box>
                        ) : (
                            <Alert severity="warning" sx={{ borderRadius: '10px' }}>
                                Évaluation en attente. Cliquez sur "Évaluer" pour commencer.
                            </Alert>
                        )}
                    </DetailCard>

                    {/* ===== Livrables ===== */}
                    <DetailCard>
                        <SectionTitle>
                            <Description sx={{ color: '#8b5cf6' }} />
                            Livrables
                        </SectionTitle>
                        <List dense>
                            {intern.livrables.map((livrable, idx) => (
                                <ListItem key={idx} sx={{ px: 0 }}>
                                    <ListItemIcon>
                                        {livrable.valide ? (
                                            <CheckCircle sx={{ color: '#22c55e' }} />
                                        ) : (
                                            <Pending sx={{ color: '#f59e0b' }} />
                                        )}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={livrable.nom}
                                        secondary={livrable.date ? formatDate(livrable.date) : 'Non déposé'}
                                    />
                                    <Chip
                                        label={livrable.valide ? 'Validé' : 'En attente'}
                                        size="small"
                                        sx={{
                                            backgroundColor: livrable.valide ? '#d1fae5' : '#fef3c7',
                                            color: livrable.valide ? '#065f46' : '#d97706',
                                            fontWeight: 500,
                                        }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </DetailCard>

                    {/* ===== Historique (sans Timeline) ===== */}
                    <DetailCard>
                        <SectionTitle>
                            <TrendingUp sx={{ color: '#22c55e' }} />
                            Activités
                        </SectionTitle>
                        <Box>
                            {activities.map((activity, idx) => (
                                <ActivityItem key={idx}>
                                    <ActivityIcon>{activity.icon}</ActivityIcon>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="body2" fontWeight={500}>
                                            {activity.action}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {formatDate(activity.date)}
                                        </Typography>
                                    </Box>
                                </ActivityItem>
                            ))}
                        </Box>
                    </DetailCard>
                </Grid>
            </Grid>
        </Container>
    );
};

export default InternDetail;