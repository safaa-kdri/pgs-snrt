// src/components/rh/ProSignaturePad.jsx
import React, { useRef, useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, Chip, TextField, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
    Draw, 
    Clear, 
    Save, 
    CheckCircle,
    CalendarToday,
    Business,
    Person,
    Upload
} from '@mui/icons-material';
import SignatureCanvas from 'react-signature-canvas';

const SignatureContainer = styled(Paper)({
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid #eef1f3',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
});

const SignatureBox = styled(Box)({
    border: '2px solid #d1d5db',
    borderRadius: '12px',
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    transition: 'all 0.3s ease',
    '&:hover': {
        borderColor: '#148aa0',
    },
    '&.active': {
        borderColor: '#148aa0',
        boxShadow: '0 0 0 3px rgba(20, 138, 160, 0.1)',
    }
});

const StyledButton = styled(Button)({
    borderRadius: '10px',
    textTransform: 'none',
    fontWeight: 600,
    padding: '8px 20px',
});

const ProSignaturePad = ({ 
    onSave, 
    onClear, 
    label,
    signataireNom = '',
    signataireFonction = '',
    nomSociete = 'SNRT',
    showStamp = true
}) => {
    const sigCanvas = useRef(null);
    const [isEmpty, setIsEmpty] = useState(true);
    const [isActive, setIsActive] = useState(false);
    const [signatureData, setSignatureData] = useState(null);
    const [infoSignature, setInfoSignature] = useState({
        nom: signataireNom || '',
        fonction: signataireFonction || '',
        date: new Date().toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        }),
        societe: nomSociete
    });

    // ✅ Mettre à jour la date automatiquement
    useEffect(() => {
        setInfoSignature(prev => ({
            ...prev,
            date: new Date().toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            })
        }));
    }, []);

    const handleClear = () => {
        sigCanvas.current.clear();
        setIsEmpty(true);
        setSignatureData(null);
        if (onClear) onClear();
    };

    const handleBegin = () => {
        setIsActive(true);
    };

    const handleEnd = () => {
        if (sigCanvas.current.isEmpty()) {
            setIsEmpty(true);
            setIsActive(false);
        } else {
            setIsEmpty(false);
            setIsActive(false);
        }
    };

    const handleSave = () => {
        if (sigCanvas.current.isEmpty()) {
            return;
        }

        // ✅ Récupérer l'image de la signature
        const signatureImage = sigCanvas.current.toDataURL('image/png');
        
        // ✅ Créer une signature complète avec cachet
        const completeSignature = {
            signature: signatureImage,
            nom: infoSignature.nom || 'Signature',
            fonction: infoSignature.fonction || 'Responsable',
            date: infoSignature.date,
            societe: infoSignature.societe,
            timestamp: new Date().toISOString()
        };

        setSignatureData(completeSignature);
        setIsActive(false);
        
        if (onSave) {
            onSave(completeSignature);
        }
    };

    const handleInfoChange = (field, value) => {
        setInfoSignature(prev => ({ ...prev, [field]: value }));
    };

    // ✅ Générer un aperçu du cachet
    const renderStampPreview = () => {
        if (!signatureData) return null;

        return (
            <Box sx={{ 
                mt: 3, 
                p: 2, 
                border: '1px solid #e5e7eb', 
                borderRadius: '8px',
                backgroundColor: '#fafafa',
                position: 'relative'
            }}>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle sx={{ color: '#22c55e', fontSize: 18 }} />
                    Signature validée
                </Typography>
                
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    p: 2,
                    border: '2px solid #148aa0',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff'
                }}>
                    {/* ✅ Cachet */}
                    <Box sx={{ 
                        border: '2px solid #148aa0',
                        borderRadius: '50%',
                        width: 80,
                        height: 80,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2,
                        backgroundColor: 'rgba(20, 138, 160, 0.05)'
                    }}>
                        <Typography variant="caption" fontWeight={700} color="#148aa0" textAlign="center">
                            {infoSignature.societe}
                        </Typography>
                    </Box>

                    {/* ✅ Signature */}
                    <img 
                        src={signatureData.signature} 
                        alt="Signature" 
                        style={{ maxHeight: '60px', maxWidth: '100%' }} 
                    />

                    {/* ✅ Informations du signataire */}
                    <Box sx={{ textAlign: 'center', mt: 1 }}>
                        <Typography variant="body2" fontWeight={600}>
                            {infoSignature.nom || 'Signature'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {infoSignature.fonction || 'Responsable'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                            {infoSignature.societe} • {infoSignature.date}
                        </Typography>
                    </Box>
                </Box>
            </Box>
        );
    };

    return (
        <SignatureContainer>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                Signature électronique
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {label || 'Dessinez votre signature ci-dessous pour valider le document'}
            </Typography>

            {/* ✅ Informations du signataire */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Nom du signataire *"
                        value={infoSignature.nom}
                        onChange={(e) => handleInfoChange('nom', e.target.value)}
                        size="small"
                        fullWidth
                        placeholder="Ex: Dr. Karim BENNANI"
                        InputProps={{
                            startAdornment: <Person sx={{ color: '#999', fontSize: 18, mr: 1 }} />
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Fonction *"
                        value={infoSignature.fonction}
                        onChange={(e) => handleInfoChange('fonction', e.target.value)}
                        size="small"
                        fullWidth
                        placeholder="Ex: Responsable RH"
                        InputProps={{
                            startAdornment: <Business sx={{ color: '#999', fontSize: 18, mr: 1 }} />
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                    />
                </Grid>
            </Grid>

            {/* ✅ Zone de dessin */}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Dessinez votre signature (utilisez la souris ou le doigt) :
            </Typography>
            
            <SignatureBox className={isActive ? 'active' : ''}>
                <SignatureCanvas
                    ref={sigCanvas}
                    canvasProps={{
                        width: 500,
                        height: 150,
                        className: 'sigCanvas',
                        style: { width: '100%', height: '100%', cursor: 'url(https://cdn.jsdelivr.net/npm/pointer-events@1.0.0/icon.png), crosshair' }
                    }}
                    onBegin={handleBegin}
                    onEnd={handleEnd}
                    backgroundColor="#ffffff"
                    penColor="#1a2332"
                    dotSize={2}
                    minWidth={1}
                    maxWidth={3}
                />
            </SignatureBox>

            <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                <StyledButton
                    variant="outlined"
                    startIcon={<Clear />}
                    onClick={handleClear}
                    sx={{ borderColor: '#d1d5db', color: '#6b7280' }}
                >
                    Effacer
                </StyledButton>
                <StyledButton
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSave}
                    disabled={isEmpty || !infoSignature.nom || !infoSignature.fonction}
                    sx={{
                        backgroundColor: '#148aa0',
                        '&:hover': { backgroundColor: '#0b7890' },
                        '&:disabled': { backgroundColor: '#a0c4cd' }
                    }}
                >
                    Valider la signature
                </StyledButton>
            </Box>

            {isEmpty && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    Dessinez votre signature et remplissez vos informations pour valider
                </Typography>
            )}

            {/* ✅ Aperçu du cachet */}
            {renderStampPreview()}

            {/* ✅ Récapitulatif */}
            {signatureData && (
                <Box sx={{ 
                    mt: 2, 
                    p: 2, 
                    backgroundColor: '#f0fdf4', 
                    borderRadius: '8px',
                    border: '1px solid #22c55e'
                }}>
                    <Typography variant="caption" color="#065f46" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircle sx={{ fontSize: 16 }} />
                        Document signé électroniquement par {infoSignature.nom} le {infoSignature.date}
                    </Typography>
                </Box>
            )}
        </SignatureContainer>
    );
};

export default ProSignaturePad;