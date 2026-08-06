// src/components/admin/DepartmentDetailPage.jsx
// ✅ VERSION PROFESSIONNELLE - ÉPURÉE ET SOBRE

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
    Stack,
    IconButton,
    Tooltip,
    Skeleton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    ArrowBack,
    Edit,
    Archive,
    Restore,
    CheckCircle,
} from '@mui/icons-material';
import api from '../../services/api';

// ============================================
// STYLES - ÉPURÉS ET PROFESSIONNELS
// ============================================

const PageContainer = styled(Container)({
    paddingTop: '24px',
    paddingBottom: '48px',
});

// ✅ BOUTON RETOUR - STYLE RH
const BackButton = styled(Button)({
    textTransform: 'none',
    color: '#666',
    marginBottom: '12px',
    '&:hover': {
        backgroundColor: 'transparent',
        color: '#1a2332',
    },
});

// ✅ EN-TÊTE SIMPLIFIÉ
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
    gap: '16px',
});

// ✅ AVATAR RÉDUIT (48px)
const DepartmentAvatar = styled(Avatar)({
    width: 48,
    height: 48,
    backgroundColor: '#2d3748',
    fontSize: '18px',
    fontWeight: 700,
    color: '#ffffff',
});

const HeaderTitle = styled(Typography)({
    fontWeight: 700,
    fontSize: '22px',
    color: '#1a2332',
    letterSpacing: '-0.3px',
});

const HeaderSubtitle = styled(Typography)({
    color: '#687480',
    fontSize: '14px',
});

// ✅ BADGE STATUT UNIQUEMENT
const StatusBadge = styled(Chip)(({ status }) => ({
    borderRadius: '16px',
    padding: '0 12px',
    height: '24px',
    fontWeight: 600,
    fontSize: '12px',
    backgroundColor: status === 'active' ? '#d1fae5' : '#fee2e2',
    color: status === 'active' ? '#065f46' : '#991b1b',
    '& .MuiChip-icon': {
        fontSize: '14px',
    },
}));

const ActionGroup = styled(Box)({
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
});

const ActionButton = styled(Button)({
    borderRadius: '8px',
    textTransform: 'none',
    fontWeight: 500,
    padding: '6px 16px',
    fontSize: '13px',
});

// ✅ CARTE PRINCIPALE - BORDURE LÉGÈRE, SANS OMBRE
const DetailCard = styled(Paper)({
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #eef1f3',
    boxShadow: 'none',
    marginBottom: '32px',
});

const SectionTitle = styled(Typography)({
    fontSize: '14px',
    fontWeight: 600,
    color: '#1a2332',
    marginBottom: '16px',
    letterSpacing: '0.3px',
    textTransform: 'uppercase',
});

// ✅ LIGNE D'INFORMATION - SANS ICÔNE
const InfoRow = styled(Box)({
    display: 'flex',
    padding: '6px 0',
    borderBottom: '1px solid #f0f2f5',
    '&:last-child': {
        borderBottom: 'none',
    },
});

const InfoLabel = styled(Typography)({
    fontSize: '13px',
    color: '#9aa4ac',
    fontWeight: 500,
    minWidth: '140px',
});

const InfoValue = styled(Typography)({
    fontSize: '14px',
    color: '#1a2332',
});

// ✅ MEMBRE - SIMPLIFIÉ
const MemberItem = styled(ListItem)({
    padding: '8px 0',
    borderBottom: '1px solid #f0f2f5',
    '&:last-child': {
        borderBottom: 'none',
    },
});

const MemberAvatar = styled(Avatar)({
    width: 32,
    height: 32,
    backgroundColor: '#eef1f3',
    color: '#687480',
    fontSize: 12,
    fontWeight: 600,
});

// ✅ SKELETON
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
            setSuccess(newStatus ? 'Departement restauré avec succès' : 'Departement archivé avec succès');
            fetchDepartmentDetail();
        } catch (error) {
            setError(error.response?.data?.message || 'Erreur lors du changement de statut');
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Non défini';
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
            <PageContainer maxWidth="lg">
                <LoadingSkeleton>
                    <Skeleton variant="rectangular" height={40} width={200} sx={{ borderRadius: 1 }} />
                    <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 1 }} />
                    <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 1 }} />
                </LoadingSkeleton>
            </PageContainer>
        );
    }

    if (!department) {
        return (
            <PageContainer maxWidth="lg">
                <Alert
                    severity="error"
                    sx={{ borderRadius: '8px' }}
                    action={
                        <Button color="inherit" size="small" onClick={handleBack}>
                            Retour
                        </Button>
                    }
                >
                    {error || 'Departement non trouvé'}
                </Alert>
            </PageContainer>
        );
    }

    const isActive = department.actif !== false;
    const membersCount = department.membres?.length || 0;
    const stagiairesCount = department.nbStagiaires || 0;

    return (
        <PageContainer maxWidth="lg">
            {/* ===== BOUTON RETOUR ===== */}
            <BackButton startIcon={<ArrowBack />} onClick={handleBack}>
                Retour à la liste
            </BackButton>

            {/* ===== EN-TÊTE ===== */}
            <HeaderSection>
                <HeaderLeft>
                    <DepartmentAvatar>
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
                            <Typography variant="body2" color="#687480" sx={{ fontSize: '13px' }}>
                                {membersCount} membre{membersCount > 1 ? 's' : ''}
                            </Typography>
                            <Typography variant="body2" color="#687480" sx={{ fontSize: '13px' }}>
                                {stagiairesCount} stagiaire{stagiairesCount > 1 ? 's' : ''}
                            </Typography>
                        </Stack>
                    </Box>
                </HeaderLeft>

                
            </HeaderSection>

            {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>
                    {error}
                </Alert>
            )}
            {success && (
                <Alert severity="success" sx={{ mb: 3, borderRadius: '8px' }}>
                    {success}
                </Alert>
            )}

            {/* ===== INFORMATIONS GÉNÉRALES ===== */}
            <DetailCard>
                <SectionTitle>Informations générales</SectionTitle>

                <InfoRow>
                    <InfoLabel>Responsable</InfoLabel>
                    <InfoValue>
                        {department.responsableId?.nom || department.responsable || 'Non assigné'}
                    </InfoValue>
                </InfoRow>

                <InfoRow>
                    <InfoLabel>Statut</InfoLabel>
                    <InfoValue>
                        <StatusBadge
                            status={isActive ? 'active' : 'inactive'}
                            label={isActive ? 'Actif' : 'Inactif'}
                            size="small"
                        />
                    </InfoValue>
                </InfoRow>

                <InfoRow>
                    <InfoLabel>Date de création</InfoLabel>
                    <InfoValue>{formatDate(department.createdAt)}</InfoValue>
                </InfoRow>

                {department.description && (
                    <InfoRow sx={{ flexDirection: 'column', alignItems: 'flex-start', pt: 12 }}>
                        <InfoLabel sx={{ mb: 1 }}>Description</InfoLabel>
                        <InfoValue sx={{ fontWeight: 400, color: '#4a5568' }}>
                            {department.description}
                        </InfoValue>
                    </InfoRow>
                )}
            </DetailCard>

            {/* ===== MEMBRES ===== */}
            <DetailCard>
                <SectionTitle>
                    Membres du département
                    <Typography component="span" variant="body2" color="#687480" sx={{ fontWeight: 400, ml: 1 }}>
                        ({membersCount})
                    </Typography>
                </SectionTitle>

                {membersCount > 0 ? (
                    <List sx={{ p: 0 }}>
                        {department.membres.map((membre, idx) => (
                            <MemberItem key={idx}>
                                <ListItemAvatar>
                                    <MemberAvatar>
                                        {getInitials(membre.nom || '')}
                                    </MemberAvatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <Typography variant="body2" fontWeight={500} color="#1a2332">
                                            {membre.prenom || ''} {membre.nom || ''}
                                        </Typography>
                                    }
                                    secondary={
                                        <Typography variant="body2" color="#9aa4ac" fontSize="13px">
                                            {membre.roleId?.nom || 'Membre'}
                                        </Typography>
                                    }
                                />
                            </MemberItem>
                        ))}
                    </List>
                ) : (
                    <Typography variant="body2" color="#687480" sx={{ textAlign: 'center', py: 3 }}>
                        Aucun membre dans ce département
                    </Typography>
                )}
            </DetailCard>
        </PageContainer>
    );
};

export default DepartmentDetailPage;