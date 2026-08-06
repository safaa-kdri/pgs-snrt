// src/components/admin/DepartmentDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Paper,
    Typography,
    Grid,
    Chip,
    Button,
    CircularProgress,
    Alert,
    Avatar,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Divider,
    Card,
    CardContent,
    Stack,
    IconButton,
    Tooltip,
    LinearProgress,
    Skeleton,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
    ArrowBack,
    Edit,
    Business,
    Person,
    People,
    School,
    CheckCircle,
    Archive,
    Restore,
    Description,
    Email,
    Phone,
    CalendarToday,
    LocationOn,
    TrendingUp,
    Group,
    Dashboard,
    Settings,
    MoreVert,
} from '@mui/icons-material';
import api from '../../services/api';

// ============================================
// STYLES - DESIGN MODERNE ET PROFESSIONNEL
// ============================================

const PageContainer = styled(Container)({
    paddingTop: '32px',
    paddingBottom: '32px',
});

const HeaderSection = styled(Box)({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '32px',
    flexWrap: 'wrap',
    gap: '16px',
});

const HeaderLeft = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
});

// ✅ AVATAR : GRIS ANTHRACITE
const DepartmentAvatar = styled(Avatar)(({ theme, active }) => ({
    width: 80,
    height: 80,
    backgroundColor: '#2d3748', // Gris anthracite
    fontSize: '32px',
    fontWeight: 700,
    color: '#ffffff',
    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
}));

const HeaderTitle = styled(Typography)({
    fontWeight: 700,
    fontSize: '28px',
    color: '#1a2332',
    letterSpacing: '-0.5px',
});

const HeaderSubtitle = styled(Typography)({
    color: '#687480',
    fontSize: '15px',
    marginTop: '4px',
});

const ActionGroup = styled(Box)({
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
});

const ActionButton = styled(Button)(({ variant, color }) => ({
    borderRadius: '10px',
    textTransform: 'none',
    fontWeight: 600,
    padding: '8px 20px',
    fontSize: '14px',
    '& .MuiButton-startIcon': {
        marginRight: '8px',
    },
}));

// ✅ BOUTON RETOUR : GRIS ANTHRACITE
const BackButton = styled(Button)({
    borderRadius: '10px',
    textTransform: 'none',
    fontWeight: 600,
    padding: '8px 20px',
    fontSize: '14px',
    backgroundColor: '#2d3748',
    color: '#ffffff',
    '&:hover': {
        backgroundColor: '#1a2332',
    },
    '& .MuiButton-startIcon': {
        marginRight: '8px',
    },
});

const StatCard = styled(Card)(({ color }) => ({
    borderRadius: '14px',
    border: '1px solid #eef1f3',
    boxShadow: 'none',
    transition: 'all 0.25s ease',
    '&:hover': {
        boxShadow: '0 6px 24px rgba(0,0,0,0.06)',
        transform: 'translateY(-2px)',
    },
    '& .MuiCardContent-root': {
        padding: '20px 24px',
        '&:last-child': {
            paddingBottom: '20px',
        },
    },
}));

const StatIconWrapper = styled(Box)(({ color }) => ({
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    backgroundColor: alpha(color || '#148aa0', 0.12),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: color || '#148aa0',
    flexShrink: 0,
}));

const StatValue = styled(Typography)({
    fontWeight: 700,
    fontSize: '26px',
    color: '#1a2332',
    letterSpacing: '-0.5px',
});

const StatLabel = styled(Typography)({
    color: '#687480',
    fontSize: '13px',
    fontWeight: 500,
    marginTop: '2px',
});

const DetailCard = styled(Paper)({
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    border: '1px solid #eef1f3',
    marginBottom: '24px',
});

const SectionTitle = styled(Typography)({
    fontSize: '16px',
    fontWeight: 600,
    color: '#1a2332',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
});

const SectionIcon = styled(Box)(({ color }) => ({
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    backgroundColor: alpha(color || '#148aa0', 0.12),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: color || '#148aa0',
    fontSize: '16px',
}));

const InfoRow = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '10px 0',
    borderBottom: '1px solid #f0f2f5',
    '&:last-child': {
        borderBottom: 'none',
    },
});

const InfoIcon = styled(Box)(({ color }) => ({
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: alpha(color || '#148aa0', 0.08),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: color || '#148aa0',
    flexShrink: 0,
}));

const InfoLabel = styled(Typography)({
    fontSize: '12px',
    color: '#9aa4ac',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
});

const InfoValue = styled(Typography)({
    fontSize: '15px',
    color: '#1a2332',
    fontWeight: 500,
});

const StatusBadge = styled(Chip)(({ status }) => ({
    borderRadius: '20px',
    padding: '0 16px',
    height: '28px',
    fontWeight: 600,
    fontSize: '13px',
    backgroundColor: status === 'active' ? '#d1fae5' : '#fee2e2',
    color: status === 'active' ? '#065f46' : '#991b1b',
    '& .MuiChip-icon': {
        fontSize: '16px',
    },
}));

// ✅ AVATAR MEMBRE : GRIS ANTHRACITE
const MemberAvatar = styled(Avatar)({
    backgroundColor: '#2d3748',
    color: '#ffffff',
    width: 36,
    height: 36,
    fontSize: 14,
    fontWeight: 600,
});

const MemberItem = styled(ListItem)({
    padding: '12px 0',
    borderBottom: '1px solid #f0f2f5',
    '&:last-child': {
        borderBottom: 'none',
    },
    '&:hover': {
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        paddingLeft: '8px',
        paddingRight: '8px',
    },
});

const LoadingSkeleton = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const DepartmentDetailPage = () => {
    const navigate = useNavigate();
    const deptId = window.location.pathname.split('/').pop();

    const [loading, setLoading] = useState(true);
    const [department, setDepartment] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchDepartmentDetail();
    }, [deptId]);

    const fetchDepartmentDetail = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get(`/departments/${deptId}`);
            const data = response.data?.data || response.data;
            setDepartment(data);
        } catch (error) {
            console.error('❌ Erreur chargement departement:', error);
            setError(error.response?.data?.message || 'Erreur lors du chargement');
            setDepartment(null);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/admin/departments');
    };

    const handleEdit = () => {
        navigate(`/admin/departments/edit/${deptId}`);
    };

    const handleToggleStatus = async () => {
        if (!department) return;
        const newStatus = department.actif ? false : true;
        const action = newStatus ? 'restaurer' : 'archiver';
        if (!window.confirm(`Voulez-vous vraiment ${action} ce departement ?`)) return;

        try {
            await api.put(`/departments/${deptId}`, { actif: newStatus });
            setSuccess(newStatus ? 'Departement restaure avec succes' : 'Departement archive avec succes');
            fetchDepartmentDetail();
        } catch (error) {
            setError(error.response?.data?.message || 'Erreur lors du changement de statut');
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Non defini';
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    const getInitials = (nom) => {
        if (!nom) return '?';
        return nom
            .split(' ')
            .map((word) => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    if (loading) {
        return (
            <PageContainer maxWidth="xl">
                <LoadingSkeleton>
                    <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
                    <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
                        </Grid>
                    </Grid>
                </LoadingSkeleton>
            </PageContainer>
        );
    }

    if (!department) {
        return (
            <PageContainer maxWidth="xl">
                <Alert
                    severity="error"
                    sx={{ borderRadius: '12px' }}
                    action={
                        <Button color="inherit" size="small" onClick={handleBack}>
                            Retour
                        </Button>
                    }
                >
                    {error || 'Departement non trouve'}
                </Alert>
            </PageContainer>
        );
    }

    const isActive = department.actif !== false;
    const membersCount = department.membres?.length || 0;
    const stagiairesCount = department.nbStagiaires || 0;

    return (
        <PageContainer maxWidth="xl">
            {/* ===== EN-TÊTE ===== */}
            <HeaderSection>
                <HeaderLeft>
                    <DepartmentAvatar active={isActive}>
                        {getInitials(department.nom)}
                    </DepartmentAvatar>
                    <Box>
                        <HeaderTitle>{department.nom}</HeaderTitle>
                        <HeaderSubtitle>
                            {department.description || 'Aucune description'}
                        </HeaderSubtitle>
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                            <StatusBadge
                                status={isActive ? 'active' : 'inactive'}
                                label={isActive ? 'Actif' : 'Inactif'}
                                icon={isActive ? <CheckCircle /> : <Archive />}
                            />
                            <Chip
                                label={`${stagiairesCount} stagiaire${stagiairesCount > 1 ? 's' : ''}`}
                                size="small"
                                sx={{ backgroundColor: '#e0e7ff', color: '#4338ca', fontWeight: 500 }}
                            />
                            <Chip
                                label={`${membersCount} membre${membersCount > 1 ? 's' : ''}`}
                                size="small"
                                sx={{ backgroundColor: '#f3e8ff', color: '#6b21a8', fontWeight: 500 }}
                            />
                        </Stack>
                    </Box>
                </HeaderLeft>

                <ActionGroup>
                    <ActionButton
                        variant="outlined"
                        startIcon={<Edit />}
                        onClick={handleEdit}
                        sx={{ borderColor: '#4f46e5', color: '#4f46e5' }}
                    >
                        Modifier
                    </ActionButton>
                    <ActionButton
                        variant="outlined"
                        startIcon={isActive ? <Archive /> : <Restore />}
                        onClick={handleToggleStatus}
                        sx={{
                            borderColor: isActive ? '#f59e0b' : '#22c55e',
                            color: isActive ? '#f59e0b' : '#22c55e',
                        }}
                    >
                        {isActive ? 'Archiver' : 'Restaurer'}
                    </ActionButton>
                    {/* ✅ BOUTON RETOUR : GRIS ANTHRACITE */}
                    <BackButton
                        startIcon={<ArrowBack />}
                        onClick={handleBack}
                    >
                        Retour
                    </BackButton>
                </ActionGroup>
            </HeaderSection>

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

            {/* ===== STATS ===== */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <StatValue>{stagiairesCount}</StatValue>
                                    <StatLabel>Stagiaires</StatLabel>
                                </Box>
                                <StatIconWrapper color="#4f46e5">
                                    <School sx={{ fontSize: 20 }} />
                                </StatIconWrapper>
                            </Box>
                        </CardContent>
                    </StatCard>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <StatValue>{membersCount}</StatValue>
                                    <StatLabel>Membres</StatLabel>
                                </Box>
                                <StatIconWrapper color="#f59e0b">
                                    <People sx={{ fontSize: 20 }} />
                                </StatIconWrapper>
                            </Box>
                        </CardContent>
                    </StatCard>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <StatValue>{isActive ? 'Actif' : 'Inactif'}</StatValue>
                                    <StatLabel>Statut</StatLabel>
                                </Box>
                                <StatIconWrapper color={isActive ? '#22c55e' : '#ef4444'}>
                                    {isActive ? <CheckCircle sx={{ fontSize: 20 }} /> : <Archive sx={{ fontSize: 20 }} />}
                                </StatIconWrapper>
                            </Box>
                        </CardContent>
                    </StatCard>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <StatValue>{department.createdAt ? formatDate(department.createdAt) : '-'}</StatValue>
                                    <StatLabel>Date de création</StatLabel>
                                </Box>
                                <StatIconWrapper color="#8b5cf6">
                                    <CalendarToday sx={{ fontSize: 20 }} />
                                </StatIconWrapper>
                            </Box>
                        </CardContent>
                    </StatCard>
                </Grid>
            </Grid>

            {/* ===== CONTENU PRINCIPAL ===== */}
            <Grid container spacing={3}>
                {/* ===== COLONNE GAUCHE - INFORMATIONS ===== */}
                <Grid item xs={12} md={4}>
                    <DetailCard>
                        <SectionTitle>
                            <SectionIcon color="#148aa0">
                                <Business sx={{ fontSize: 18 }} />
                            </SectionIcon>
                            Informations générales
                        </SectionTitle>

                        <InfoRow>
                            <InfoIcon color="#148aa0">
                                <Person sx={{ fontSize: 18 }} />
                            </InfoIcon>
                            <Box>
                                <InfoLabel>Responsable</InfoLabel>
                                <InfoValue>
                                    {department.responsableId?.nom || department.responsable || 'Non assigné'}
                                </InfoValue>
                            </Box>
                        </InfoRow>

                        <InfoRow>
                            <InfoIcon color="#22c55e">
                                <Description sx={{ fontSize: 18 }} />
                            </InfoIcon>
                            <Box>
                                <InfoLabel>Description</InfoLabel>
                                <InfoValue sx={{ fontWeight: 400 }}>
                                    {department.description || 'Aucune description disponible.'}
                                </InfoValue>
                            </Box>
                        </InfoRow>

                        <InfoRow>
                            <InfoIcon color="#f59e0b">
                                <CalendarToday sx={{ fontSize: 18 }} />
                            </InfoIcon>
                            <Box>
                                <InfoLabel>Date de création</InfoLabel>
                                <InfoValue>{formatDate(department.createdAt)}</InfoValue>
                            </Box>
                        </InfoRow>
                    </DetailCard>
                </Grid>

                {/* ===== COLONNE DROITE - MEMBRES ===== */}
                <Grid item xs={12} md={8}>
                    <DetailCard>
                        <SectionTitle>
                            <SectionIcon color="#4f46e5">
                                <People sx={{ fontSize: 18 }} />
                            </SectionIcon>
                            Membres du département
                            <Chip
                                label={`${membersCount} membre${membersCount > 1 ? 's' : ''}`}
                                size="small"
                                sx={{ ml: 'auto', backgroundColor: '#e0e7ff', color: '#4338ca', fontWeight: 500 }}
                            />
                        </SectionTitle>

                        {membersCount > 0 ? (
                            <List sx={{ p: 0 }}>
                                {department.membres.map((membre, idx) => (
                                    <MemberItem key={idx}>
                                        <ListItemAvatar>
                                            {/* ✅ AVATAR MEMBRE : GRIS ANTHRACITE */}
                                            <MemberAvatar>
                                                {getInitials(membre.nom || '')}
                                            </MemberAvatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Typography variant="body2" fontWeight={600}>
                                                    {membre.prenom || ''} {membre.nom || ''}
                                                </Typography>
                                            }
                                            secondary={
                                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {membre.email || ''}
                                                    </Typography>
                                                    {membre.roleId?.nom && (
                                                        <Chip
                                                            label={membre.roleId.nom}
                                                            size="small"
                                                            sx={{ backgroundColor: '#e0e7ff', color: '#4338ca', height: '20px', fontSize: '10px' }}
                                                        />
                                                    )}
                                                </Stack>
                                            }
                                        />
                                        <Tooltip title="Voir le profil">
                                            <IconButton size="small" sx={{ color: '#687480' }}>
                                                <MoreVert fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </MemberItem>
                                ))}
                            </List>
                        ) : (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Aucun membre dans ce département
                                </Typography>
                            </Box>
                        )}
                    </DetailCard>
                </Grid>
            </Grid>
        </PageContainer>
    );
};

export default DepartmentDetailPage;