// src/components/rh/Notifications.jsx
// ✅ PAGE DES NOTIFICATIONS RH - SANS EMOJIS - UNIQUEMENT CONVENTION ET RAPPORT

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Button,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Check,
  Delete,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

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

const PageTitle = styled(Typography)({
  fontWeight: 700,
  fontSize: '24px',
  color: '#1a2332',
  letterSpacing: '-0.02em',
});

const NotificationItem = styled(ListItem)(({ read }) => ({
  padding: '16px 20px',
  backgroundColor: read ? 'transparent' : '#f8fafc',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  borderLeft: read ? '3px solid transparent' : '3px solid #2563eb',
  '&:hover': {
    backgroundColor: '#f1f5f9',
  },
}));

const NotificationDot = styled(Box)({
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  backgroundColor: '#dc2626',
  flexShrink: 0,
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const RhNotifications = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await api.get('/notifications');
      // Les notifications internes utilisent type "InApp" ; le titre identifie l'événement métier.
      const filtered = (response.data?.data || []).filter(
        n => n.type === 'CONVENTION_DEPOSEE' ||
             n.type === 'RAPPORT_DEPOSE' ||
             n.type === 'Convention déposée' ||
             n.type === 'Rapport déposé' ||
             n.titre === 'Rapport de stage à valider'
      );
      setNotifications(filtered);
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
      setError('Erreur lors du chargement des notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, lue: true } : n)
      );
    } catch (error) {
      console.error('Erreur marquage lecture:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev =>
        prev.map(n => ({ ...n, lue: true }))
      );
    } catch (error) {
      console.error('Erreur marquage lecture:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.lue) {
      markAsRead(notification._id);
    }
    if (notification.lien) {
      navigate(notification.lien);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress size={44} sx={{ color: '#2563eb' }} />
      </Box>
    );
  }

  const unreadCount = notifications.filter(n => !n.lue).length;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <PageHeader>
        <Box>
          <PageTitle>Notifications</PageTitle>
          <Typography variant="body2" color="#64748b">
            {unreadCount > 0 ? `${unreadCount} notification(s) non lue(s)` : 'Aucune notification non lue'}
          </Typography>
        </Box>
        {unreadCount > 0 && (
          <Button
            variant="outlined"
            startIcon={<Check />}
            onClick={markAllAsRead}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              borderColor: '#cbd5e1',
              color: '#475569',
              '&:hover': {
                borderColor: '#2563eb',
                color: '#2563eb',
                backgroundColor: '#eff6ff',
              },
            }}
          >
            Tout marquer comme lu
          </Button>
        )}
      </PageHeader>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>{error}</Alert>}

      {notifications.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: '12px', border: '1px solid #eef1f3' }}>
          <Typography variant="h6" color="#64748b" sx={{ mt: 2 }}>
            Aucune notification
          </Typography>
          <Typography variant="body2" color="#94a3b8">
            Vous serez notifié lorsqu'une convention ou un rapport sera déposé.
          </Typography>
        </Paper>
      ) : (
        <Paper sx={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #eef1f3' }}>
          <List sx={{ p: 0 }}>
            {notifications.map((notif, index) => (
              <React.Fragment key={notif._id}>
                {index > 0 && <Divider />}
                <NotificationItem
                  read={notif.lue}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <Typography variant="body1" fontWeight={notif.lue ? 400 : 600} color="#1a2332">
                          {notif.titre || 'Notification'}
                        </Typography>
                        <Chip
                          label="Nouveau"
                          size="small"
                          sx={{
                            backgroundColor: '#dbeafe',
                            color: '#1d4ed8',
                            height: 20,
                            fontSize: '10px',
                            fontWeight: 600,
                            '& .MuiChip-label': { px: 1.5 }
                          }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="#64748b" sx={{ mt: 0.5 }}>
                          {notif.message}
                        </Typography>
                        <Typography variant="caption" color="#94a3b8" sx={{ display: 'block', mt: 0.5 }}>
                          {new Date(notif.createdAt).toLocaleString('fr-FR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Typography>
                      </Box>
                    }
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {!notif.lue && <NotificationDot />}
                    <Tooltip title="Supprimer">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notif._id);
                        }}
                        sx={{ color: '#94a3b8', '&:hover': { color: '#dc2626' } }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </NotificationItem>
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}
    </Container>
  );
};

export default RhNotifications;