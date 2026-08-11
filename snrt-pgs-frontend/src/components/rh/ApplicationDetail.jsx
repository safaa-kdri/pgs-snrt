// src/components/rh/ApplicationDetail.jsx
// ✅ CORRECTION : Nouveau workflow après génération de la demande
// ✅ CORRECTION : Affichage du document d'engagement déposé par l'étudiant
// ✅ CORRECTION : Ajout du bouton "Valider l'engagement" et "Rejeter l'engagement"
// ✅ CORRECTION : Génération de la demande de stage pour le Directeur
// ✅ AJOUT : Retour en arrière UNIQUEMENT vers les étapes précédentes
// ✅ AJOUT : Passage à l'étape suivante après génération de la demande
// ✅ AJOUT : Consultation du rapport déposé par l'étudiant
// ✅ AJOUT : Gestion des statuts EngagementRecu et EngagementRejete

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
    EngagementRecu: { bg: "#fef3c7", border: "#d97706", text: "#d97706" },
    EngagementValide: { bg: "#d1fae5", border: "#22c55e", text: "#065f46" },
    EngagementRejete: { bg: "#fee2e2", border: "#ef4444", text: "#991b1b" },
    DemandeEnvoyee: { bg: "#dbeafe", border: "#1d4ed8", text: "#1d4ed8" },
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
    EngagementRecu: { bg: "#fef3c7", text: "#d97706" },
    EngagementValide: { bg: "#d1fae5", text: "#065f46" },
    EngagementRejete: { bg: "#fee2e2", text: "#991b1b" },
    DemandeEnvoyee: { bg: "#dbeafe", text: "#1d4ed8" },
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
  const [maxStepReached, setMaxStepReached] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

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
      let cleanPath = doc.chemin;
      if (cleanPath.startsWith("./")) {
        cleanPath = cleanPath.substring(2);
      }
      if (cleanPath.startsWith("/")) {
        cleanPath = cleanPath.substring(1);
      }
      return `${apiRoot}/${cleanPath}`;
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

  // ✅ NOUVEAU WORKFLOW AVEC TOUS LES STATUTS
  const determineActiveStep = (internshipData) => {
    if (!internshipData) {
      setActiveStep(0);
      return;
    }

    const status = internshipData.statut || "EnCours";

    let step = 0;
    if (status === "Cloturee") step = 6;
    else if (status === "ValideParDirecteur") step = 5;
    else if (status === "DemandeEnvoyee") step = 4;
    else if (status === "EngagementValide") step = 3;
    else if (status === "EngagementRecu" || status === "EngagementRejete") step = 2;
    else if (status === "EngagementEnvoye" || status === "EnAttenteEngagement") step = 1;
    else if (status === "Acceptee" || status === "EnCours") step = 0;
    
    setActiveStep(step);
    setMaxStepReached(step);
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
      EngagementRecu: "Engagement reçu",
      EngagementValide: "Engagement validé",
      EngagementRejete: "Engagement rejeté",
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
  // GESTION DU STEPPER - Navigation
  // ============================================
  const handleStepClick = (index) => {
    // ✅ Permet de naviguer vers n'importe quelle étape déjà atteinte (<= maxStepReached)
    if (index <= maxStepReached) {
      setActiveStep(index);
    }
  };

  // ✅ Passer à l'étape suivante (pour le RH après une action)
  const goToNextStep = () => {
    if (activeStep < steps.length - 1) {
      const nextStep = activeStep + 1;
      setActiveStep(nextStep);
      if (nextStep > maxStepReached) {
        setMaxStepReached(nextStep);
      }
    }
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
          "Tous les documents ont été validés. Candidature transmise au département pour analyse.",
        );
        setDialogAction("");
        fetchApplicationDetail();
        goToNextStep();
      } else {
        await api.patch(`/documents/${application._id}/verify`, {
          statut: "Refuse",
          commentaire: comment || "Non conforme",
        });
        setSuccess("Documents refusés");
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

  // Télécharger l'engagement via l'API backend
  const handleDownloadEngagement = async () => {
    try {
      const stageId = internship?._id || application._id;
      
      if (!stageId) {
        setError("ID du stage non trouvé");
        return;
      }

      const response = await api.get(`/internships/${stageId}/generate-engagement`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Engagement_Confidentialite_SNRT.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess("Engagement de confidentialité téléchargé");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Erreur téléchargement:", error);
      setError(error.response?.data?.message || "Erreur lors du téléchargement");
    }
  };

  // Envoyer l'engagement par email via l'API backend
  const handleSendEngagement = async () => {
    setGenerating(true);
    try {
      const stageId = internship?._id || application._id;
      
      if (!stageId) {
        setError("ID du stage non trouvé");
        return;
      }

      await api.post(`/internships/${stageId}/send-engagement`);
      
      setSuccess("Engagement de confidentialité envoyé à l'étudiant");
      setTimeout(() => setSuccess(""), 3000);
      fetchApplicationDetail();
      goToNextStep();
    } catch (error) {
      console.error("Erreur envoi engagement:", error);
      setError(error.response?.data?.message || "Erreur lors de l'envoi");
    } finally {
      setGenerating(false);
    }
  };

  // Valider l'engagement déposé par l'étudiant
  const handleValidateEngagement = async () => {
    setGenerating(true);
    try {
      const stageId = internship?._id || application._id;
      
      if (!stageId) {
        setError("ID du stage non trouvé");
        return;
      }

      await api.patch(`/internships/${stageId}/status`, {
        statut: "EngagementValide"
      });
      
      setSuccess("Engagement validé avec succès. Vous pouvez maintenant générer la demande de stage.");
      setTimeout(() => setSuccess(""), 3000);
      fetchApplicationDetail();
      goToNextStep();
    } catch (error) {
      console.error("Erreur validation engagement:", error);
      setError(error.response?.data?.message || "Erreur lors de la validation");
    } finally {
      setGenerating(false);
    }
  };

  // Rejeter l'engagement déposé par l'étudiant
  const handleRejectEngagement = async () => {
    if (!rejectReason.trim()) {
      setError("Veuillez indiquer la raison du rejet");
      return;
    }

    setGenerating(true);
    try {
      const stageId = internship?._id || application._id;
      
      if (!stageId) {
        setError("ID du stage non trouvé");
        return;
      }

      await api.patch(`/internships/${stageId}/status`, {
        statut: "EngagementRejete"
      });
      
      setSuccess("Engagement rejeté. L'étudiant a été informé.");
      setTimeout(() => setSuccess(""), 3000);
      setRejectDialogOpen(false);
      setRejectReason("");
      fetchApplicationDetail();
    } catch (error) {
      console.error("Erreur rejet engagement:", error);
      setError(error.response?.data?.message || "Erreur lors du rejet");
    } finally {
      setGenerating(false);
    }
  };

  // Générer la demande de stage pour le Directeur
  const handleGenerateDemandeStage = async () => {
    setGenerating(true);
    try {
      const stageId = internship?._id || application._id;
      
      if (!stageId) {
        setError("ID du stage non trouvé");
        return;
      }

      const response = await api.get(`/internships/${stageId}/generate-demande-stage`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Demande_Stage_Directeur_${application?.etudiantId?.prenom || ''}_${application?.etudiantId?.nom || ''}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // ✅ Mettre à jour le statut du stage
      await api.patch(`/internships/${stageId}/status`, {
        statut: "DemandeEnvoyee"
      });

      setSuccess("Demande de stage générée avec succès !");
      setTimeout(() => setSuccess(""), 3000);
      fetchApplicationDetail();
      goToNextStep();
    } catch (error) {
      console.error("Erreur génération demande:", error);
      setError(error.response?.data?.message || "Erreur lors de la génération");
    } finally {
      setGenerating(false);
    }
  };

  // Envoyer la fiche signée
  const handleSendFicheSignee = async () => {
    setGenerating(true);
    try {
      const stageId = internship?._id || application._id;
      
      if (!stageId) {
        setError("ID du stage non trouvé");
        return;
      }

      await api.post(`/internships/${stageId}/send-fiche-signee`);
      setSuccess("Fiche signée envoyée à l'étudiant");
      setTimeout(() => setSuccess(""), 3000);
      fetchApplicationDetail();
      goToNextStep();
    } catch (error) {
      console.error("Erreur envoi:", error);
      setError(error.response?.data?.message || "Erreur lors de l'envoi");
    } finally {
      setGenerating(false);
    }
  };

  // Générer l'attestation
  const handleGenerateAttestation = async () => {
    setGenerating(true);
    try {
      const stageId = internship?._id || application._id;
      
      if (!stageId) {
        setError("ID du stage non trouvé");
        return;
      }

      await api.post(`/internships/${stageId}/generate-attestation`);
      setSuccess("Attestation de stage générée avec succès");
      setTimeout(() => setSuccess(""), 3000);
      fetchApplicationDetail();
      goToNextStep();
    } catch (error) {
      console.error("Erreur attestation:", error);
      setError(error.response?.data?.message || "Erreur lors de la génération");
    } finally {
      setGenerating(false);
    }
  };

  // ✅ NOUVELLES ÉTAPES DU WORKFLOW
  const steps = [
    { label: "Validation", description: "Documents" },
    { label: "Engagement", description: "Envoyer" },
    { label: "Dépôt", description: "Signé" },
    { label: "Validation", description: "Engagement" },
    { label: "Directeur", description: "Demande" },
    { label: "Clôture", description: "Rapport" },
    { label: "Terminé", description: "Attestation" },
  ];

  // ============================================
  // RENDER STEP CONTENT
  // ============================================

  const renderStepContent = (step) => {
    // Statuts de la candidature
    const isAccepted = application?.statut === "Acceptee";
    const isRefused = application?.statut === "Refusee";
    const isEnAnalyse = application?.statut === "EnAnalyse";

    // Statuts du stage
    const isEngagementEnvoye =
      internship?.statut === "EngagementEnvoye" ||
      internship?.statut === "EnAttenteEngagement";
    const isEngagementRecu = internship?.statut === "EngagementRecu";
    const isEngagementValide = internship?.statut === "EngagementValide";
    const isEngagementRejete = internship?.statut === "EngagementRejete";
    const isDemandeEnvoyee =
      internship?.statut === "DemandeEnvoyee" ||
      internship?.statut === "ValideParDirecteur";
    const isCloturee = internship?.statut === "Cloturee";

    // Récupérer le livrable d'engagement
    const engagementLivrable = internship?.livrables?.find(
        l => l.nom === 'Engagement Confidentialité Signé'
    );

    // Récupérer le rapport de stage (livrable de type "Rapport")
    const rapportLivrable = internship?.livrables?.find(
        l => l.type === 'Rapport'
    );

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
                              {doc.isVerified && " • Vérifié"}
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

            {!isAccepted && !isRefused && !isEnAnalyse ? (
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
            ) : isAccepted || isEnAnalyse ? (
              <Alert severity="success" sx={{ borderRadius: "8px", mt: 1 }}>
                {isAccepted
                  ? "Candidature acceptée. Engagement de confidentialité généré."
                  : "Candidature acceptée et transmise au département pour analyse."}
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
              {isEngagementRecu || isEngagementValide || isEngagementRejete
                ? "L'engagement signé a été déposé par l'étudiant."
                : "En attente du dépôt de l'engagement signé par l'étudiant."}
            </Typography>

            {engagementLivrable && (
              <Box sx={{ mb: 3 }}>
                <Alert 
                  severity={isEngagementRejete ? "error" : "success"}
                  sx={{ 
                    mb: 2, 
                    borderRadius: '8px',
                    backgroundColor: isEngagementRejete ? '#fee2e2' : '#d1fae5',
                    '& .MuiAlert-icon': { color: isEngagementRejete ? '#ef4444' : '#16a34a' }
                  }}
                >
                  <Typography variant="body2" color={isEngagementRejete ? '#991b1b' : '#065f46'}>
                    {isEngagementRejete 
                      ? "L'engagement a été rejeté. L'étudiant doit en déposer un nouveau."
                      : "L'engagement de confidentialité signé a été déposé par l'étudiant."
                    }
                  </Typography>
                </Alert>
                
                <Paper sx={{ p: 2, borderRadius: '10px', border: '1px solid #eef1f3' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <PictureAsPdf sx={{ color: '#ef4444', fontSize: 24 }} />
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {engagementLivrable.nom || 'Engagement_Confidentialite_Signe.pdf'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Déposé le {formatDate(engagementLivrable.dateDepot)}
                        </Typography>
                        {isEngagementRejete && (
                          <Typography variant="caption" color="error" display="block">
                            Rejeté
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <Tooltip title="Voir le document">
                      <IconButton
                        size="small"
                        onClick={() => {
                          const href = buildFileHref(engagementLivrable);
                          if (href) window.open(href, '_blank');
                          else setError("Impossible de visualiser ce document");
                        }}
                        sx={{ color: '#2d3748' }}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Paper>
              </Box>
            )}
          </Box>
        );

      case 3:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {isEngagementRejete 
                ? "L'engagement a été rejeté. Veuillez contacter l'étudiant pour un nouveau dépôt."
                : "Vérifiez l'engagement déposé par l'étudiant et validez ou rejetez-le."
              }
            </Typography>

            {engagementLivrable && (
              <Box sx={{ mb: 3 }}>
                <Alert 
                  severity={isEngagementRejete ? "error" : "info"}
                  sx={{ mb: 2, borderRadius: '8px' }}
                >
                  <Typography variant="body2">
                    {isEngagementRejete 
                      ? "Engagement rejeté. L'étudiant doit en déposer un nouveau."
                      : "Veuillez vérifier que l'engagement est bien signé par l'étudiant avant de le valider."
                    }
                  </Typography>
                </Alert>
                
                <Paper sx={{ p: 2, borderRadius: '10px', border: '1px solid #eef1f3' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <PictureAsPdf sx={{ color: '#ef4444', fontSize: 24 }} />
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {engagementLivrable.nom || 'Engagement_Confidentialite_Signe.pdf'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Déposé le {formatDate(engagementLivrable.dateDepot)}
                        </Typography>
                      </Box>
                    </Box>
                    <Tooltip title="Voir le document">
                      <IconButton
                        size="small"
                        onClick={() => {
                          const href = buildFileHref(engagementLivrable);
                          if (href) window.open(href, '_blank');
                          else setError("Impossible de visualiser ce document");
                        }}
                        sx={{ color: '#2d3748' }}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Paper>
              </Box>
            )}

            {!isEngagementValide && !isEngagementRejete && isEngagementRecu && (
              <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                <ActionButton
                  variant="contained"
                  startIcon={<ThumbUp />}
                  onClick={handleValidateEngagement}
                  disabled={generating}
                  sx={{
                    backgroundColor: "#22c55e",
                    "&:hover": { backgroundColor: "#16a34a" },
                  }}
                >
                  Valider l'engagement
                </ActionButton>
                <ActionButton
                  variant="contained"
                  startIcon={<ThumbDown />}
                  onClick={() => setRejectDialogOpen(true)}
                  disabled={generating}
                  sx={{
                    backgroundColor: "#ef4444",
                    "&:hover": { backgroundColor: "#dc2626" },
                  }}
                >
                  Rejeter
                </ActionButton>
              </Box>
            )}

            {isEngagementValide && (
              <Box sx={{ mt: 2 }}>
                <Alert severity="success" sx={{ borderRadius: '8px' }}>
                  Engagement validé. Vous pouvez maintenant générer la demande de stage.
                </Alert>
                <ActionButton
                  variant="contained"
                  startIcon={<Print />}
                  onClick={handleGenerateDemandeStage}
                  disabled={generating}
                  sx={{
                    backgroundColor: "#2d3748",
                    "&:hover": { backgroundColor: "#1a202c" },
                    mt: 2,
                  }}
                >
                  {generating ? "Génération..." : "Générer la demande de stage"}
                </ActionButton>
              </Box>
            )}

            {isEngagementRejete && (
              <Box sx={{ mt: 2 }}>
                <Alert severity="error" sx={{ borderRadius: '8px' }}>
                  Engagement rejeté. L'étudiant doit en déposer un nouveau.
                </Alert>
              </Box>
            )}
          </Box>
        );

      // ✅ ÉTAPE 4 : DIRECTEUR - Demande de stage
      case 4:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {isDemandeEnvoyee
                ? "La demande de stage a été générée. Imprimez-la, faites-la signer et cacheter par le Directeur."
                : "Générez la demande de stage pour le Directeur."}
            </Typography>
            
            {!isDemandeEnvoyee ? (
              <ActionButton
                variant="contained"
                startIcon={<Print />}
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
            ) : (
              <Box sx={{ mt: 2 }}>
                <Alert severity="success" sx={{ borderRadius: '8px', mb: 2 }}>
                  La demande de stage a été générée avec succès.
                </Alert>
                <ActionButton
                  variant="outlined"
                  startIcon={<Print />}
                  onClick={handleGenerateDemandeStage}
                  sx={{
                    borderColor: "#2d3748",
                    color: "#2d3748",
                    mt: 1,
                  }}
                >
                  Télécharger à nouveau
                </ActionButton>
                <Alert severity="info" sx={{ mt: 2, borderRadius: "8px" }}>
                  <Typography variant="body2">
                    <strong>Prochaine étape :</strong> Après signature et cachet du Directeur, 
                    vous pouvez passer à l'étape "Clôture" pour consulter le rapport de l'étudiant.
                  </Typography>
                </Alert>
                {/* ✅ Bouton pour passer manuellement à l'étape suivante */}
                {activeStep === 4 && (
                  <ActionButton
                    variant="contained"
                    onClick={goToNextStep}
                    sx={{
                      backgroundColor: "#148aa0",
                      "&:hover": { backgroundColor: "#0b7890" },
                      mt: 2,
                    }}
                  >
                    Passer à l'étape Clôture
                  </ActionButton>
                )}
              </Box>
            )}
          </Box>
        );

      // ✅ ÉTAPE 5 : CLÔTURE - Consultation du rapport
      case 5:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {rapportLivrable
                ? "L'étudiant a déposé son rapport de stage."
                : "En attente du dépôt du rapport par l'étudiant."}
            </Typography>

            {/* ✅ AFFICHER LE RAPPORT SI DÉPOSÉ */}
            {rapportLivrable ? (
              <Box>
                <Alert severity="success" sx={{ borderRadius: '8px', mb: 2 }}>
                  Le rapport de stage a été déposé par l'étudiant.
                </Alert>
                
                <Paper sx={{ p: 2, borderRadius: '10px', border: '1px solid #eef1f3' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <PictureAsPdf sx={{ color: '#ef4444', fontSize: 24 }} />
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {rapportLivrable.nom || 'Rapport_de_stage.pdf'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Déposé le {formatDate(rapportLivrable.dateDepot)}
                        </Typography>
                        {rapportLivrable.valide && (
                          <Typography variant="caption" color="success.main" display="block">
                            Validé par l'encadrant
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <Tooltip title="Voir le rapport">
                      <IconButton
                        size="small"
                        onClick={() => {
                          const href = buildFileHref(rapportLivrable);
                          if (href) window.open(href, '_blank');
                          else setError("Impossible de visualiser ce document");
                        }}
                        sx={{ color: '#2d3748' }}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Paper>

                {!isCloturee && rapportLivrable.valide && (
                  <Box sx={{ mt: 2 }}>
                    <Alert severity="info" sx={{ borderRadius: '8px', mb: 2 }}>
                      Le rapport a été validé par l'encadrant. Vous pouvez clôturer le stage.
                    </Alert>
                    <ActionButton
                      variant="contained"
                      startIcon={<CheckCircle />}
                      onClick={async () => {
                        try {
                          const stageId = internship?._id || application._id;
                          await api.patch(`/internships/${stageId}/status`, {
                            statut: "Cloturee"
                          });
                          setSuccess("Stage clôturé avec succès !");
                          setTimeout(() => setSuccess(""), 3000);
                          fetchApplicationDetail();
                          goToNextStep();
                        } catch (error) {
                          console.error("Erreur clôture:", error);
                          setError(error.response?.data?.message || "Erreur lors de la clôture");
                        }
                      }}
                      sx={{
                        backgroundColor: "#22c55e",
                        "&:hover": { backgroundColor: "#16a34a" },
                      }}
                    >
                      Clôturer le stage
                    </ActionButton>
                  </Box>
                )}

                {isCloturee && (
                  <Alert severity="success" sx={{ borderRadius: '8px', mt: 2 }}>
                    Le stage est clôturé. Passez à l'étape suivante pour générer l'attestation.
                  </Alert>
                )}
                
                {/* ✅ Bouton pour passer manuellement à l'étape suivante si clôturé */}
                {isCloturee && activeStep === 5 && (
                  <ActionButton
                    variant="contained"
                    onClick={goToNextStep}
                    sx={{
                      backgroundColor: "#148aa0",
                      "&:hover": { backgroundColor: "#0b7890" },
                      mt: 2,
                    }}
                  >
                    Passer à l'étape Terminé
                  </ActionButton>
                )}
              </Box>
            ) : (
              <Alert severity="info" sx={{ borderRadius: '8px' }}>
                <Typography variant="body2">
                  L'étudiant n'a pas encore déposé son rapport de stage.
                </Typography>
              </Alert>
            )}
          </Box>
        );

      case 6:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {isCloturee
                ? "Le stage est clôturé. Générez l'attestation."
                : "Le stage n'est pas encore clôturé."}
            </Typography>

            {isCloturee ? (
              <Box>
                <Alert severity="success" sx={{ borderRadius: '8px', mb: 2 }}>
                  Le stage est clôturé. Vous pouvez générer l'attestation de stage.
                </Alert>
                <ActionButton
                  variant="contained"
                  startIcon={<Description />}
                  onClick={handleGenerateAttestation}
                  disabled={generating}
                  sx={{
                    backgroundColor: "#2d3748",
                    "&:hover": { backgroundColor: "#1a202c" },
                    mt: 1,
                  }}
                >
                  {generating ? "Génération..." : "Générer l'attestation"}
                </ActionButton>
              </Box>
            ) : (
              <Alert severity="info" sx={{ borderRadius: '8px' }}>
                <Typography variant="body2">
                  Le stage doit être clôturé avant de pouvoir générer l'attestation.
                </Typography>
              </Alert>
            )}
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
                  : application.statut === "EnAnalyse"
                    ? "#d97706"
                    : "#1d4ed8",
            }}
          />
          <Typography variant="body1" fontWeight={600} color="text.primary">
            {application.statut === "Acceptee" ||
            application.statut === "Cloturee"
              ? "Candidature acceptée"
              : application.statut === "EnAnalyse"
                ? "Candidature en analyse par le département"
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

            {/* STEPPER AVEC RETOUR EN ARRIÈRE ET RETOUR À L'ÉTAPE ACTUELLE */}
            <StyledStepper 
              activeStep={activeStep} 
              alternativeLabel
              nonLinear
            >
              {steps.map((step, index) => (
                <Step
                  key={step.label}
                  active={activeStep === index}
                  completed={index < maxStepReached}
                  onClick={() => handleStepClick(index)}
                  sx={{
                    // ✅ Cliquable si l'étape a déjà été atteinte (<= maxStepReached)
                    cursor: index <= maxStepReached ? 'pointer' : 'default',
                    '&:hover': {
                      '& .MuiStepLabel-root': {
                        color: index <= maxStepReached ? '#2d3748' : 'inherit'
                      }
                    }
                  }}
                >
                  <StepLabel
                    StepIconComponent={() => (
                      <StepIconWrapper
                        active={activeStep === index}
                        completed={index < maxStepReached}
                      >
                        {index < maxStepReached ? (
                          <CheckCircle sx={{ fontSize: 16 }} />
                        ) : (
                          index + 1
                        )}
                      </StepIconWrapper>
                    )}
                    sx={{
                      '& .MuiStepLabel-label': {
                        fontSize: '11px',
                        fontWeight: activeStep === index ? 600 : 400,
                        color: activeStep === index ? '#2d3748' : '#999',
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
                        {doc.isVerified && " • Vérifié"}
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
          </DocumentCard>
        </Grid>
      </Grid>

      {/* ===== DIALOG REJET ENGAGEMENT ===== */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => {
          setRejectDialogOpen(false);
          setRejectReason("");
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: "16px", padding: "8px" },
        }}
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ThumbDown sx={{ color: "#ef4444" }} /> Rejeter l'engagement
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Êtes-vous sûr de vouloir rejeter l'engagement de confidentialité de {student.prenom || ""} {student.nom || ""} ?
          </Typography>
          <TextField
            label="Raison du rejet"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            fullWidth
            multiline
            rows={3}
            placeholder="Expliquez la raison du rejet (document non signé, illisible, etc.)..."
            required
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button
            onClick={() => {
              setRejectDialogOpen(false);
              setRejectReason("");
            }}
            sx={{ borderRadius: "10px", textTransform: "none" }}
            disabled={generating}
          >
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleRejectEngagement}
            disabled={generating || !rejectReason.trim()}
            sx={{
              backgroundColor: "#ef4444",
              borderRadius: "10px",
              textTransform: "none",
              "&:hover": { backgroundColor: "#dc2626" },
            }}
          >
            {generating ? "Traitement..." : "Rejeter"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===== DIALOG VALIDATION DOCUMENTS ===== */}
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