// src/components/student/Notifications.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Paper,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    ListItemIcon,
    Avatar,
    Chip,
    Button,
    IconButton,
    CircularProgress,
    Tooltip,
    Alert,
    Tab,
    Tabs,
    Badge,
    Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    Refresh,
    CheckCircle,
    Pending,
    Cancel,
    Work,
    Event,
    Description,
    Delete,
    DoneAll,
    NotificationsActive,
    NotificationsOff,
    ArrowForward,
    Circle,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

// ============================================
// STYLES
// ============================================

const PageHeader = styled(Box)({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
});

const NotificationItem = styled(ListItem)(({ read }) => ({
    backgroundColor: read ? 'transparent' : '#f0f7fa',
    borderRadius: '12px',
    marginBottom: '8px',
    transition: 'all 0.2s ease',
    '&:hover': {
        backgroundColor: '#e8f0fe',
    },
}));

const TabPanel = styled(Box)({
    padding: '16px 0',
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const Notifications = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const [filteredNotifications, setFilteredNotifications] = useState([]);
    const [tabValue, setTabValue] = useState(0);
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchNotifications();
    }, []);

    useEffect(() => {
        filterNotifications();
    }, [notifications, tabValue]);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 600));

            const mockNotifications = [
                {
                    id: '1',
                    type: 'application',
                    title: 'Candidature acceptée',
                    message: 'Votre candidature pour le stage "Développement Web" a été acceptée.',
                    date: '2026-07-18T10:30:00',
                    read: false,
                    icon: '✅',
                    link: '/dashboard/application/1',
                },
                {
                    id: '2',
                    type: 'interview',
                    title: 'Entretien programmé',
                    message: 'Un entretien a été programmé pour le stage "Data Science" le 20/07/2026 à 10h.',
                    date: '2026-07-17T14:20:00',
                    read: false,
                    icon: '🎯',
                    link: '/dashboard/interview/2',
                },
                {
                    id: '3',
                    type: 'offer',
                    title: 'Nouvelle offre disponible',
                    message: 'Une nouvelle offre de stage "Cybersécurité" vient d\'être publiée.',
                    date: '2026-07-16T09:00:00',
                    read: true,
                    icon: '🆕',
                    link: '/offres/3',
                },
                {
                    id: '4',
                    type: 'application',
                    title: 'Candidature refusée',
                    message: 'Votre candidature pour le stage "Marketing Digital" a été refusée.',
                    date: '2026-07-15T16:45:00',
                    read: true,
                    icon: '❌',
                    link: '/dashboard/application/4',
                },
                {
                    id: '5',
                    type: 'document',
                    title: 'Document validé',
                    message: 'Votre document "CV" a été validé par le service RH.',
                    date: '2026-07-14T11:30:00',
                    read: true,
                    icon: '📄',
                    link: '/dashboard/documents',
                },
                {
                    id: '6',
                    type: 'interview',
                    title: 'Rappel entretien',
                    message: 'Rappel : Entretien pour le stage "Data Science" demain à 10h.',
                    date: '2026-07-13T08:00:00',
                    read: true,
                    icon: '⏰',
                    link: '/dashboard/interview/2',
                },
            ];

            setNotifications(mockNotifications);
            setFilteredNotifications(mockNotifications);

        } catch (error) {
            console.error('Erreur chargement notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterNotifications = () => {
        let filtered = [...notifications];
        if (tabValue === 1) {
            filtered = filtered.filter((n) => !n.read);
        } else if (tabValue === 2) {
            filtered = filtered.filter((n) => n.read);
        }
        setFilteredNotifications(filtered);
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleMarkAsRead = (id) => {
        setNotifications(
            notifications.map((n) =>
                n.id === id ? { ...n, read: true } : n
            )
        );
        setSuccess('✅ Notification marquée comme lue');
        setTimeout(() => setSuccess(''), 2000);
    };

    const handleMarkAllAsRead = () => {
        setNotifications(
            notifications.map((n) => ({ ...n, read: true }))
        );
        setSuccess('✅ Toutes les notifications ont été marquées comme lues');
        setTimeout(() => setSuccess(''), 2000);
    };

    const handleDeleteNotification = (id) => {
        setNotifications(notifications.filter((n) => n.id !== id));
        setSuccess('✅ Notification supprimée');
        setTimeout(() => setSuccess(''), 2000);
    };

    const handleNotificationClick = (notification) => {
        if (!notification.read) {
            handleMarkAsRead(notification.id);
        }
        if (notification.link) {
            navigate(notification.link);
        }
    };

    const getTimeAgo = (date) => {
        const diff = Date.now() - new Date(date).getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'À l\'instant';
        if (minutes < 60) return `Il y a ${minutes} min`;
        if (hours < 24) return `Il y a ${hours} h`;
        return `Il y a ${days} j`;
    };

    const unreadCount = notifications.filter((n) => !n.read).length;

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <CircularProgress size={60} thickness={4} sx={{ color: '#148aa0' }} />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* ===== EN-TÊTE ===== */}
            <PageHeader>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a2332' }}>
                        🔔 Notifications
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {unreadCount} notification(s) non lue(s)
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    {unreadCount > 0 && (
                        <Button
                            variant="outlined"
                            startIcon={<DoneAll />}
                            onClick={handleMarkAllAsRead}
                            sx={{ borderRadius: '12px', textTransform: 'none' }}
                        >
                            Tout marquer comme lu
                        </Button>
                    )}
                    <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={fetchNotifications}
                        disabled={loading}
                        sx={{ borderRadius: '12px', textTransform: 'none' }}
                    >
                        Rafraîchir
                    </Button>
                </Box>
            </PageHeader>

            {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '10px' }}>{success}</Alert>}

            {/* ===== TABS ===== */}
            <Paper sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    sx={{
                        borderBottom: '1px solid #e5e7eb',
                        px: 2,
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontWeight: 500,
                            minHeight: '48px',
                        },
                        '& .Mui-selected': {
                            color: '#148aa0',
                        },
                        '& .MuiTabs-indicator': {
                            backgroundColor: '#148aa0',
                        },
                    }}
                >
                    <Tab
                        label={
                            <Badge badgeContent={unreadCount} color="error" sx={{ '& .MuiBadge-badge': { fontSize: 10 } }}>
                                Toutes
                            </Badge>
                        }
                    />
                    <Tab label="Non lues" />
                    <Tab label="Lues" />
                </Tabs>

                {/* ===== LISTE DES NOTIFICATIONS ===== */}
                <TabPanel>
                    {filteredNotifications.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 6 }}>
                            <NotificationsOff sx={{ fontSize: 60, color: '#d1d5db' }} />
                            <Typography variant="h6" sx={{ color: '#1a2332', mt: 2 }}>
                                Aucune notification
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {tabValue === 1 ? 'Vous avez lu toutes vos notifications' : 'Aucune notification à afficher'}
                            </Typography>
                        </Box>
                    ) : (
                        <List sx={{ p: 2 }}>
                            {filteredNotifications.map((notification) => (
                                <NotificationItem
                                    key={notification.id}
                                    read={notification.read}
                                    onClick={() => handleNotificationClick(notification)}
                                    sx={{ cursor: 'pointer' }}
                                >
                                    <ListItemAvatar>
                                        <Avatar sx={{ backgroundColor: notification.read ? '#e5e7eb' : '#148aa0' }}>
                                            <Typography variant="body2">{notification.icon}</Typography>
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography
                                                    variant="body2"
                                                    fontWeight={notification.read ? 400 : 600}
                                                    color={notification.read ? 'text.secondary' : 'text.primary'}
                                                >
                                                    {notification.title}
                                                </Typography>
                                                {!notification.read && (
                                                    <Circle sx={{ fontSize: 8, color: '#148aa0' }} />
                                                )}
                                            </Box>
                                        }
                                        secondary={
                                            <>
                                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                                    {notification.message}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                                    {getTimeAgo(notification.date)}
                                                </Typography>
                                            </>
                                        }
                                    />
                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                        {!notification.read && (
                                            <Tooltip title="Marquer comme lu">
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleMarkAsRead(notification.id);
                                                    }}
                                                    sx={{ color: '#148aa0' }}
                                                >
                                                    <CheckCircle fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        <Tooltip title="Supprimer">
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteNotification(notification.id);
                                                }}
                                                sx={{ color: '#ef4444' }}
                                            >
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        {notification.link && (
                                            <Tooltip title="Voir">
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(notification.link);
                                                    }}
                                                    sx={{ color: '#4f46e5' }}
                                                >
                                                    <ArrowForward fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </Box>
                                </NotificationItem>
                            ))}
                        </List>
                    )}
                </TabPanel>
            </Paper>
        </Container>
    );
};

export default Notifications;