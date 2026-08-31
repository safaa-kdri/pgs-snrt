import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Box, Button, CircularProgress, Container, Paper, Stack, Typography } from '@mui/material';
import { Add, ArrowBack, Check, Download, DragIndicator, Send } from '@mui/icons-material';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.js';
import api from '../../services/api';

const configuredApiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';
const apiOrigin = configuredApiUrl.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');
const stampPath = `${apiOrigin}/uploads/images/Signature-et-cachet-1.png`;
const defaultStamp = { left: 55, top: 240, width: 170, height: 72 };

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const SignConvention = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const surfaceRef = useRef(null);
    const interactionRef = useRef(null);
    const renderTaskRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [pdfPage, setPdfPage] = useState(null);
    const [stampVisible, setStampVisible] = useState(false);
    const [stamp, setStamp] = useState(defaultStamp);
    const [saved, setSaved] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        let cancelled = false;
        const loadPdf = async () => {
            try {
                const response = await api.get(`/users/convention/${id}/download`, { responseType: 'arraybuffer' });
                const document = await pdfjsLib.getDocument({ data: new Uint8Array(response.data) }).promise;
                const page = await document.getPage(1);
                if (!cancelled) setPdfPage(page);
            } catch (loadError) {
                if (!cancelled) setError('Impossible de charger la convention.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        loadPdf();
        return () => { cancelled = true; };
    }, [id]);

    useEffect(() => {
        if (!pdfPage || !canvasRef.current) return;
        let disposed = false;

        const renderPage = async () => {
            const previousTask = renderTaskRef.current;
            if (previousTask) {
                previousTask.cancel();
                try {
                    await previousTask.promise;
                } catch (renderError) {
                    if (renderError?.name !== 'RenderingCancelledException') throw renderError;
                }
            }

            if (disposed || !canvasRef.current) return;
            const viewport = pdfPage.getViewport({ scale: 1.35 });
            const canvas = canvasRef.current;
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const renderTask = pdfPage.render({ canvasContext: canvas.getContext('2d'), viewport });
            renderTaskRef.current = renderTask;

            try {
                await renderTask.promise;
            } catch (renderError) {
                if (!disposed && renderError?.name !== 'RenderingCancelledException') setError('Impossible d’afficher la convention.');
            }
        };

        renderPage().catch(() => {
            if (!disposed) setError('Impossible d’afficher la convention.');
        });

        return () => {
            disposed = true;
            renderTaskRef.current?.cancel();
        };
    }, [pdfPage]);

    const beginInteraction = (event, mode) => {
        event.preventDefault();
        event.stopPropagation();
        interactionRef.current = {
            mode,
            startX: event.clientX,
            startY: event.clientY,
            initial: { ...stamp },
        };
        window.addEventListener('pointermove', moveStamp);
        window.addEventListener('pointerup', endInteraction, { once: true });
    };

    const moveStamp = (event) => {
        const interaction = interactionRef.current;
        const surface = surfaceRef.current;
        if (!interaction || !surface) return;
        const scale = surface.clientWidth / canvasRef.current.width;
        const deltaX = (event.clientX - interaction.startX) / scale;
        const deltaY = (event.clientY - interaction.startY) / scale;
        const initial = interaction.initial;
        if (interaction.mode === 'move') {
            setStamp({ ...initial, left: Math.max(0, initial.left + deltaX), top: Math.max(0, initial.top + deltaY) });
        } else {
            setStamp({ ...initial, width: Math.max(70, initial.width + deltaX), height: Math.max(35, initial.height + deltaY) });
        }
        setSaved(false);
    };

    const endInteraction = () => {
        interactionRef.current = null;
        window.removeEventListener('pointermove', moveStamp);
    };

    const handleSavePlacement = async () => {
        setGenerating(false);
        try {
            const canvas = canvasRef.current;
            const pdfWidth = pdfPage?.getViewport({ scale: 1 }).width || canvas?.width || 1;
            const pdfScale = (canvas?.width || pdfWidth) / pdfWidth;
            await api.put(`/users/convention/${id}/signer`, {
                position: {
                    x: Number((stamp.left / pdfScale).toFixed(2)),
                    y: Number((stamp.top / pdfScale).toFixed(2)),
                    width: Number((stamp.width / pdfScale).toFixed(2)),
                    height: Number((stamp.height / pdfScale).toFixed(2)),
                    page: 0,
                },
            });
            setSaved(true);
            setNotice('Placement enregistré. Vous pouvez générer le PDF signé.');
        } catch (saveError) {
            setError(saveError.response?.data?.message || 'Impossible d’enregistrer le placement.');
        }
    };

    const canvasDisplayScale = canvasRef.current?.width
        ? (surfaceRef.current?.clientWidth || canvasRef.current.width) / canvasRef.current.width
        : 1;

    const handleGenerate = async () => {
        setGenerating(true);
        setError('');

        try {
            const response = await api.get(`/users/convention/${id}/sign-pdf`, {
                responseType: 'blob',
                validateStatus: (status) => status >= 200 && status < 500,
            });

            const contentType = response.headers?.['content-type'] || response.data?.type || '';
            const pdfBlob = response.data instanceof Blob
                ? response.data
                : new Blob([response.data], { type: 'application/pdf' });

            if (response.status >= 400 || !contentType.includes('pdf')) {
                const rawText = await pdfBlob.text().catch(() => '');
                let message = 'Impossible de générer le PDF signé.';

                if (rawText) {
                    try {
                        const parsed = JSON.parse(rawText);
                        message = parsed?.message || parsed?.error || message;
                    } catch {
                        message = rawText.replace(/<[^>]+>/g, '').trim() || message;
                    }
                }

                throw new Error(message);
            }

            const pdfUrl = window.URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = pdfUrl;
            link.download = `Convention_Signee_${Date.now()}.pdf`;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.setTimeout(() => window.URL.revokeObjectURL(pdfUrl), 60000);

            setNotice('Le PDF signé a été téléchargé. Vous pouvez l’ouvrir depuis votre disque local.');
        } catch (generateError) {
            const message = generateError.response?.data?.message || generateError.message || 'Impossible de générer le PDF signé.';
            setError(message);
        } finally {
            setGenerating(false);
        }
    };

    const handleSendToStudent = async () => {
        setSending(true);
        try {
            await api.put(`/users/convention/${id}/envoyer-etudiant`);
            setNotice('La dernière version signée a été renvoyée à l’étudiant.');
            setError('');
        } catch (sendError) {
            setError(sendError.response?.data?.message || 'Impossible de renvoyer la convention à l’étudiant.');
        } finally {
            setSending(false);
        }
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a2332' }}>Signature de la convention</Typography>
                    <Typography color="text.secondary">Placez le cachet officiel sur la zone prévue du document.</Typography>
                </Box>
                <Button startIcon={<ArrowBack />} onClick={() => navigate('/rh/generate-convention')}>Retour</Button>
            </Stack>
            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {notice && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setNotice('')}>{notice}</Alert>}
            <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="flex-start">
                    <Box sx={{ flex: 1, minWidth: 0, overflow: 'auto', background: '#eef1f3', p: 2, textAlign: 'center' }}>
                        {loading && <CircularProgress />}
                        {!loading && pdfPage && (
                            <Box ref={surfaceRef} sx={{ position: 'relative', display: 'inline-block', lineHeight: 0, boxShadow: 2 }}>
                                <canvas ref={canvasRef} />
                                {stampVisible && (
                                    <Box
                                        onPointerDown={(event) => beginInteraction(event, 'move')}
                                        sx={{ position: 'absolute', left: stamp.left * canvasDisplayScale, top: stamp.top * canvasDisplayScale, width: stamp.width * canvasDisplayScale, height: stamp.height * canvasDisplayScale, cursor: 'move', border: '1px dashed #176b80', background: 'rgba(255,255,255,.35)', touchAction: 'none' }}
                                    >
                                        <img src={stampPath} alt="Cachet officiel" draggable="false" style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }} />
                                        <Box onPointerDown={(event) => beginInteraction(event, 'resize')} sx={{ position: 'absolute', right: -7 * canvasDisplayScale, bottom: -7 * canvasDisplayScale, width: 14 * canvasDisplayScale, height: 14 * canvasDisplayScale, borderRadius: '50%', background: '#176b80', cursor: 'nwse-resize' }} />
                                    </Box>
                                )}
                            </Box>
                        )}
                    </Box>
                    <Stack spacing={2} sx={{ width: { xs: '100%', md: 280 } }}>
                        <Typography variant="h6">Actions de signature</Typography>
                        <Button variant="outlined" startIcon={<Add />} onClick={() => { setStampVisible(true); setSaved(false); }}>Ajouter le cachet</Button>
                        <Typography variant="body2" color="text.secondary">Faites glisser le cachet avec la souris. Utilisez la poignée située en bas à droite pour le redimensionner.</Typography>
                        <Button variant="contained" startIcon={<Check />} disabled={!stampVisible || saved} onClick={handleSavePlacement}>Enregistrer le placement</Button>
                        <Button variant="contained" color="success" startIcon={<Download />} disabled={!saved || generating} onClick={handleGenerate}>{generating ? 'Génération...' : 'Générer le PDF signé'}</Button>
                        <Button variant="outlined" color="primary" startIcon={<Send />} disabled={!saved || generating || sending} onClick={handleSendToStudent}>{sending ? 'Envoi...' : 'Renvoyer à l’étudiant'}</Button>
                        <Button startIcon={<DragIndicator />} onClick={() => setStamp({ ...defaultStamp })}>Réinitialiser la position</Button>
                    </Stack>
                </Stack>
            </Paper>
        </Container>
    );
};

export default SignConvention;
