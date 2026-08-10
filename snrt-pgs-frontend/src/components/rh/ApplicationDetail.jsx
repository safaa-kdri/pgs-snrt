// src/components/rh/ApplicationDetail.jsx
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
  Stepper,
  Step,
  StepLabel,
  Stack,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  ArrowBack,
  Person,
  Email,
  Phone,
  School,
  Work,
  Description,
  CheckCircle,
  Pending,
  Cancel,
  Download,
  Visibility,
  Event,
  Message,
  ThumbUp,
  ThumbDown,
  Assignment,
  Send,
  Print,
  Receipt,
  Upload,
  Delete,
  PictureAsPdf,
  InsertDriveFile,
  Image,
  Business,
  CalendarToday,
  LocationOn,
} from "@mui/icons-material";
import { useAuth } from "../../hooks/useAuth";
import api from "../../services/api";
import { pdfService } from "../../services/pdfService";

// ============================================
// STYLES
// ============================================

const InfoCard = styled(Paper)({
  borderRadius: "16px",
  padding: "20px 24px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  border: "1px solid #eef1f3",
  marginBottom: "24px",
});

const StatusBanner = styled(Box)(({ status }) => {
  const colors = {
    Acceptee: { bg: "#d1fae5", border: "#22c55e", text: "#065f46" },
    Soumise: { bg: "#dbeafe", border: "#1d4ed8", text: "#1d4ed8" },
    EnAnalyse: { bg: "#fef3c7", border: "#d97706", text: "#d97706" },
    Entretien: { bg: "#f3e8ff", border: "#6b21a8", text: "#6b21a8" },
    Refusee: { bg: "#fee2e2", border: "#ef4444", text: "#991b1b" },
    EngagementEnvoye: { bg: "#dbeafe", border: "#1d4ed8", text: "#1d4ed8" },
    EngagementValide: { bg: "#d1fae5", border: "#22c55e", text: "#065f46" },
    DemandeEnvoyee: { bg: "#fef3c7", border: "#d97706", text: "#d97706" },
    ValideParDirecteur: { bg: "#d1fae5", border: "#22c55e", text: "#065f46" },
    Cloturee: { bg: "#d1fae5", border: "#22c55e", text: "#065f46" },
  };
  const color = colors[status] || colors["Soumise"];
  return {
    backgroundColor: color.bg,
    borderLeft: `4px solid ${color.border}`,
    padding: "12px 20px",
    borderRadius: "10px",
    marginBottom: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "12px",
  };
});

const StatusChip = styled(Chip)(({ status }) => {
  const colors = {
    Brouillon: { bg: "#e5e7eb", text: "#6b7280" },
    Soumise: { bg: "#dbeafe", text: "#1d4ed8" },
    EnAnalyse: { bg: "#fef3c7", text: "#d97706" },
    Entretien: { bg: "#f3e8ff", text: "#6b21a8" },
    Acceptee: { bg: "#d1fae5", text: "#065f46" },
    Refusee: { bg: "#fee2e2", text: "#991b1b" },
    EngagementEnvoye: { bg: "#dbeafe", text: "#1d4ed8" },
    EngagementValide: { bg: "#d1fae5", text: "#065f46" },
    DemandeEnvoyee: { bg: "#fef3c7", text: "#d97706" },
    ValideParDirecteur: { bg: "#d1fae5", text: "#065f46" },
    Cloturee: { bg: "#d1fae5", text: "#065f46" },
  };
  const color = colors[status] || colors["Soumise"];
  return {
    backgroundColor: color.bg,
    color: color.text,
    fontWeight: 600,
    fontSize: "12px",
    height: "28px",
    padding: "0 14px",
  };
});

const WorkflowCard = styled(Paper)({
  borderRadius: "16px",
  padding: "24px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  border: "1px solid #eef1f3",
  height: "100%",
});

const DocumentCard = styled(Paper)({
  borderRadius: "16px",
  padding: "24px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  border: "1px solid #eef1f3",
  height: "100%",
});

const StepIconWrapper = styled(Box)(({ active, completed }) => ({
  width: 32,
  height: 32,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: completed ? "#22c55e" : active ? "#2d3748" : "#e5e7eb",
  color: completed || active ? "#fff" : "#999",
  fontSize: "16px",
  fontWeight: 600,
  flexShrink: 0,
}));

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

const DocItem = styled(Box)(({ verified }) => ({
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "10px 12px",
  borderRadius: "10px",
  backgroundColor: verified ? "#f0fdf4" : "#fafafa",
  border: verified ? "1px solid #22c55e" : "1px solid #eef1f3",
  marginBottom: "8px",
  transition: "all 0.2s ease",
  "&:hover": {
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
}));

const StyledStepper = styled(Stepper)({
  "& .MuiStepLabel-label": {
    fontWeight: 500,
    fontSize: "12px",
  },
  "& .MuiStepLabel-label.Mui-active": {
    fontWeight: 600,
    color: "#2d3748",
  },
  "& .MuiStepLabel-label.Mui-completed": {
    color: "#22c55e",
  },
  "& .MuiStepConnector-line": {
    borderColor: "#e5e7eb",
  },
  "& .MuiStepConnector-root.Mui-active .MuiStepConnector-line": {
    borderColor: "#2d3748",
  },
  "& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line": {
    borderColor: "#22c55e",
  },
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

const ApplicationDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState(null);
  const [internship, setInternship] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState("");
  const [comment, setComment] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [activeStep, setActiveStep] = useState(0);
  const [generating, setGenerating] = useState(false);

  // ============================================
  // FONCTIONS UTILITAIRES
  // ============================================

  const getFileIcon = (doc) => {
    if (!doc) return <InsertDriveFile />;
    const name = doc.nomOriginal || doc.nom || "";
    const ext = name.split(".").pop()?.toLowerCase();
    const mimeType = doc.mimeType || "";

    if (ext === "pdf" || mimeType === "application/pdf") {
      return <PictureAsPdf sx={{ color: "#ef4444", fontSize: 20 }} />;
    }
    if (
      ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext) ||
      mimeType.startsWith("image/")
    ) {
      return <Image sx={{ color: "#22c55e", fontSize: 20 }} />;
    }
    return <InsertDriveFile sx={{ color: "#4f46e5", fontSize: 20 }} />;
  };

  // ✅ MODIFICATION ICI : Ajout de FicheDemandeStage
  const cleanDocumentType = (type) => {
    if (!type) return "Autre";
    const typeMap = {
      CV: "CV",
      LettreMotivation: "Lettre de motivation",
      LettreRecommandation: "Lettre de recommandation",
      ReleveNotes: "Relevé de notes",
      Attestation: "Attestation",
      Convention: "Convention",
      Photo: "Photo d'identité",
      CIN: "Copie CIN",
      Assurance: "Assurance",
      FicheDemandeStage: "Fiche de demande de stage",
      Autre: "Autre",
    };
    return typeMap[type] || "Autre";
  };

  const buildFileHref = (doc) => {
    if (!doc) return null;
    const apiRoot = (
      process.env.REACT_APP_API_URL || "http://localhost:5000/api/v1"
    ).replace(/\/api\/v1\/?$/, "");

    if (doc.gridFsId) {
      return `${apiRoot}/api/v1/documents/file/${doc.gridFsId}`;
    }
    if (doc.url) {
      if (doc.url.startsWith("/")) {
        return `${apiRoot}${doc.url}`;
      }
      return doc.url;
    }
    if (doc.chemin) {
      if (doc.chemin.startsWith("/")) {
        return `${apiRoot}${doc.chemin}`;
      }
      return doc.chemin;
    }
    return null;
  };

  useEffect(() => {
    fetchApplicationDetail();
  }, [id]);

  const fetchApplicationDetail = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/applications/${id}`);
      let data = response.data.data || response.data;
      setApplication(data);

      if (data._id) {
        try {
          const stageRes = await api.get(
            `/internships/application/${data._id}`,
          );
          if (stageRes.data?.data) {
            setInternship(stageRes.data.data);
            determineActiveStep(stageRes.data.data);
          }
        } catch (e) {
          setInternship(null);
          determineActiveStep(null);
        }
      }
    } catch (error) {
      console.error("Erreur chargement candidature:", error);
      setError(error.response?.data?.message || "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  const determineActiveStep = (internshipData) => {
    if (!internshipData) {
      setActiveStep(0);
      return;
    }

    const status = internshipData.statut || "EnCours";

    if (status === "Cloturee") setActiveStep(5);
    else if (status === "ValideParDirecteur" || status === "DemandeEnvoyee")
      setActiveStep(4);
    else if (status === "EngagementValide") setActiveStep(3);
    else if (status === "EngagementEnvoye" || status === "EnAttenteEngagement")
      setActiveStep(2);
    else if (status === "Acceptee" || status === "EnCours") setActiveStep(1);
    else setActiveStep(0);
  };

  const getStatusLabel = (status) => {
    const labels = {
      Brouillon: "Brouillon",
      Soumise: "Soumise",
      EnAnalyse: "En analyse",
      Entretien: "Entretien",
      Acceptee: "Acceptée",
      Refusee: "Refusée",
      EngagementEnvoye: "Engagement envoyé",
      EngagementValide: "Engagement validé",
      DemandeEnvoyee: "Demande envoyée",
      ValideParDirecteur: "Validé par Directeur",
      Cloturee: "Clôturée",
    };
    return labels[status] || status;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Non défini";
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const handleOpenDialog = (action) => {
    setDialogAction(action);
    setComment("");
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setComment("");
  };

  // ============================================
  // WORKFLOW RH - FONCTIONS
  // ============================================

  const handleValidateDocuments = async (decision) => {
    setGenerating(true);
    try {
      if (decision === "accepter") {
        await api.patch(
          `/documents/application/${application._id}/validate-all`,
        );

        setSuccess(
          " Tous les documents ont été validés. Candidature transmise en analyse.",
        );
        setDialogAction("");
        fetchApplicationDetail();
      } else {
        await api.patch(`/documents/${application._id}/verify`, {
          statut: "Refuse",
          commentaire: comment || "Non conforme",
        });
        setSuccess("❌ Documents refusés");
        setDialogAction("");
        fetchApplicationDetail();
      }
    } catch (error) {
      console.error("Erreur validation:", error);
      setError(error.response?.data?.message || "Erreur lors de la validation");
    } finally {
      setGenerating(false);
      handleCloseDialog();
    }
  };

  const handleGenerateDemandeStage = async () => {
    setGenerating(true);
    try {
      const blob = await pdfService.generateDemandeStage(
        internship?._id || application._id,
      );
      pdfService.downloadPDF(blob, "Demande_Stage_Directeur.pdf");

      await api.put(
        `/internships/${internship?._id || application._id}/status`,
        { statut: "DemandeEnvoyee" },
      );

      setSuccess("Fiche de demande de stage générée avec succès");
      fetchApplicationDetail();
    } catch (error) {
      console.error("Erreur génération:", error);
      setError(error.response?.data?.message || "Erreur lors de la génération");
    } finally {
      setGenerating(false);
    }
  };

  const handleSendFicheSignee = async () => {
    setGenerating(true);
    try {
      await api.post(
        `/internships/${internship?._id || application._id}/send-fiche-signee`,
      );
      setSuccess("Fiche signée envoyée à l'étudiant");
      fetchApplicationDetail();
    } catch (error) {
      console.error("Erreur envoi:", error);
      setError(error.response?.data?.message || "Erreur lors de l'envoi");
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateAttestation = async () => {
    setGenerating(true);
    try {
      await api.post(
        `/internships/${internship?._id || application._id}/generate-attestation`,
      );
      setSuccess("Attestation de stage générée avec succès");
      fetchApplicationDetail();
    } catch (error) {
      console.error("Erreur attestation:", error);
      setError(error.response?.data?.message || "Erreur lors de la génération");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadEngagement = async () => {
    try {
      const blob = await pdfService.generateEngagementConfidentialite(
        application._id,
      );
      pdfService.downloadPDF(blob, "Engagement_Confidentialite.pdf");
      setSuccess("Engagement de confidentialité téléchargé");
    } catch (error) {
      console.error("Erreur téléchargement:", error);
      setError("Erreur lors du téléchargement");
    }
  };

  const steps = [
    { label: "Validation", description: "Documents" },
    { label: "Engagement", description: "Envoyer" },
    { label: "Dépôt", description: "Signé" },
    { label: "Directeur", description: "Demande" },
    { label: "Fiche", description: "Signée" },
    { label: "Clôture", description: "Attestation" },
  ];

  const renderStepContent = (step) => {
    const isAccepted = application?.statut === "Acceptee";
    const isRefused = application?.statut === "Refusee";
    const isEngagementEnvoye =
      internship?.statut === "EngagementEnvoye" ||
      internship?.statut === "EnAttenteEngagement";
    const isEngagementValide = internship?.statut === "EngagementValide";
    const isDemandeEnvoyee =
      internship?.statut === "DemandeEnvoyee" ||
      internship?.statut === "ValideParDirecteur";
    const isCloturee = internship?.statut === "Cloturee";

    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Vérifiez les documents de candidature avant de prendre une
              décision.
            </Typography>

            {application?.documents?.length > 0 ? (
              <List dense sx={{ mb: 2 }}>
                {application.documents
                  .filter((doc) => cleanDocumentType(doc.type) !== "Autre")
                  .map((doc, idx) => {
                    const docType = cleanDocumentType(doc.type);
                    return (
                      <ListItem
                        key={idx}
                        sx={{
                          px: 0,
                          py: 1,
                          borderBottom: "1px solid #f0f2f5",
                          "&:last-child": { borderBottom: "none" },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          {doc.isVerified ? (
                            <CheckCircle
                              sx={{ color: "#22c55e", fontSize: 20 }}
                            />
                          ) : (
                            <Pending sx={{ color: "#f59e0b", fontSize: 20 }} />
                          )}
                        </ListItemIcon>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            flex: 1,
                          }}
                        >
                          {getFileIcon(doc)}
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {doc.nomOriginal || doc.nom || "Document"}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                            >
                              {docType}
                              {doc.isVerified && " •  Vérifié"}
                            </Typography>
                          </Box>
                        </Box>
                        <Button
                          size="small"
                          startIcon={<Visibility />}
                          onClick={() => {
                            const href = buildFileHref(doc);
                            if (href) {
                              window.open(href, "_blank");
                            } else {
                              setError("Impossible de visualiser ce document");
                            }
                          }}
                          sx={{
                            textTransform: "none",
                            color: "#2d3748",
                            borderRadius: "8px",
                            "&:hover": {
                              backgroundColor: "rgba(45, 55, 72, 0.08)",
                            },
                          }}
                        >
                          Voir
                        </Button>
                      </ListItem>
                    );
                  })}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Aucun document déposé.
              </Typography>
            )}

            {!isAccepted && !isRefused ? (
              <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                <ActionButton
                  variant="contained"
                  startIcon={<ThumbUp />}
                  onClick={() => handleOpenDialog("accepter")}
                  sx={{
                    backgroundColor: "#22c55e",
                    "&:hover": { backgroundColor: "#16a34a" },
                  }}
                >
                  Accepter
                </ActionButton>
                <ActionButton
                  variant="contained"
                  startIcon={<ThumbDown />}
                  onClick={() => handleOpenDialog("refuser")}
                  sx={{
                    backgroundColor: "#ef4444",
                    "&:hover": { backgroundColor: "#dc2626" },
                  }}
                >
                  Refuser
                </ActionButton>
              </Box>
            ) : isAccepted ? (
              <Alert severity="success" sx={{ borderRadius: "8px", mt: 1 }}>
                Candidature acceptée. Engagement de confidentialité généré.
              </Alert>
            ) : isRefused ? (
              <Alert severity="error" sx={{ borderRadius: "8px", mt: 1 }}>
                Candidature refusée
                {application?.commentaire && `: ${application.commentaire}`}
              </Alert>
            ) : null}
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {isEngagementEnvoye
                ? "L'engagement a été envoyé à l'étudiant."
                : "Générez et envoyez l'engagement à l'étudiant."}
            </Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 1 }}>
              <ActionButton
                variant="outlined"
                startIcon={<Download />}
                onClick={handleDownloadEngagement}
                sx={{ borderColor: "#2d3748", color: "#2d3748" }}
              >
                Télécharger
              </ActionButton>
              <ActionButton
                variant="contained"
                startIcon={<Send />}
                onClick={handleSendEngagement}
                disabled={generating || isEngagementEnvoye}
                sx={{
                  backgroundColor: "#2d3748",
                  "&:hover": { backgroundColor: "#1a202c" },
                }}
              >
                {isEngagementEnvoye ? "Envoyé" : "Envoyer"}
              </ActionButton>
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {isEngagementValide
                ? "L'engagement a été validé."
                : "En attente du dépôt de l'engagement signé."}
            </Typography>
            {isEngagementValide && (
              <ActionButton
                variant="contained"
                startIcon={<Send />}
                onClick={handleGenerateDemandeStage}
                disabled={generating}
                sx={{
                  backgroundColor: "#2d3748",
                  "&:hover": { backgroundColor: "#1a202c" },
                  mt: 1,
                }}
              >
                {generating ? "Génération..." : "Générer la demande"}
              </ActionButton>
            )}
          </Box>
        );

      case 3:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {isDemandeEnvoyee
                ? "La demande a été envoyée au Directeur."
                : "Générez la fiche de demande de stage."}
            </Typography>
            <ActionButton
              variant="contained"
              startIcon={<Print />}
              onClick={handleGenerateDemandeStage}
              disabled={generating || isDemandeEnvoyee}
              sx={{
                backgroundColor: "#2d3748",
                "&:hover": { backgroundColor: "#1a202c" },
                mt: 1,
              }}
            >
              {generating ? "Génération..." : "Générer la demande"}
            </ActionButton>
            <Alert severity="info" sx={{ mt: 2, borderRadius: "8px" }}>
              <Typography variant="body2">
                <strong>Instructions :</strong> Imprimez, faites signer et
                cacheter par le Directeur, scannez et envoyez à l'étudiant.
              </Typography>
            </Alert>
          </Box>
        );

      case 4:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Envoyez la fiche signée et cachetée à l'étudiant.
            </Typography>
            <ActionButton
              variant="contained"
              startIcon={<Send />}
              onClick={handleSendFicheSignee}
              disabled={generating}
              sx={{
                backgroundColor: "#2d3748",
                "&:hover": { backgroundColor: "#1a202c" },
                mt: 1,
              }}
            >
              Envoyer la fiche signée
            </ActionButton>
          </Box>
        );

      case 5:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Le stage est clôturé. Générez l'attestation.
            </Typography>
            <ActionButton
              variant="contained"
              startIcon={<Description />}
              onClick={handleGenerateAttestation}
              disabled={generating || isCloturee}
              sx={{
                backgroundColor: "#2d3748",
                "&:hover": { backgroundColor: "#1a202c" },
                mt: 1,
              }}
            >
              {isCloturee ? "Attestation générée" : "Générer l'attestation"}
            </ActionButton>
          </Box>
        );

      default:
        return null;
    }
  };

  // ============================================
  // RENDER
  // ============================================

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

  if (!application) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ borderRadius: "12px" }}>
          Candidature non trouvée
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/rh/applications")}
          sx={{ mt: 2, color: "#2d3748" }}
        >
          Retour à la liste
        </Button>
      </Container>
    );
  }

  const student = application.etudiantId || {};
  const offer = application.offreId || {};

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* ===== HEADER ===== */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/rh/applications")}
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

      {/* ===== CARTE INFORMATIONS CANDIDAT ===== */}
      <InfoCard>
        <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 2 }}>
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
            {student.prenom?.[0]}
            {student.nom?.[0] || "?"}
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#1a2332" }}>
              {student.prenom || "Prénom"} {student.nom || "Nom"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {offer.titre || "Offre sans titre"} • {offer.typeStage || "Stage"}
            </Typography>
          </Box>
          <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
            <StatusChip
              label={getStatusLabel(application.statut)}
              status={application.statut}
            />
            {internship && (
              <Chip
                label={internship.statut || "En cours"}
                size="small"
                sx={{ backgroundColor: "#e0e7ff", color: "#4338ca" }}
              />
            )}
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <InfoRow>
              <Email />
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  Email
                </Typography>
                <Typography variant="body2">
                  {student.email || "Non renseigné"}
                </Typography>
              </Box>
            </InfoRow>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <InfoRow>
              <Phone />
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  Téléphone
                </Typography>
                <Typography variant="body2">
                  {student.telephone || "Non renseigné"}
                </Typography>
              </Box>
            </InfoRow>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <InfoRow>
              <CalendarToday />
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  Date dépôt
                </Typography>
                <Typography variant="body2">
                  {formatDate(
                    application.dateSoumission || application.createdAt,
                  )}
                </Typography>
              </Box>
            </InfoRow>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <InfoRow>
              <Work />
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  Offre
                </Typography>
                <Typography variant="body2">
                  {offer.titre || "Offre sans titre"}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  {offer.typeStage || "Stage"}
                </Typography>
              </Box>
            </InfoRow>
          </Grid>
        </Grid>
      </InfoCard>

      {/* ===== BANNIÈRE STATUT ===== */}
      <StatusBanner status={application.statut}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <CheckCircle
            sx={{
              color:
                application.statut === "Acceptee" ||
                application.statut === "Cloturee"
                  ? "#22c55e"
                  : "#1d4ed8",
            }}
          />
          <Typography variant="body1" fontWeight={600} color="text.primary">
            {application.statut === "Acceptee" ||
            application.statut === "Cloturee"
              ? "Candidature acceptée"
              : application.statut === "Refusee"
                ? "Candidature refusée"
                : "Candidature en cours de traitement"}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          {internship && (
            <Chip
              label={`Stage: ${internship.statut || "En cours"}`}
              size="small"
              sx={{ backgroundColor: "#e0e7ff", color: "#4338ca" }}
            />
          )}
          <Typography variant="caption" color="text.secondary">
            Mis à jour le {formatDate(application.updatedAt)}
          </Typography>
        </Box>
      </StatusBanner>

      {/* ===== WORKFLOW + DOCUMENTS ===== */}
      <Grid container spacing={3}>
        {/* WORKFLOW - 8 colonnes */}
        <Grid item xs={12} md={8}>
          <WorkflowCard>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 3 }}>
              Workflow de validation
            </Typography>

            <StyledStepper activeStep={activeStep} alternativeLabel>
              {steps.map((step, index) => (
                <Step
                  key={step.label}
                  active={activeStep === index}
                  completed={activeStep > index}
                >
                  <StepLabel
                    StepIconComponent={() => (
                      <StepIconWrapper
                        active={activeStep === index}
                        completed={activeStep > index}
                      >
                        {activeStep > index ? (
                          <CheckCircle sx={{ fontSize: 16 }} />
                        ) : (
                          index + 1
                        )}
                      </StepIconWrapper>
                    )}
                    sx={{
                      "& .MuiStepLabel-label": {
                        fontSize: "11px",
                        fontWeight: activeStep === index ? 600 : 400,
                        color: activeStep === index ? "#2d3748" : "#999",
                      },
                    }}
                  >
                    {step.label}
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      {step.description}
                    </Typography>
                  </StepLabel>
                </Step>
              ))}
            </StyledStepper>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                Étape {activeStep + 1} : {steps[activeStep].label}
              </Typography>
              {renderStepContent(activeStep)}
            </Box>
          </WorkflowCard>
        </Grid>

        {/* DOCUMENTS - 4 colonnes */}
        <Grid item xs={12} md={4}>
          <DocumentCard>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Documents
            </Typography>

            {application.documents?.length > 0 ? (
              application.documents
                .filter((doc) => cleanDocumentType(doc.type) !== "Autre")
                .map((doc, idx) => (
                  <DocItem key={idx} verified={doc.isVerified}>
                    {getFileIcon(doc)}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={500} noWrap>
                        {doc.nomOriginal || doc.nom || "Document"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {cleanDocumentType(doc.type)}
                        {doc.isVerified && " • "}
                      </Typography>
                    </Box>
                    <Tooltip title="Voir">
                      <IconButton
                        size="small"
                        onClick={() => {
                          const href = buildFileHref(doc);
                          if (href) window.open(href, "_blank");
                          else setError("Impossible de visualiser ce document");
                        }}
                        sx={{ color: "#2d3748" }}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </DocItem>
                ))
            ) : (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ py: 2, textAlign: "center" }}
              >
                Aucun document déposé
              </Typography>
            )}

            {application.documents?.filter(
              (doc) => cleanDocumentType(doc.type) !== "Autre",
            ).length === 0 &&
              application.documents?.length > 0 && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mt: 1 }}
                >
                  {application.documents.length} document(s) non affiché(s)
                  (type "Autre")
                </Typography>
              )}
          </DocumentCard>
        </Grid>
      </Grid>

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
          {dialogAction === "accepter" && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <ThumbUp sx={{ color: "#22c55e" }} /> Accepter la candidature
            </Box>
          )}
          {dialogAction === "refuser" && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <ThumbDown sx={{ color: "#ef4444" }} /> Refuser la candidature
            </Box>
          )}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {dialogAction === "accepter" &&
              `Êtes-vous sûr de vouloir accepter la candidature de ${student.prenom || ""} ${student.nom || ""} ?`}
            {dialogAction === "refuser" &&
              `Êtes-vous sûr de vouloir refuser la candidature de ${student.prenom || ""} ${student.nom || ""} ?`}
          </Typography>
          {dialogAction === "refuser" && (
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
            disabled={generating}
          >
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={() => handleValidateDocuments(dialogAction)}
            disabled={generating}
            sx={{
              backgroundColor:
                dialogAction === "accepter" ? "#22c55e" : "#ef4444",
              borderRadius: "10px",
              textTransform: "none",
              "&:hover": {
                backgroundColor:
                  dialogAction === "accepter" ? "#16a34a" : "#dc2626",
              },
            }}
          >
            {generating
              ? "Traitement..."
              : dialogAction === "accepter"
                ? "Accepter"
                : "Refuser"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ApplicationDetail;