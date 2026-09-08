// src/components/common/SidebarSearch.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    Typography,
    TextField,
    Button,
    MenuItem,
    InputAdornment,
    Box,
} from '@mui/material';
import { styled } from '@mui/material/styles';

// ============================================
// STYLES
// ============================================

const SearchCard = styled(Card)({
    backgroundColor: '#f7f7f7',
    borderRadius: '19px',
    padding: '24px 16px 16px',
    minHeight: '350px',
    maxWidth: '265px',
    width: '100%',
    margin: '0 auto',
    boxShadow: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    '& h2': {
        marginBottom: '14px',
        color: '#4a4a4a',
        fontSize: '18px',
        fontWeight: 700,
        textAlign: 'center',
        fontFamily: '"Inria Sans", sans-serif',
    },
});

const SearchField = styled(TextField)({
    width: '120%',
    maxWidth: '165px',
    marginBottom: '8px',
    '& .MuiOutlinedInput-root': {
        height: '45px',
        borderRadius: '27px',
        background: 'var(--bg-input)',
        '& fieldset': { borderColor: 'var(--border-input)' },
        '&:hover fieldset': { borderColor: 'var(--border-input)' },
        '&.Mui-focused fieldset': { borderColor: '#148aa0' },
    },
    '& .MuiInputBase-input': {
        padding: '0 28px',
        fontSize: '15px',
        color: 'var(--text-primary)',
        '&::placeholder': {
            color: 'var(--text-muted)',
            opacity: 1,
        },
    },
});

const DateField = styled(TextField)({
    width: '120%',
    maxWidth: '165px',
    marginBottom: '10px',
    '& .MuiOutlinedInput-root': {
        height: '48px',
        borderRadius: '27px',
        background: 'var(--bg-input)',
        '& fieldset': { borderColor: 'var(--border-input)' },
        '&:hover fieldset': { borderColor: 'var(--border-input)' },
        '&.Mui-focused fieldset': { borderColor: '#148aa0' },
    },
    '& .MuiInputBase-input': {
        padding: '0 23px 0 28px',
        fontSize: '15px',
        color: 'var(--text-primary)',
        '&::placeholder': {
            color: 'var(--text-primary)',
            opacity: 1,
        },
    },
});

const SearchButton = styled(Button)({
    width: '120%',
    maxWidth: '165px',
    height: '48px',
    marginTop: '2px',
    borderRadius: '27px',
    background: '#148aa0',
    color: '#fff',
    fontWeight: 700,
    fontSize: '15px',
    textTransform: 'none',
    '&:hover': { background: '#0b7890' },
});

// ============================================
// TYPES DE STAGE DISPONIBLES
// ============================================
const STAGE_TYPES = [
    'PFE',
    'PFA',
    'Initiation',
    'Ete'
];

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const SidebarSearch = ({ onSearch }) => {
    const navigate = useNavigate();
    const [profil, setProfil] = useState('');
    const [typeStage, setTypeStage] = useState('');
    const [date, setDate] = useState('');

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (profil) params.append('search', profil);
        if (typeStage) params.append('typeStage', typeStage);
        if (date) params.append('date', date);

        console.log('🔍 Recherche avec filtres:', { profil, typeStage, date });
        console.log('🔗 URL générée:', `/?${params.toString()}`);

        navigate(`/?${params.toString()}`);

        if (onSearch) {
            onSearch({ profil, typeStage, date });
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <SearchCard>
            <h2>Recherche les offres</h2>

            <SearchField
                placeholder="Profil"
                variant="outlined"
                value={profil}
                onChange={(e) => setProfil(e.target.value)}
                onKeyPress={handleKeyPress}
            />

            <SearchField
                select
                value={typeStage}
                onChange={(e) => setTypeStage(e.target.value)}
                variant="outlined"
                SelectProps={{
                    displayEmpty: true,
                    IconComponent: () => null,
                }}
                sx={{
                    '& .MuiSelect-select': {
                        color: '#1a2332',
                        fontWeight: typeStage ? 500 : 400,
                    },
                }}
            >
                <MenuItem value="" sx={{ color: '#1a2332', fontWeight: 400 }}>
                    * Sélectionner
                </MenuItem>
                {STAGE_TYPES.map((type) => (
                    <MenuItem key={type} value={type} sx={{ fontWeight: 500, color: '#1a2332' }}>
                        {type}
                    </MenuItem>
                ))}
            </SearchField>

            <DateField
                type="date"
                variant="outlined"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                onKeyPress={handleKeyPress}
                InputLabelProps={{ shrink: true }}
                placeholder="jj/mm/aaaa"
                slotProps={{
                    input: {
                        sx: {
                            '&::placeholder': {
                                color: '#1a2332',
                                opacity: 1,
                            },
                        },
                    },
                }}
                sx={{
                    '& .MuiInputBase-input': {
                        color: '#1a2332',
                    },
                    '& .MuiInputBase-input::placeholder': {
                        color: '#1a2332',
                        opacity: 1,
                    },
                }}
            />

            <SearchButton onClick={handleSearch}>
                Recherche
            </SearchButton>
        </SearchCard>
    );
};

export default SidebarSearch;