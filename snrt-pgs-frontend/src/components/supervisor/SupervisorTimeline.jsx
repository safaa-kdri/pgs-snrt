// src/components/supervisor/SupervisorTimeline.jsx
// ✅ Composant : Journal de suivi pour l'encadrant

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    CircularProgress,
    Avatar,
    Divider,
    Alert,
    IconButton,
    Tooltip,
    Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Send, AttachFile, Delete, CheckCircle } from '@mui/icons-material';
import { getTimeline, postTimelineMessage } from '../../services/api';

// ============================================
// STYLES
// ============================================

const TimelineContainer = styled(Box)({
    maxHeight: '500px',
    overflowY: 'auto',
    paddingRight: '8px',
    '&::-webkit-scrollbar': {
        width: '6px',
    },
    '&::-webkit-scrollbar-thumb': {
        backgroundColor: '#d1d5db',
        borderRadius: '3px',
    },
});

const MessageItem = styled(Box)(({ isOwn }) => ({
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
    flexDirection: isOwn ? 'row-reverse' : 'row',
    '& .message-content': {
        backgroundColor: isOwn ? '#e8f4f8' : '#f7f7f7',
        borderRadius: isOwn ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
        padding: '12px 16px',
        maxWidth: '75%',
    },
}));

const MessageInput = styled(Box)({
    display: 'flex',
    gap: '12px',
    marginTop: '16px',
    '& .MuiTextField-root': {
        flex: 1,
    },
});

const FilePreview = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '4px 12px 4px 8px',
    backgroundColor: '#e5e7eb',
    borderRadius: '6px',
    fontSize: '12px',
    marginTop: '4px',
});

// ============================================
// COMPOSANT
// ============================================

const SupervisorTimeline = ({ internshipId, user }) => {
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileInputRef, setFileInputRef] = useState(null);

    useEffect(() => {
        fetchTimeline();
    }, [internshipId]);

    const fetchTimeline = async () => {
        setLoading(true);
        try {
            const data = await getTimeline(internshipId);
            setMessages(data);
        } catch (error) {
            console.error('❌ Erreur chargement timeline:', error);
            setError('Erreur lors du chargement du journal');
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        if (!newMessage.trim() && !selectedFile) {
            setError('Veuillez saisir un message ou joindre un fichier');
            return;
        }

        setSending(true);
        setError('');
        try {
            const result = await postTimelineMessage(internshipId, newMessage, selectedFile);
            if (result) {
                setMessages([result, ...messages]);
                setNewMessage('');
                setSelectedFile(null);
                if (fileInputRef) {
                    fileInputRef.value = '';
                }
            }
        } catch (error) {
            console.error('❌ Erreur envoi message:', error);
            setError(error.response?.data?.message || 'Erreur lors de l\'envoi');
        } finally {
            setSending(false);
        }
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('Le fichier ne doit pas dépasser 5 Mo');
                return;
            }
            setSelectedFile(file);
            setError('');
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getInitials = (nom, prenom) => {
        if (!nom && !prenom) return '?';
        return `${(prenom || '')[0] || ''}${(nom || '')[0] || ''}`.toUpperCase() || '?';
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={32} sx={{ color: '#2d3748' }} />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#1a2332' }}>
                💬 Journal de suivi
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            <TimelineContainer>
                {messages.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                        Aucun message. Commencez la conversation !
                    </Typography>
                ) : (
                    messages.map((msg) => {
                        const isOwn = msg.auteurId?._id === user?.id;
                        const isEtudiant = msg.auteurRole === 'Etudiant';
                        return (
                            <MessageItem key={msg._id} isOwn={isOwn}>
                                <Avatar
                                    sx={{
                                        width: 36,
                                        height: 36,
                                        backgroundColor: isOwn ? '#2d3748' : isEtudiant ? '#148aa0' : '#6b7280',
                                        fontSize: 14,
                                        fontWeight: 600,
                                    }}
                                >
                                    {isOwn ? 'Moi' : getInitials(msg.auteurId?.nom, msg.auteurId?.prenom)}
                                </Avatar>
                                <Box className="message-content">
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                            {isOwn ? 'Moi (Encadrant)' : `${msg.auteurId?.prenom || ''} ${msg.auteurId?.nom || ''}`}
                                            {isEtudiant && (
                                                <Chip
                                                    label="Étudiant"
                                                    size="small"
                                                    sx={{ ml: 1, fontSize: '9px', height: '18px', backgroundColor: '#dbeafe', color: '#1d4ed8' }}
                                                />
                                            )}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {formatDate(msg.date)}
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                                        {msg.message}
                                    </Typography>
                                    {msg.fichier && (
                                        <FilePreview>
                                            <AttachFile sx={{ fontSize: 16 }} />
                                            <Typography variant="caption">
                                                {msg.fichier.nom || 'Fichier joint'}
                                            </Typography>
                                            <Tooltip title="Télécharger">
                                                <IconButton size="small" sx={{ ml: 1 }}>
                                                    <CheckCircle sx={{ fontSize: 14, color: '#22c55e' }} />
                                                </IconButton>
                                            </Tooltip>
                                        </FilePreview>
                                    )}
                                    {msg.estAutomatique && (
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                            ⚡ Message automatique
                                        </Typography>
                                    )}
                                </Box>
                            </MessageItem>
                        );
                    })
                )}
            </TimelineContainer>

            <Divider sx={{ my: 2 }} />

            <MessageInput>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Écrire un message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    disabled={sending}
                    sx={{
                        '& .MuiOutlinedInput-root': { borderRadius: '10px' },
                    }}
                />
                <input
                    type="file"
                    hidden
                    ref={(ref) => setFileInputRef(ref)}
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <Tooltip title="Joindre un fichier">
                    <Button
                        variant="outlined"
                        onClick={() => fileInputRef?.click()}
                        disabled={sending}
                        sx={{ borderRadius: '10px', minWidth: '44px', padding: '8px' }}
                    >
                        <AttachFile />
                    </Button>
                </Tooltip>
                <Button
                    variant="contained"
                    onClick={handleSend}
                    disabled={sending || (!newMessage.trim() && !selectedFile)}
                    sx={{
                        backgroundColor: '#2d3748',
                        borderRadius: '10px',
                        textTransform: 'none',
                        '&:hover': { backgroundColor: '#1a202c' },
                    }}
                >
                    {sending ? <CircularProgress size={20} color="inherit" /> : <Send />}
                </Button>
            </MessageInput>

            {selectedFile && (
                <FilePreview sx={{ mt: 1 }}>
                    <AttachFile sx={{ fontSize: 16 }} />
                    <Typography variant="caption">{selectedFile.name}</Typography>
                    <IconButton size="small" onClick={() => setSelectedFile(null)}>
                        <Delete sx={{ fontSize: 14, color: '#ef4444' }} />
                    </IconButton>
                </FilePreview>
            )}

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                📌 Formats acceptés : PDF, DOC, DOCX, JPG, PNG (max 5 Mo)
            </Typography>
        </Box>
    );
};

export default SupervisorTimeline;