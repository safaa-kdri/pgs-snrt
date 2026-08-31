import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Button, CircularProgress, Container, IconButton, Paper, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography } from '@mui/material';
import { Download, Edit, Visibility } from '@mui/icons-material';
import api from '../../services/api';

const GenerateConvention = () => {
    const navigate = useNavigate();
    const [conventions, setConventions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchConventions = async () => {
        try {
            const response = await api.get('/users/conventions');
            setConventions(response.data?.data || []);
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Erreur lors du chargement des conventions.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchConventions(); }, []);

    const buildFileHref = (convention) => {
        const apiRoot = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1').replace(/\/api\/v1\/?$/, '');
        if (convention?.url) return convention.url.startsWith('/') ? `${apiRoot}${convention.url}` : convention.url;
        if (convention?.gridFsId) return `${apiRoot}/api/v1/documents/file/${convention.gridFsId}`;
        return null;
    };

    const openConvention = async (item) => {
        try {
            const endpoint = 'download';
            const response = await api.get(`/users/convention/${item._id}/${endpoint}`, { responseType: 'blob' });
            const blob = response.data instanceof Blob ? response.data : new Blob([response.data], { type: 'application/pdf' });
            const type = blob.type || response.headers?.['content-type'] || '';
            if (!type.includes('pdf')) {
                throw new Error('La réponse serveur n’est pas un PDF valide');
            }
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank', 'noopener,noreferrer');
            setTimeout(() => window.URL.revokeObjectURL(url), 5000);
            setError('');
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Erreur lors de l’ouverture de la convention.');
        }
    };

    const downloadConvention = async (item) => {
        try {
            const endpoint = 'download';
            const response = await api.get(`/users/convention/${item._id}/${endpoint}`, { responseType: 'blob' });
            const blob = response.data instanceof Blob ? response.data : new Blob([response.data], { type: 'application/pdf' });
            const type = blob.type || response.headers?.['content-type'] || '';
            if (!type.includes('pdf')) {
                throw new Error('La réponse serveur n’est pas un PDF valide');
            }
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Convention_${item.etudiantId?.nom || 'stage'}.pdf`;
            link.click();
            window.URL.revokeObjectURL(url);
            setError('');
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Erreur lors du téléchargement de la convention.');
        }
    };

    if (loading) return <Container sx={{ py: 6, textAlign: 'center' }}><CircularProgress /></Container>;

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a2332', mb: 1 }}>Gestion des conventions</Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>{conventions.length} convention(s) déposée(s) par les étudiants</Typography>
            {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}
            <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <Table>
                    <TableHead><TableRow><TableCell>Étudiant</TableCell><TableCell>Stage</TableCell><TableCell>Date de dépôt</TableCell><TableCell>Statut</TableCell><TableCell align="center">Actions</TableCell></TableRow></TableHead>
                    <TableBody>
                        {conventions.map((item) => {
                            const status = item.convention?.statut || 'NonGeneree';
                            return <TableRow key={item._id} hover>
                                <TableCell>{item.etudiantId?.prenom} {item.etudiantId?.nom}<br /><Typography variant="caption" color="text.secondary">{item.etudiantId?.email}</Typography></TableCell>
                                <TableCell>{item.offreId?.titre || 'Stage sans titre'}</TableCell>
                                <TableCell>{item.convention?.dateDepot ? new Date(item.convention.dateDepot).toLocaleDateString('fr-FR') : '-'}</TableCell>
                                <TableCell>{status}</TableCell>
                                <TableCell align="center">
                                    <Tooltip title="Consulter le PDF"><IconButton onClick={() => openConvention(item)}><Visibility /></IconButton></Tooltip>
                                    <Tooltip title="Télécharger"><IconButton onClick={() => downloadConvention(item)}><Download /></IconButton></Tooltip>
                                    <Tooltip title="Modifier la signature"><IconButton color="primary" onClick={() => navigate(`/rh/convention/${item._id}/sign`)}><Edit /></IconButton></Tooltip>
                                </TableCell>
                            </TableRow>;
                        })}
                    </TableBody>
                </Table>
                {conventions.length === 0 && <Box sx={{ p: 5, textAlign: 'center' }}><Typography color="text.secondary">Aucune convention déposée</Typography></Box>}
            </Paper>
        </Container>
    );
};

export default GenerateConvention;
