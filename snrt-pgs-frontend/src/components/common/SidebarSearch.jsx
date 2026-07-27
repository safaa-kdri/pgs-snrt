// src/components/common/SidebarSearch.jsx
import React, { useState } from 'react';
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
    padding: '32px 20px 20px',
    minHeight: '480px',
    boxShadow: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    '& h2': {
        marginBottom: '18px',
        color: '#07111b',
        fontSize: '18px',
        fontWeight: 400,
        textAlign: 'center',
        fontFamily: '"Inria Sans", sans-serif',
    },
});

const SearchField = styled(TextField)({
    width: '100%',
    maxWidth: '220px',
    marginBottom: '10px',
    '& .MuiOutlinedInput-root': {
        height: '42px',
        borderRadius: '27px',
        background: '#fff',
        '& fieldset': { borderColor: '#e1e6eb' },
        '&:hover fieldset': { borderColor: '#e1e6eb' },
        '&.Mui-focused fieldset': { borderColor: '#148aa0' },
    },
    '& .MuiInputBase-input': {
        padding: '0 28px',
        fontSize: '15px',
        color: '#6d7884',
    },
});

const DateField = styled(TextField)({
    width: '100%',
    maxWidth: '220px',
    marginBottom: '10px',
    '& .MuiOutlinedInput-root': {
        height: '42px',
        borderRadius: '27px',
        background: '#fff',
        '& fieldset': { borderColor: '#e1e6eb' },
        '&:hover fieldset': { borderColor: '#e1e6eb' },
        '&.Mui-focused fieldset': { borderColor: '#148aa0' },
    },
    '& .MuiInputBase-input': {
        padding: '0 45px 0 28px',
        fontSize: '15px',
        color: '#6d7884',
    },
});

const SearchButton = styled(Button)({
    width: '200px',
    height: '42px',
    marginTop: '2px',
    borderRadius: '23px',
    background: '#148aa0',
    color: '#fff',
    fontWeight: 700,
    fontSize: '15px',
    textTransform: 'none',
    '&:hover': { background: '#0b7890' },
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const SidebarSearch = ({ onSearch }) => {
    const [profil, setProfil] = useState('');
    const [domaine, setDomaine] = useState('');
    const [date, setDate] = useState('');

    const handleSearch = () => {
        const filters = {};
        if (profil) filters.profil = profil;
        if (domaine) filters.domaine = domaine;
        if (date) filters.date = date;

        console.log('🔍 Recherche avec filtres:', filters);

        if (onSearch) {
            onSearch(filters);
        } else {
            alert('🔍 Fonctionnalité de recherche (bientôt disponible)');
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
            />

            <SearchField
                select
                value={domaine}
                onChange={(e) => setDomaine(e.target.value)}
                variant="outlined"
            >
                <MenuItem value="">* Sélectionner</MenuItem>
                <MenuItem value="Informatique">Informatique</MenuItem>
                <MenuItem value="Audiovisuel">Audiovisuel</MenuItem>
                <MenuItem value="Gestion">Gestion</MenuItem>
                <MenuItem value="Communication">Communication</MenuItem>
                <MenuItem value="Marketing">Marketing</MenuItem>
                <MenuItem value="Finance">Finance</MenuItem>
            </SearchField>

            <DateField
                placeholder="jj/mm/aaaa"
                variant="outlined"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                InputProps={{
                    endAdornment: (
                        <InputAdornment
                            position="end"
                            sx={{
                                position: 'absolute',
                                right: 16,
                                color: '#333',
                                pointerEvents: 'none',
                            }}
                        >
                            <i className="fa-solid fa-calendar"></i>
                        </InputAdornment>
                    ),
                }}
            />

            <SearchButton onClick={handleSearch}>
                Recherche
            </SearchButton>
        </SearchCard>
    );
};

export default SidebarSearch;