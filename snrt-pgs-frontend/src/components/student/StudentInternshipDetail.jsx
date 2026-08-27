// src/components/student/StudentInternshipDetail.jsx
// ✅ DESIGN TABLEAU - Style professionnel SNRT
// ✅ SUPPRESSION : Onglet "Suivi" (Timeline)
// ✅ ORDRE : Convention → Livrables → Évaluation → Attestation
// ✅ Accès : /dashboard/stage/:id

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Container,
    Paper,
    Typography,
    Tabs,
    Tab,
    CircularProgress,
    Alert,
    Button,
    Divider,
    Chip,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableRow,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    ArrowBack,
    Description,
    Assessment,
    PictureAsPdf,
    FilePresent,
    StarOutline,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { getInternshipDetail } from '../../services/api';
// ❌ IMPORT SUPPRIMÉ : StudentTimeline
import StudentConvention from './StudentConvention';
import StudentLivrables from './StudentLivrables';
import StudentEvaluation from './StudentEvaluation';

// ============================================
// STYLES - DESIGN TABLEAU
// ============================================

const PageContainer = styled(Container)({
    paddingTop: '32px',
    paddingBottom: '48px',
});

const StyledPaper = styled(Paper)({
    borderRadius: '12px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    overflow: 'hidden',
    border: '1px solid #e8ecf0',
});

const HeaderSection = styled(Box)({
    padding: '28px 32px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #eef1f3',
});

const StatusChip = styled(Chip)(({ status }) => {
    const colors = {
        'EnCours': { bg: '#e8f0fe', text: '#1a56db' },
        'Termine': { bg: '#e6f7e6', text: '#0b7e3d' },
        'Annule': { bg: '#fde8e8', text: '#b91c1c' },
        'Cloturee': { bg: '#e6f7e6', text: '#0b7e3d' },
        'EnAttenteValidation': { bg: '#fef3c7', text: '#b45309' },
        'Acceptee': { bg: '#e6f7e6', text: '#0b7e3d' },
    };
    const color = colors[status] || colors['EnCours'];
    return {
        backgroundColor: color.bg,
        color: color.text,
        fontWeight: 500,
        fontSize: '12px',
        height: '28px',
        borderRadius: '6px',
        '& .MuiChip-label': {
            padding: '0 16px',
        },
    };
});

const StyledTabs = styled(Tabs)({
    borderBottom: '1px solid #eef1f3',
    padding: '0 24px',
    minHeight: '56px',
    backgroundColor: '#fafbfc',
    '& .MuiTabs-indicator': {
        backgroundColor: '#0b4f6c',
        height: '3px',
        borderRadius: '3px 3px 0 0',
    },
});

const StyledTab = styled(Tab)({
    textTransform: 'none',
    fontWeight: 500,
    fontSize: '14px',
    fontFamily: '"Inter", -apple-system, sans-serif',
    minHeight: '56px',
    padding: '0 20px',
    color: '#6b7a8a',
    '&.Mui-selected': {
        color: '#0b4f6c',
        fontWeight: 600,
    },
    '& .MuiTab-iconWrapper': {
        marginRight: '10px',
        color: 'inherit',
    },
});

const TabContent = styled(Box)({
    padding: '32px 36px',
    backgroundColor: '#ffffff',
});

const HeaderTop = styled(Box)({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '20px',
});

const HeaderTitle = styled(Typography)({
    fontFamily: '"Inter", -apple-system, sans-serif',
    fontWeight: 700,
    fontSize: '22px',
    color: '#0b1a2a',
    letterSpacing: '-0.3px',
});

const HeaderSubtitle = styled(Typography)({
    fontFamily: '"Inter", -apple-system, sans-serif',
    fontSize: '14px',
    color: '#6b7a8a',
    marginTop: '2px',
});

const BackButton = styled(Button)({
    fontFamily: '"Inter", -apple-system, sans-serif',
    textTransform: 'none',
    color: '#6b7a8a',
    padding: '6px 0',
    fontSize: '14px',
    '&:hover': {
        color: '#0b1a2a',
        backgroundColor: 'transparent',
    },
});

// STYLES TABLEAU
const StyledTable = styled(Table)({
    borderCollapse: 'collapse',
    '& .MuiTableCell-root': {
        borderBottom: '1px solid #f0f2f4',
        padding: '12px 16px',
        fontFamily: '"Inter", -apple-system, sans-serif',
    },
});

const LabelCell = styled(TableCell)({
    fontWeight: 600,
    color: '#4a5a6a',
    fontSize: '13px',
    width: '140px',
    backgroundColor: '#fafbfc',
    borderRight: '1px solid #f0f2f4',
});

const ValueCell = styled(TableCell)({
    fontWeight: 500,
    color: '#1a2a3a',
    fontSize: '14px',
    backgroundColor: '#ffffff',
});

const EmptyStateBox = styled(Box)({
    textAlign: 'center',
    padding: '48px 20px',
});

const EmptyIcon = styled(Box)({
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: '#f0f4f8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
    '& .MuiSvgIcon-root': {
        fontSize: '32px',
        color: '#8a9aa8',
    },
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const StudentInternshipDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [internship, setInternship] = useState(null);
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        fetchInternshipDetail();
    }, [id]);

    const fetchInternshipDetail = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getInternshipDetail(id);
            if (data) {
                setInternship(data);
            } else {
                setError('Stage non trouvé');
            }
        } catch (error) {
            console.error('Erreur chargement stage:', error);
            setError(error.response?.data?.message || 'Erreur lors du chargement');
        } finally {
            setLoading(false);
        }
    };

    const getStatusLabel = (status) => {
        const labels = {
            'EnCours': 'En cours',
            'Termine': 'Terminé',
            'Annule': 'Annulé',
            'Cloturee': 'Clôturé',
            'EnAttenteValidation': 'En attente validation',
            'Acceptee': 'Accepté',
            'Acceptée': 'Accepté',
            'DemandeEnvoyee': 'Demande envoyée',
            'EngagementEnvoye': 'Engagement envoyé',
        };
        return labels[status] || status;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                    <CircularProgress size={44} sx={{ color: '#0b4f6c' }} />
                </Box>
            </Container>
        );
    }

    if (error || !internship) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error" sx={{ borderRadius: '8px' }}>
                    {error || 'Stage non trouvé'}
                </Alert>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/dashboard/stages')}
                    sx={{ mt: 2, textTransform: 'none', color: '#6b7a8a' }}
                >
                    Retour à mes stages
                </Button>
            </Container>
        );
    }

    const hasEncadrant = internship.encadrantId && (internship.encadrantId.nom || internship.encadrantId.prenom);

    // ✅ DÉFINITION DES ONGLETS SANS "SUIVI"
    // Ordre : Convention → Livrables → Évaluation → Attestation (si clôturé)
    const tabs = [
        { 
            label: 'Convention', 
            icon: <FilePresent sx={{ fontSize: 18 }} />,
            value: 0, 
            component: <StudentConvention internshipId={id} /> 
        },
        { 
            label: 'Livrables', 
            icon: <Description sx={{ fontSize: 18 }} />,
            value: 1, 
            component: <StudentLivrables internshipId={id} user={user} /> 
        },
        { 
            label: 'Évaluation', 
            icon: <StarOutline sx={{ fontSize: 18 }} />,
            value: 2, 
            component: <StudentEvaluation internshipId={id} /> 
        },
    ];

    // ✅ Ajouter Attestation si stage clôturé
    if (internship.statut === 'Cloturee' || internship.statut === 'Termine') {
        tabs.push({
            label: 'Attestation',
            icon: <PictureAsPdf sx={{ fontSize: 18 }} />,
            value: 3,
            component: (
                <EmptyStateBox>
                    <EmptyIcon>
                        <PictureAsPdf />
                    </EmptyIcon>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#0b1a2a', mb: 1 }}>
                        Attestation de stage disponible
                    </Typography>
                    <Typography variant="body2" color="#6b7a8a" sx={{ mb: 3 }}>
                        Félicitations ! Votre attestation de stage est prête.
                    </Typography>
                    <Button
                        variant="contained"
                        sx={{
                            backgroundColor: '#0b4f6c',
                            textTransform: 'none',
                            borderRadius: '8px',
                            padding: '10px 36px',
                            fontWeight: 500,
                            '&:hover': { backgroundColor: '#083a50' },
                        }}
                        onClick={() => {
                            alert('Téléchargement de l\'attestation...');
                        }}
                    >
                        Télécharger
                    </Button>
                </EmptyStateBox>
            ),
        });
    }

    return (
        <PageContainer maxWidth="lg">
            <Box sx={{ mb: 3 }}>
                <BackButton
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/dashboard/stages')}
                >
                    Retour à mes stages
                </BackButton>
            </Box>

            <StyledPaper>
                {/* HEADER */}
                <HeaderSection>
                    <HeaderTop>
                        <Box>
                            <HeaderTitle>
                                {internship.sujetTitre || internship.offreId?.titre || 'Stage'}
                            </HeaderTitle>
                            <HeaderSubtitle>
                                {internship.offreId?.departementId?.nom || 'Département'}
                            </HeaderSubtitle>
                        </Box>
                        <StatusChip label={getStatusLabel(internship.statut)} status={internship.statut} />
                    </HeaderTop>

                    <Divider sx={{ mb: 0 }} />

                    {/* TABLEAU DES INFORMATIONS */}
                    <StyledTable>
                        <TableBody>
                            <TableRow>
                                <LabelCell>Encadrant</LabelCell>
                                <ValueCell>
                                    {hasEncadrant 
                                        ? `${internship.encadrantId.prenom || ''} ${internship.encadrantId.nom || ''}`.trim()
                                        : 'Non assigné'
                                    }
                                </ValueCell>
                            </TableRow>
                            <TableRow>
                                <LabelCell>Période</LabelCell>
                                <ValueCell>
                                    {formatDate(internship.dateDebut)} — {formatDate(internship.dateFin)}
                                </ValueCell>
                            </TableRow>
                            <TableRow>
                                <LabelCell>Type</LabelCell>
                                <ValueCell>
                                    {internship.offreId?.typeStage || 'Stage'}
                                </ValueCell>
                            </TableRow>
                            <TableRow>
                                <LabelCell>Département</LabelCell>
                                <ValueCell>
                                    {internship.offreId?.departementId?.nom || 'Non renseigné'}
                                </ValueCell>
                            </TableRow>
                        </TableBody>
                    </StyledTable>
                </HeaderSection>

                {/* TABS - SANS "SUIVI" */}
                <StyledTabs value={tabValue} onChange={handleTabChange}>
                    {tabs.map((tab) => (
                        <StyledTab
                            key={tab.value}
                            label={tab.label}
                            icon={tab.icon}
                            iconPosition="start"
                        />
                    ))}
                </StyledTabs>

                {/* CONTENT */}
                <TabContent>
                    {tabs[tabValue]?.component}
                </TabContent>
            </StyledPaper>
        </PageContainer>
    );
};

export default StudentInternshipDetail;