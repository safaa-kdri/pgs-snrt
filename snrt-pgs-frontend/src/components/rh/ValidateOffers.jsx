// src/components/rh/ValidateOffers.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Chip,
  IconButton,
  Grid,
  CircularProgress,
  InputAdornment,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Card,
  CardContent,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import {
  Search,
  Visibility,
  Refresh,
  FilterList,
  CheckCircle,
  Cancel,
  Pending,
  Comment,
  Work,
} from "@mui/icons-material";
import { useAuth } from "../../hooks/useAuth";
import api from "../../services/api";

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

const StyledTableCell = styled(TableCell)({
  fontWeight: 600,
  color: "#1a2332",
  fontSize: "13px",
});

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
    fontWeight: 500,
    fontSize: "11px",
    height: "24px",
  };
});

// ✅ Carte statistique avec état actif
const StatCard = styled(Card)(({ active, color }) => ({
  borderRadius: "10px",
  border: `1px solid ${active ? color : "#eef1f3"}`,
  cursor: "pointer",
  transition: "all 0.2s ease",
  backgroundColor: active ? alpha(color, 0.05) : "#ffffff",
  boxShadow: active ? `0 4px 12px ${alpha(color, 0.15)}` : "none",
  "&:hover": {
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    transform: "translateY(-2px)",
  },
}));

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const ValidateOffers = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // ✅ Lire le statut depuis l'URL - Par défaut 'all' (Total sélectionné)
  const queryParams = new URLSearchParams(location.search);
  const initialStatus = queryParams.get("statut") || "all";

  const [loading, setLoading] = useState(true);
  const [allOffers, setAllOffers] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [actionType, setActionType] = useState("");
  const [comment, setComment] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  
  // ✅ Stats fixes
  const [stats, setStats] = useState({
    total: 0,
    enAttente: 0,
    publiees: 0,
    refusees: 0,
  });

  // ✅ Map des départements
  const [departementMap, setDepartementMap] = useState({});

  // ✅ Synchroniser statusFilter avec l'URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const statusFromUrl = params.get("statut") || "all";
    if (statusFromUrl !== statusFilter) {
      setStatusFilter(statusFromUrl);
    }
  }, [location.search]);

  // ✅ Charger les offres et les départements
  useEffect(() => {
    fetchDepartements();
  }, []);

  // ✅ Quand le map des départements change, charger les offres
  useEffect(() => {
    if (Object.keys(departementMap).length > 0) {
      fetchOffers();
    }
  }, [departementMap]);

  // ✅ Filtrer les offres quand le filtre change
  useEffect(() => {
    filterOffers();
  }, [allOffers, searchTerm, statusFilter]);

  // ✅ Récupérer la liste des départements
  const fetchDepartements = async () => {
    try {
      const response = await api.get('/departments');
      let depts = [];
      if (response.data?.data) {
        depts = response.data.data;
      } else if (Array.isArray(response.data)) {
        depts = response.data;
      }
      
      const map = {};
      depts.forEach(d => {
        map[d._id || d.id] = d.nom;
      });
      setDepartementMap(map);
    } catch (error) {
      console.error('Erreur chargement départements:', error);
    }
  };

  // ✅ Récupérer les offres
  const fetchOffers = async () => {
    setLoading(true);
    setError("");
    try {
      const params = { limit: 100 };

      const response = await api.get("/offers", { params });

      let data = [];
      if (response.data?.offers) {
        data = response.data.offers;
      } else if (response.data?.data) {
        data = response.data.data;
      }

      // ✅ Ajouter le nom du département à chaque offre
      data = data.map((offer) => ({
        ...offer,
        statut: offer.statut || "EnAttente",
        departementNom: departementMap[offer.departementId] || "Non assigné",
      }));

      setAllOffers(data);

      // ✅ Calculer les stats UNE FOIS
      const total = data.length;
      const enAttente = data.filter((o) => o.statut === "EnAttente").length;
      const publiees = data.filter((o) => o.statut === "Publiee").length;
      const refusees = data.filter((o) => o.statut === "Refusee").length;

      setStats({
        total,
        enAttente,
        publiees,
        refusees,
      });

    } catch (error) {
      console.error("Erreur chargement offres:", error);
      setError(error.response?.data?.message || "Erreur de chargement");
      setAllOffers([]);
      setFilteredOffers([]);
    } finally {
      setLoading(false);
    }
  };

  const filterOffers = () => {
    let filtered = [...allOffers];

    // ✅ Filtrer par statut
    if (statusFilter !== "all") {
      filtered = filtered.filter((o) => o.statut === statusFilter);
    }

    // ✅ Filtrer par recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.titre?.toLowerCase().includes(term) ||
          (o.departementNom || "").toLowerCase().includes(term) ||
          o.description?.toLowerCase().includes(term)
      );
    }

    setFilteredOffers(filtered);
  };

  // ✅ CHANGER LE STATUT - MET À JOUR L'URL
  const handleStatusFilterChange = (newStatus) => {
    setStatusFilter(newStatus);

    const params = new URLSearchParams();
    if (newStatus !== "all") {
      params.set("statut", newStatus);
    }
    navigate(
      `/rh/validate-offers${params.toString() ? `?${params.toString()}` : ""}`,
      { replace: true }
    );
  };

  const getStatusLabel = (status) => {
    const labels = {
      EnAttente: "En attente",
      Publiee: "Publiée",
      Refusee: "Refusée",
      Brouillon: "Brouillon",
      Archivee: "Archivée",
    };
    return labels[status] || status;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleOpenDialog = (offer, action) => {
    setSelectedOffer(offer);
    setActionType(action);
    setComment("");
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedOffer(null);
    setComment("");
  };

  const handleConfirmAction = async () => {
    try {
      if (actionType === "valider") {
        await api.put(`/offers/${selectedOffer._id}/validate`, {
          decision: "Publiee",
        });
        setSuccess(`Offre "${selectedOffer.titre}" validée avec succès`);
      } else {
        await api.put(`/offers/${selectedOffer._id}/validate`, {
          decision: "Refusee",
          motifRefus: comment || "Non spécifié",
        });
        setSuccess(`Offre "${selectedOffer.titre}" refusée`);
      }
      handleCloseDialog();
      // ✅ Recharger les offres après validation
      fetchOffers();
    } catch (error) {
      console.error("Erreur validation:", error);
      setError(error.response?.data?.message || "Erreur lors de la validation");
    }
  };

  // ✅ Déterminer si une carte est active
  const isCardActive = (statutKey) => {
    if (statutKey === "all") return statusFilter === "all";
    return statusFilter === statutKey;
  };

  // ============================================
  // RENDER
  // ============================================

  if (loading && allOffers.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
        }}
      >
        <CircularProgress size={44} sx={{ color: "#2d3748" }} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* ===== EN-TÊTE ===== */}
      <PageHeader>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#1a2332" }}>
            Validation des offres
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {filteredOffers.length} offre(s) trouvée(s)
            {statusFilter !== "all" &&
              ` • Filtré par : ${getStatusLabel(statusFilter)}`}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={fetchOffers}
          disabled={loading}
          sx={{
            borderRadius: "12px",
            textTransform: "none",
            borderColor: "#e0e4e8",
            color: "#20242b",
            "&:hover": {
              borderColor: "#2d3748",
              backgroundColor: alpha("#2d3748", 0.04),
            },
          }}
        >
          Rafraîchir
        </Button>
      </PageHeader>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: "10px" }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: "10px" }}>
          {success}
        </Alert>
      )}

      {/* ===== STATS RAPIDES AVEC ÉTAT ACTIF - STATS FIXES ===== */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <StatCard
            active={isCardActive("all")}
            color="#2d3748"
            onClick={() => handleStatusFilterChange("all")}
          >
            <CardContent sx={{ py: 1.5, px: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Total
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {stats.total}
              </Typography>
            </CardContent>
          </StatCard>
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            active={isCardActive("EnAttente")}
            color="#d97706"
            onClick={() => handleStatusFilterChange("EnAttente")}
          >
            <CardContent sx={{ py: 1.5, px: 2 }}>
              <Typography variant="caption" color="#d97706">
                En attente
              </Typography>
              <Typography variant="h6" fontWeight={700} color="#d97706">
                {stats.enAttente}
              </Typography>
            </CardContent>
          </StatCard>
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            active={isCardActive("Publiee")}
            color="#065f46"
            onClick={() => handleStatusFilterChange("Publiee")}
          >
            <CardContent sx={{ py: 1.5, px: 2 }}>
              <Typography variant="caption" color="#065f46">
                Publiées
              </Typography>
              <Typography variant="h6" fontWeight={700} color="#065f46">
                {stats.publiees}
              </Typography>
            </CardContent>
          </StatCard>
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            active={isCardActive("Refusee")}
            color="#991b1b"
            onClick={() => handleStatusFilterChange("Refusee")}
          >
            <CardContent sx={{ py: 1.5, px: 2 }}>
              <Typography variant="caption" color="#991b1b">
                Refusées
              </Typography>
              <Typography variant="h6" fontWeight={700} color="#991b1b">
                {stats.refusees}
              </Typography>
            </CardContent>
          </StatCard>
        </Grid>
      </Grid>

      {/* ===== FILTRES ===== */}
      <Paper
        sx={{ p: 2, mb: 3, borderRadius: "12px", backgroundColor: "#fafbfc" }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={8}>
            <TextField
              placeholder="Rechercher par titre, département..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: "#999", fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  backgroundColor: "#fff",
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => {
                setSearchTerm("");
                handleStatusFilterChange("all");
              }}
              sx={{
                borderRadius: "10px",
                textTransform: "none",
                borderColor: "#ddd",
                color: "#666",
                backgroundColor: "#fff",
                "&:hover": {
                  borderColor: "#2d3748",
                  backgroundColor: alpha("#2d3748", 0.04),
                },
              }}
            >
              Réinitialiser
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* ===== TABLEAU ===== */}
      <TableContainer
        component={Paper}
        sx={{ borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f7f7f7" }}>
              <StyledTableCell>Offre</StyledTableCell>
              <StyledTableCell>Département</StyledTableCell>
              <StyledTableCell>Type</StyledTableCell>
              <StyledTableCell>Postes</StyledTableCell>
              <StyledTableCell>Créé le</StyledTableCell>
              <StyledTableCell>Statut</StyledTableCell>
              <StyledTableCell align="center">Actions</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOffers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Typography variant="body1" color="text.secondary">
                    {statusFilter !== "all"
                      ? `Aucune offre avec le statut "${getStatusLabel(statusFilter)}"`
                      : "Aucune offre trouvée"}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredOffers.map((offer) => (
                <TableRow key={offer._id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {offer.titre || "Sans titre"}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        {offer.description?.slice(0, 60)}
                        {offer.description?.length > 60 && "..."}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={offer.departementNom || "Non assigné"}
                      size="small"
                      sx={{ backgroundColor: "#e0e7ff", color: "#4338ca" }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={offer.typeStage || "-"}
                      size="small"
                      sx={{ backgroundColor: "#f3e8ff", color: "#6b21a8" }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {offer.nbPostes || 0}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(offer.createdAt)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <StatusChip
                      label={getStatusLabel(offer.statut)}
                      status={offer.statut}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Voir les détails">
                      <IconButton
                        size="small"
                        onClick={() =>
                          navigate(`/admin/offres/view/${offer._id}`)
                        }
                        sx={{ color: "#2d3748" }}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {offer.statut === "EnAttente" && (
                      <>
                        <Tooltip title="Valider">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(offer, "valider")}
                            sx={{ color: "#22c55e" }}
                          >
                            <CheckCircle fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Refuser">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(offer, "refuser")}
                            sx={{ color: "#ef4444" }}
                          >
                            <Cancel fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ===== DIALOG ===== */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: "16px", padding: "8px" },
        }}
      >
        <DialogTitle>
          {actionType === "valider" ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CheckCircle sx={{ color: "#22c55e" }} /> Valider l'offre
            </Box>
          ) : (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Cancel sx={{ color: "#ef4444" }} /> Refuser l'offre
            </Box>
          )}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {actionType === "valider"
              ? `Êtes-vous sûr de vouloir valider l'offre "${selectedOffer?.titre}" ?`
              : `Êtes-vous sûr de vouloir refuser l'offre "${selectedOffer?.titre}" ?`}
          </Typography>
          {actionType === "refuser" && (
            <TextField
              label="Motif du refus"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
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
            onClick={handleCloseDialog}
            sx={{ borderRadius: "10px", textTransform: "none" }}
          >
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmAction}
            sx={{
              backgroundColor: actionType === "valider" ? "#2d3748" : "#ef4444",
              borderRadius: "10px",
              textTransform: "none",
              "&:hover": {
                backgroundColor:
                  actionType === "valider" ? "#1a202c" : "#dc2626",
              },
            }}
          >
            {actionType === "valider" ? "Valider" : "Refuser"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ValidateOffers;