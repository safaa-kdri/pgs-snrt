// src/components/student/StudentInternshipDetail.jsx
// ✅ CORRIGÉ : Récupération correcte du stage

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
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    ArrowBack,
    Description,
    FilePresent,
    PersonOutline,
    PictureAsPdf,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { getInternshipDetail, getInternshipByApplication } from '../../services/api';
import StudentConvention from './StudentConvention';
import StudentLivrables from './StudentLivrables';
import StudentAttestation from './StudentAttestation';

// ============================================
// STYLES - ULTRA MINIMALISTES
// ============================================

const PageContainer = styled(Container)({
    paddingTop: '24px',
    paddingBottom: '40px',
    maxWidth: '1000px !important',
});

const BackButton = styled(Button)({
    textTransform: 'none',
    color: '#64748b',
    padding: '0',
    minWidth: 'unset',
    fontWeight: 500,
    fontSize: '14px',
    '&:hover': { backgroundColor: 'transparent', color: '#0f172a' },
});

const StyledPaper = styled(Paper)({
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    boxShadow: 'none',
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    marginTop: '12px',
});

const HeaderSection = styled(Box)({
    padding: '16px 24px 12px',
    backgroundColor: '#ffffff',
});

const HeaderRow = styled(Box)({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
});

const HeaderTitle = styled(Typography)({
    fontWeight: 600,
    fontSize: '20px',
    color: '#0f172a',
    letterSpacing: '-0.02em',
});

const InfoRow = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '6px',
    paddingTop: '8px',
    borderTop: '1px solid #f1f5f9',
});

const InfoItem = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: '#64748b',
    '& .MuiSvgIcon-root': {
        fontSize: '16px',
        color: '#94a3b8',
    },
});

const InfoValue = styled(Typography)({
    fontSize: '13px',
    color: '#0f172a',
    fontWeight: 500,
});

const StyledTabs = styled(Tabs)({
    borderTop: '1px solid #f1f5f9',
    borderBottom: '1px solid #f1f5f9',
    backgroundColor: '#fafbfc',
    minHeight: '44px',
    '& .MuiTabs-indicator': {
        backgroundColor: '#0f766e',
        height: '2px',
    },
});

const StyledTab = styled(Tab)({
    textTransform: 'none',
    fontWeight: 500,
    fontSize: '13px',
    color: '#64748b',
    minHeight: '44px',
    padding: '0 16px',
    '&.Mui-selected': {
        color: '#0f172a',
        fontWeight: 600,
    },
});

const TabContent = styled(Box)({
    padding: '20px 24px',
    backgroundColor: '#ffffff',
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
        console.log('🔍 [StudentInternshipDetail] ID reçu:', id);
        fetchInternshipDetail();
    }, [id]);

    const fetchInternshipDetail = async () => {
        setLoading(true);
        setError('');
        try {
            // ✅ Essayer d'abord via getInternshipDetail
            let data = await getInternshipDetail(id);
            
            // ✅ Si pas trouvé, essayer via getInternshipByApplication
            if (!data || !data._id) {
                console.log('🔍 [StudentInternshipDetail] Stage non trouvé, essai via application');
                data = await getInternshipByApplication(id);
            }
            
            console.log('📥 [StudentInternshipDetail] Données reçues:', data);
            console.log('📥 [StudentInternshipDetail] attestationGeneree:', data?.attestationGeneree);
            console.log('📥 [StudentInternshipDetail] statut:', data?.statut);
            
            if (data && data._id) {
                setInternship(data);
                console.log('✅ [StudentInternshipDetail] Stage chargé avec succès');
            } else {
                setError('Stage non trouvé');
                setTimeout(() => {
                    navigate('/dashboard/stages');
                }, 2000);
            }
        } catch (error) {
            console.error('❌ [StudentInternshipDetail] Erreur:', error);
            setError(error.response?.data?.message || 'Erreur lors du chargement');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
                    <CircularProgress size={32} sx={{ color: '#0f766e' }} />
                </Box>
            </Container>
        );
    }

    if (error || !internship) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error" sx={{ borderRadius: '10px' }}>
                    {error || 'Stage non trouvé'}
                </Alert>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/dashboard/stages')}
                    sx={{ mt: 2, color: '#64748b', textTransform: 'none' }}
                >
                    Retour
                </Button>
            </Container>
        );
    }

    // ✅ 3 ONGLETS : Convention + Rapport + Attestation
    const tabs = [
        { label: 'Convention', icon: <FilePresent sx={{ fontSize: 18 }} />, component: <StudentConvention internshipId={id} /> },
        { label: 'Rapport', icon: <Description sx={{ fontSize: 18 }} />, component: <StudentLivrables internshipId={id} user={user} /> },
    ];

    // ✅ AJOUTER L'ONGLET ATTESTATION UNIQUEMENT SI DISPONIBLE
    const hasAttestation = internship?.attestationGeneree === true || 
                          internship?.statut === 'Cloturee' || 
                          internship?.statut === 'Termine';

    console.log('🔍 [StudentInternshipDetail] hasAttestation:', hasAttestation);
    console.log('🔍 [StudentInternshipDetail] attestationGeneree:', internship?.attestationGeneree);
    console.log('🔍 [StudentInternshipDetail] statut:', internship?.statut);

    if (hasAttestation) {
        console.log('✅ [StudentInternshipDetail] Ajout de l\'onglet Attestation');
        tabs.push({
            label: 'Attestation',
            icon: <PictureAsPdf sx={{ fontSize: 18 }} />,
            component: <StudentAttestation internshipId={id} internship={internship} />,
        });
    } else {
        console.log('ℹ️ [StudentInternshipDetail] Pas d\'attestation disponible');
    }

    const hasEncadrant = internship.encadrantId && 
        (internship.encadrantId.nom || internship.encadrantId.prenom);
    const encadrantName = hasEncadrant 
        ? `${internship.encadrantId.prenom || ''} ${internship.encadrantId.nom || ''}`.trim() 
        : 'Non assigné';

    return (
        <PageContainer maxWidth="lg">
            <BackButton startIcon={<ArrowBack />} onClick={() => navigate('/dashboard/stages')}>
                Mes stages
            </BackButton>

            <StyledPaper>
                <HeaderSection>
                    <HeaderRow>
                        <HeaderTitle>
                            {internship.sujetTitre || internship.offreId?.titre || 'Stage'}
                        </HeaderTitle>
                    </HeaderRow>

                    <InfoRow>
                        <InfoItem>
                            <PersonOutline />
                            <InfoValue>{encadrantName}</InfoValue>
                        </InfoItem>
                    </InfoRow>
                </HeaderSection>

                <StyledTabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                    {tabs.map((tab, index) => (
                        <StyledTab 
                            key={tab.label} 
                            label={tab.label} 
                            icon={tab.icon} 
                            iconPosition="start" 
                            value={index} 
                        />
                    ))}
                </StyledTabs>

                <TabContent>
                    {tabs[tabValue]?.component}
                </TabContent>
            </StyledPaper>
        </PageContainer>
    );
};

export default StudentInternshipDetail;