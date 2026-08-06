// src/components/rh/OfferDetailPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  ArrowBack,
  Work,
  Business,
  CalendarToday,
  People,
  Description,
  CheckCircle,
  Pending,
  Cancel,
  Visibility,
  Edit,
  Archive,
  Delete,
  School,
  LocationOn,
  Event,
  ThumbUp,
  ThumbDown,
  Send,
  Print,
} from "@mui/icons-material";
import { useAuth } from "../../hooks/useAuth";
import api from "../../services/api";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// ============================================
// STYLES
// ============================================

const PageHeader = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "24px",
  flexWrap: "wrap",
  gap: "16px",
});

const InfoCard = styled(Paper)({
  borderRadius: "16px",
  padding: "20px 24px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  border: "1px solid #eef1f3",
  marginBottom: "24px",
});

// ❌ BANNIÈRE SUPPRIMÉE

const StatusChip = styled(Chip)(({ status }) => {
  const colors = {
    EnAttente: { bg: "#fef3c7", text: "#d97706" },
    Publiee: { bg: "#d1fae5", text: "#065f46" },
    Refusee: { bg: "#fee2e2", text: "#991b1b" },
    Brouillon: { bg: "#e5e7eb", text: "#6b7280" },
    Archivee: { bg: "#f3f4f6", text: "#6b7280" },
  };
  const color = colors[status] || colors["EnAttente"];
  return {
    backgroundColor: color.bg,
    color: color.text,
    fontWeight: 600,
    fontSize: "12px",
    height: "28px",
    padding: "0 14px",
  };
});

const InfoRow = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "6px 0",
  "& .MuiSvgIcon-root": {
    color: "#687480",
    fontSize: "18px",
  },
});

const StyledTableCell = styled(TableCell)({
  fontWeight: 600,
  color: "#1a2332",
  fontSize: "13px",
});

const ActionButton = styled(Button)({
  borderRadius: "10px",
  textTransform: "none",
  fontWeight: 600,
  padding: "8px 20px",
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const OfferDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [offer, setOffer] = useState(null);
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openValidateDialog, setOpenValidateDialog] = useState(false);
  const [validationDecision, setValidationDecision] = useState("");
  const [validationComment, setValidationComment] = useState("");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchOfferDetails();
  }, [id]);

  const fetchOfferDetails = async () => {
    setLoading(true);
    setError("");
    try {
      const offerResponse = await api.get(`/offers/${id}`);
      if (offerResponse.data?.offer) {
        setOffer(offerResponse.data.offer);
      }

      try {
        const appsResponse = await api.get(`/applications?offreId=${id}`);
        if (appsResponse.data?.data) {
          setApplications(appsResponse.data.data);
        }
      } catch (appError) {
        console.warn("Erreur chargement candidatures:", appError);
        setApplications([]);
      }
    } catch (error) {
      console.error("Erreur chargement offre:", error);
      setError(error.response?.data?.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenValidateDialog = (decision) => {
    setValidationDecision(decision);
    setValidationComment("");
    setOpenValidateDialog(true);
  };

  const handleCloseValidateDialog = () => {
    setOpenValidateDialog(false);
    setValidationComment("");
    setValidationDecision("");
    setError("");
  };

  const handleValidateOffer = async () => {
    setGenerating(true);
    try {
      await api.put(`/offers/${id}/validate`, {
        decision: validationDecision,
        motifRefus: validationDecision === "Refusee" ? validationComment : undefined,
      });
      setSuccess(
        `Offre ${validationDecision === "Publiee" ? "publiee" : "refusee"} avec succes`
      );
      setOpenValidateDialog(false);
      fetchOfferDetails();
    } catch (error) {
      console.error("Erreur validation:", error);
      setError(error.response?.data?.message || "Erreur lors de la validation");
    } finally {
      setGenerating(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return format(new Date(dateStr), "dd MMM yyyy", { locale: fr });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "-";
    return format(new Date(dateStr), "dd MMM yyyy HH:mm", { locale: fr });
  };

  const getStatusLabel = (status) => {
    const labels = {
      EnAttente: "En attente",
      Publiee: "Publiee",
      Refusee: "Refusee",
      Brouillon: "Brouillon",
      Archivee: "Archivee",
    };
    return labels[status] || status;
  };

  const getTypeLabel = (type) => {
    const labels = {
      PFE: "PFE",
      PFA: "PFA",
      Initiation: "Initiation",
      Ete: "Ete",
      Master: "Master",
      Licence: "Licence",
      Technicien: "Technicien",
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
        }}
      >
        <CircularProgress size={60} thickness={4} sx={{ color: "#2d3748" }} />
      </Box>
    );
  }

  if (!offer) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ borderRadius: "12px" }}>
          Offre non trouvee
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/rh/validate-offers")}
          sx={{ mt: 2, color: "#2d3748" }}
        >
          Retour
        </Button>
      </Container>
    );
  }

  const isEnAttente = offer.statut === "EnAttente";
  const statusLabel = getStatusLabel(offer.statut);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* ===== HEADER ===== */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/rh/validate-offers")}
          sx={{ mb: 2, textTransform: "none", color: "#666" }}
        >
          Retour à la liste
        </Button>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: "10px" }}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: "10px" }}>
          {error}
        </Alert>
      )}

      {/* ===== CARTE INFORMATIONS OFFRE ===== */}
      <InfoCard>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 3, mb: 2 }}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              backgroundColor: "#2d3748",
              fontSize: 24,
              fontWeight: 700,
              color: "#fff",
            }}
          >
            <Work sx={{ fontSize: 32 }} />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#1a2332" }}>
              {offer.titre || "Offre sans titre"}
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
              <Chip
                label={getTypeLabel(offer.typeStage)}
                size="small"
                sx={{ backgroundColor: "#e0e7ff", color: "#4338ca" }}
              />
              <Chip
                label={`${offer.nbPostes} poste(s)`}
                size="small"
                sx={{ backgroundColor: "#f3e8ff", color: "#6b21a8" }}
              />
              <StatusChip status={offer.statut} label={statusLabel} />
            </Box>
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Creee le {formatDateTime(offer.createdAt)}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              Par {offer.createurId?.prenom || ""} {offer.createurId?.nom || ""}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <InfoRow>
              <Business />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Departement
                </Typography>
                <Typography variant="body2">
                  {offer.departementId?.nom || "-"}
                </Typography>
              </Box>
            </InfoRow>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <InfoRow>
              <CalendarToday />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Periode
                </Typography>
                <Typography variant="body2">
                  {offer.periodeId?.nom || "-"}
                </Typography>
              </Box>
            </InfoRow>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <InfoRow>
              <Event />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Date debut
                </Typography>
                <Typography variant="body2">
                  {formatDate(offer.dateDebut)}
                </Typography>
              </Box>
            </InfoRow>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <InfoRow>
              <Event />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Date fin
                </Typography>
                <Typography variant="body2">
                  {formatDate(offer.dateFin)}
                </Typography>
              </Box>
            </InfoRow>
          </Grid>
          <Grid item xs={12}>
            <InfoRow>
              <Description />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Date limite candidature
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {formatDate(offer.dateLimiteCandidature)}
                </Typography>
              </Box>
            </InfoRow>
          </Grid>
        </Grid>
      </InfoCard>

      {/* ❌ BANNIÈRE SUPPRIMÉE - Le statut est déjà affiché dans le chip en haut */}

      {/* ===== DESCRIPTION ===== */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              borderRadius: "16px",
              padding: "24px",
              border: "1px solid #eef1f3",
              boxShadow: "none",
              height: "100%",
            }}
          >
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Description
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              {offer.description || "Aucune description"}
            </Typography>

            {offer.sujets && offer.sujets.length > 0 && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                  Sujets de stage
                </Typography>
                {offer.sujets.map((sujet, index) => (
                  <Box
                    key={index}
                    sx={{
                      mb: 2,
                      pb: 2,
                      borderBottom:
                        index < offer.sujets.length - 1
                          ? "1px solid #eef1f3"
                          : "none",
                    }}
                  >
                    <Typography variant="body1" fontWeight={600} color="#1a2332">
                      {sujet.titre}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {sujet.description}
                    </Typography>
                    {sujet.competences && sujet.competences.length > 0 && (
                      <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {sujet.competences.map((comp, i) => (
                          <Chip
                            key={i}
                            label={comp.nom}
                            size="small"
                            sx={{ backgroundColor: "#f3e8ff", color: "#6b21a8" }}
                          />
                        ))}
                      </Box>
                    )}
                  </Box>
                ))}
              </>
            )}
          </Paper>
        </Grid>

        {/* ===== CANDIDATURES ===== */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              borderRadius: "16px",
              padding: "24px",
              border: "1px solid #eef1f3",
              boxShadow: "none",
              height: "100%",
            }}
          >
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              <People sx={{ mr: 1, fontSize: 20, verticalAlign: "middle" }} />
              Candidatures ({applications.length})
            </Typography>

            {applications.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
                Aucune candidature
              </Typography>
            ) : (
              <List dense sx={{ p: 0 }}>
                {applications.map((app) => (
                  <ListItem
                    key={app._id}
                    sx={{
                      px: 0,
                      py: 1.5,
                      borderBottom: "1px solid #f0f2f5",
                      "&:last-child": { borderBottom: "none" },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          backgroundColor: "#2d3748",
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#fff",
                        }}
                      >
                        {app.etudiantId?.prenom?.[0]}
                        {app.etudiantId?.nom?.[0] || "?"}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight={500}>
                          {app.etudiantId?.prenom || ""} {app.etudiantId?.nom || ""}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ display: "flex", gap: 1, alignItems: "center", mt: 0.5 }}>
                          <Chip
                            label={getStatusLabel(app.statut)}
                            size="small"
                            sx={{
                              backgroundColor:
                                app.statut === "Acceptee"
                                  ? "#d1fae5"
                                  : app.statut === "Refusee"
                                  ? "#fee2e2"
                                  : "#fef3c7",
                              color:
                                app.statut === "Acceptee"
                                  ? "#065f46"
                                  : app.statut === "Refusee"
                                  ? "#991b1b"
                                  : "#d97706",
                              fontSize: "10px",
                              height: "20px",
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(app.createdAt)}
                          </Typography>
                        </Box>
                      }
                      secondaryTypographyProps={{ component: "div" }}
                    />
                    <Tooltip title="Voir la candidature">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/rh/application/${app._id}`)}
                        sx={{ color: "#2d3748" }}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* ===== DIALOG VALIDATION ===== */}
      <Dialog
        open={openValidateDialog}
        onClose={handleCloseValidateDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: "16px", padding: "8px" },
        }}
      >
        <DialogTitle>
          {validationDecision === "Publiee" ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <ThumbUp sx={{ color: "#22c55e" }} /> Valider l'offre
            </Box>
          ) : (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <ThumbDown sx={{ color: "#ef4444" }} /> Refuser l'offre
            </Box>
          )}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {validationDecision === "Publiee"
              ? `Êtes-vous sûr de vouloir publier l'offre "${offer.titre}" ?`
              : `Êtes-vous sûr de vouloir refuser l'offre "${offer.titre}" ?`}
          </Typography>
          {validationDecision === "Refusee" && (
            <TextField
              label="Motif du refus *"
              value={validationComment}
              onChange={(e) => setValidationComment(e.target.value)}
              fullWidth
              multiline
              rows={3}
              placeholder="Expliquez la raison du refus..."
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button
            onClick={handleCloseValidateDialog}
            sx={{ borderRadius: "10px", textTransform: "none" }}
            disabled={generating}
          >
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleValidateOffer}
            disabled={
              generating ||
              (validationDecision === "Refusee" && !validationComment.trim())
            }
            sx={{
              backgroundColor:
                validationDecision === "Publiee" ? "#22c55e" : "#ef4444",
              borderRadius: "10px",
              textTransform: "none",
              "&:hover": {
                backgroundColor:
                  validationDecision === "Publiee" ? "#16a34a" : "#dc2626",
              },
            }}
          >
            {generating
              ? "Traitement..."
              : validationDecision === "Publiee"
              ? "Publier"
              : "Refuser"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OfferDetailPage;