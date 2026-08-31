// src/components/rh/ApplicationDetail.jsx
// WORKFLOW SIMPLIFIÉ (4 ÉTAPES)
// Étape 1 : Validation (Documents + Acceptation)
// Étape 2 : Engagement (Dépôt + Validation)
// Étape 3 : Directeur (Demande de stage)
// Étape 4 : Clôture (Rapport + Attestation) - VERSION PROFESSIONNELLE

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
    Termine: { bg: "#d1fae5", border: "#22c55e", text: "#065f46" },
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
    Termine: { bg: "#d1fae5", text: "#065f46" },
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

  // États pour la demande de stage
  const [demandeStageFile, setDemandeStageFile] = useState(null);
  const [demandeStagePath, setDemandeStagePath] = useState(null);

  // États pour l'attestation
  const [attestationFile, setAttestationFile] = useState(null);
  const [attestationViewLoading, setAttestationViewLoading] = useState(false);
  const [attestationSendLoading, setAttestationSendLoading] = useState(false);

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
      AttestationScolarite: "Attestation de scolarité",
      Convention: "Convention",
      Photo: "Photo d'identité",
      CIN: "Copie CIN",
      Assurance: "Assurance",
      FicheEngagement: "Fiche de demande de stage",
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

  const determineActiveStep = (internshipData) => {
    if (!internshipData) {
      setActiveStep(0);
      return;
    }

    const status = internshipData.statut || "EnCours";

    let step = 0;
    // Étape 4 : Clôture (rapport + attestation)
    if (status === "Cloturee" || status === "Termine") step = 3;
    // Étape 3 : Directeur (demande envoyée)
    else if (status === "DemandeEnvoyee" || status === "ValideParDirecteur")
      step = 2;
    // Étape 2 : Engagement (dépôt + validation)
    else if (
      status === "EngagementRecu" ||
      status === "EngagementValide" ||
      status === "EngagementRejete"
    )
      step = 1;
    // Étape 1 : Validation (documents + acceptation)
    else if (
      status === "Acceptee" ||
      status === "EnCours" ||
      status === "EngagementEnvoye" ||
      status === "EnAttenteEngagement"
    )
      step = 0;

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
      Termine: "Terminé",
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

  const handleStepClick = (index) => {
    if (index <= maxStepReached) {
      setActiveStep(index);
    }
  };

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
      if (decision === "valider") {
        if (application?.statut === "EnAnalyse") {
          setSuccess("Les documents ont déjà été validés.");
          setDialogAction("");
          setGenerating(false);
          handleCloseDialog();
          return;
        }

        await api.patch(
          `/documents/application/${application._id}/validate-all`,
        );

        if (application?.statut === "Soumise") {
          await api.patch(`/applications/${application._id}/status`, {
            statut: "EnAnalyse",
            commentaire: "Documents validés par le RH",
          });
        }

        setSuccess(
          "Documents validés. La candidature a été transmise au département pour analyse.",
        );
        setDialogAction("");
        fetchApplicationDetail();
        goToNextStep();
      } else {
        await api.patch(`/documents/${application._id}/verify`, {
          statut: "Refuse",
          commentaire: comment || "Non conforme",
        });

        await api.patch(`/applications/${application._id}/status`, {
          statut: "Refusee",
          commentaire: comment || "Documents non conformes",
        });

        setSuccess("Documents refusés - Candidature rejetée");
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

  const handleDownloadEngagement = async () => {
    try {
      const stageId = internship?._id || application._id;

      if (!stageId) {
        setError("ID du stage non trouvé");
        return;
      }

      const response = await api.get(
        `/internships/${stageId}/generate-engagement`,
        {
          responseType: "blob",
        },
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
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
      setError(
        error.response?.data?.message || "Erreur lors du téléchargement",
      );
    }
  };

  const handleValidateEngagement = async () => {
    setGenerating(true);
    try {
      const stageId = internship?._id || application._id;

      if (!stageId) {
        setError("ID du stage non trouvé");
        return;
      }

      await api.patch(`/internships/${stageId}/status`, {
        statut: "EngagementValide",
      });

      setSuccess("Engagement validé. Passez à l'étape Directeur.");
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
        statut: "EngagementRejete",
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

  const handleGenerateDemandeStage = async () => {
    setGenerating(true);
    try {
      const stageId = internship?._id || application._id;

      if (!stageId) {
        setError("ID du stage non trouvé");
        return;
      }

      const response = await api.get(
        `/internships/${stageId}/generate-demande-stage`,
        {
          responseType: "blob",
        },
      );

      const contentDisposition = response.headers["content-disposition"];
      let fileName = `Demande_Stage_Directeur_${application?.etudiantId?.prenom || ""}_${application?.etudiantId?.nom || ""}.pdf`;
      if (contentDisposition) {
        const match = contentDisposition.match(
          /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/,
        );
        if (match && match[1]) {
          fileName = match[1].replace(/['"]/g, "");
        }
      }

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      setDemandeStageFile({
        blob: blob,
        url: url,
        fileName: fileName,
      });

      setDemandeStagePath(`/uploads/demandes/demande_stage_${stageId}.pdf`);

      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      await api.patch(`/internships/${stageId}/status`, {
        statut: "DemandeEnvoyee",
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

  const handleViewDemandeStage = async () => {
    try {
      const stageId = internship?._id || application?._id;

      if (!stageId) {
        setError("ID du stage non trouvé");
        return;
      }

      if (
        internship?.statut !== "DemandeEnvoyee" &&
        internship?.statut !== "ValideParDirecteur"
      ) {
        setError("La demande de stage n'a pas encore été générée");
        return;
      }

      const response = await api.get(
        `/internships/${stageId}/generate-demande-stage`,
        {
          responseType: "blob",
        },
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      window.open(url, "_blank");

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 10000);
    } catch (error) {
      console.error("Erreur visualisation demande:", error);
      setError(
        error.response?.data?.message ||
          "Erreur lors de la visualisation de la demande",
      );
    }
  };

  const handleSendDemandeStageToStudent = async () => {
    setGenerating(true);
    try {
      const stageId = internship?._id || application._id;

      if (!stageId) {
        setError("ID du stage non trouvé");
        return;
      }

      await api.post(`/internships/${stageId}/send-demande-stage`);

      setSuccess("Demande de stage envoyée à l'étudiant avec succès !");
      setTimeout(() => setSuccess(""), 3000);
      fetchApplicationDetail();
    } catch (error) {
      console.error("Erreur envoi demande:", error);
      setError(error.response?.data?.message || "Erreur lors de l'envoi");
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateAttestation = async () => {
    setGenerating(true);
    try {
      const stageId = internship?._id || application._id;

      if (!stageId) {
        setError("ID du stage non trouvé");
        return;
      }

      await api.post(`/internships/${stageId}/generate-attestation`);
      setSuccess("Attestation de stage générée avec succès !");
      setTimeout(() => setSuccess(""), 3000);
      fetchApplicationDetail();
    } catch (error) {
      console.error("Erreur attestation:", error);
      setError(error.response?.data?.message || "Erreur lors de la génération");
    } finally {
      setGenerating(false);
    }
  };

  const handleValidateRapportRh = async (rapportId) => {
    setGenerating(true);
    try {
      const stageId = internship?._id || application._id;
      await api.put(
        `/internships/${stageId}/livrables/${rapportId}/validate-rh`,
        {
          valide: true,
        },
      );
      setSuccess(
        "Rapport validé par le RH. L'attestation peut maintenant être générée.",
      );
      await fetchApplicationDetail();
    } catch (error) {
      console.error("Erreur validation rapport RH:", error);
      setError(
        error.response?.data?.message || "Erreur lors de la validation RH",
      );
    } finally {
      setGenerating(false);
    }
  };

  // ============================================
  // FONCTIONS ATTESTATION
  // ============================================

  // Voir l'attestation (prévisualiser)
  const handleViewAttestation = async () => {
    if (!internship?._id) {
      setError("Aucun stage associé");
      return;
    }

    setAttestationViewLoading(true);
    try {
      const response = await api.get(
        `/internships/${internship._id}/attestation`,
        { responseType: 'blob' }
      );

      const blob = response.data instanceof Blob 
        ? response.data 
        : new Blob([response.data], { type: 'application/pdf' });
      
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => window.URL.revokeObjectURL(url), 5000);
      
      setSuccess("Attestation ouverte dans un nouvel onglet");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Erreur visualisation attestation:", error);
      setError(
        error.response?.data?.message || 
        "Erreur lors de la visualisation de l'attestation"
      );
    } finally {
      setAttestationViewLoading(false);
    }
  };

  // Envoyer l'attestation à l'étudiant par email
  const handleSendAttestationToStudent = async () => {
    if (!internship?._id) {
      setError("Aucun stage associé");
      return;
    }

    if (!internship?.etudiantId?.email) {
      setError("L'étudiant n'a pas d'adresse email");
      return;
    }

    setAttestationSendLoading(true);
    try {
      const response = await api.post(
        `/internships/${internship._id}/send-attestation`
      );
      
      setSuccess(
        response.data?.message || 
        "Attestation envoyée à l'étudiant avec succès"
      );
      setTimeout(() => setSuccess(""), 5000);
    } catch (error) {
      console.error("Erreur envoi attestation:", error);
      setError(
        error.response?.data?.message || 
        "Erreur lors de l'envoi de l'attestation"
      );
    } finally {
      setAttestationSendLoading(false);
    }
  };

  const steps = [
    { label: "Validation", description: "Documents & Acceptation" },
    { label: "Engagement", description: "Dépôt & Validation" },
    { label: "Directeur", description: "Demande de stage" },
    { label: "Clôture", description: "Rapport & Attestation" },
  ];

  // ============================================
  // RENDER STEP CONTENT
  // ============================================

  const renderStepContent = (step) => {
    const isAccepted = application?.statut === "Acceptee";
    const isRefused = application?.statut === "Refusee";
    const isEnAnalyse = application?.statut === "EnAnalyse";

    const isEngagementEnvoye =
      internship?.statut === "EngagementEnvoye" ||
      internship?.statut === "EnAttenteEngagement";
    const isEngagementRecu = internship?.statut === "EngagementRecu";
    const isEngagementValide = internship?.statut === "EngagementValide";
    const isEngagementRejete = internship?.statut === "EngagementRejete";
    const isDemandeEnvoyee =
      internship?.statut === "DemandeEnvoyee" ||
      internship?.statut === "ValideParDirecteur";
    const isCloturee =
      internship?.statut === "Cloturee" || internship?.statut === "Termine";

    const engagementLivrable = internship?.livrables?.find(
      (l) => l.nom === "Engagement Confidentialité Signé",
    );

    const rapportLivrable = internship?.livrables?.find(
      (l) => l.type === "Rapport",
    );

    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Vérifiez les documents de candidature. Une fois validés, la
              candidature sera transmise au département pour analyse.
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
                          py: 0.5,
                          borderBottom: "1px solid #f0f2f5",
                          "&:last-child": { borderBottom: "none" },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          {doc.isVerified ? (
                            <CheckCircle
                              sx={{ color: "#22c55e", fontSize: 16 }}
                            />
                          ) : (
                            <Pending sx={{ color: "#f59e0b", fontSize: 16 }} />
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

            {application?.statut === "Acceptee" ? (
              <Alert severity="success" sx={{ borderRadius: "8px", mt: 1 }}>
                Candidature acceptée - Stage en cours de création.
              </Alert>
            ) : application?.statut === "Refusee" ? (
              <Alert severity="error" sx={{ borderRadius: "8px", mt: 1 }}>
                Candidature refusée
                {application?.commentaire && `: ${application.commentaire}`}
              </Alert>
            ) : application?.statut === "EnAnalyse" ? (
              <Alert severity="info" sx={{ borderRadius: "8px", mt: 1 }}>
                Documents déjà validés - En attente de l'analyse du département.
              </Alert>
            ) : application?.statut === "Soumise" ? (
              <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                <ActionButton
                  variant="contained"
                  startIcon={<ThumbUp />}
                  onClick={() => handleOpenDialog("valider")}
                  disabled={generating}
                  sx={{
                    backgroundColor: "#22c55e",
                    "&:hover": { backgroundColor: "#16a34a" },
                  }}
                >
                  Valider les documents
                </ActionButton>
                <ActionButton
                  variant="contained"
                  startIcon={<ThumbDown />}
                  onClick={() => handleOpenDialog("refuser")}
                  disabled={generating}
                  sx={{
                    backgroundColor: "#ef4444",
                    "&:hover": { backgroundColor: "#dc2626" },
                  }}
                >
                  Refuser
                </ActionButton>
              </Box>
            ) : (
              <Alert severity="info" sx={{ borderRadius: "8px", mt: 1 }}>
                Statut : {application?.statut || "En cours de traitement"}
              </Alert>
            )}
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {isEngagementRecu || isEngagementValide || isEngagementRejete
                ? "L'étudiant a déposé l'engagement signé. Vérifiez-le et validez ou rejetez."
                : isEngagementEnvoye
                  ? "L'engagement a été envoyé à l'étudiant. En attente de son dépôt."
                  : "L'engagement sera envoyé à l'étudiant après validation de la candidature."}
            </Typography>

            {isEngagementEnvoye &&
              !isEngagementRecu &&
              !isEngagementValide &&
              !isEngagementRejete && (
                <Alert
                  severity="info"
                  sx={{ mt: 2, mb: 2, borderRadius: "8px" }}
                >
                  <Typography variant="body2">
                    <strong>Engagement envoyé automatiquement :</strong>{" "}
                    L'engagement de confidentialité a été envoyé à l'étudiant
                    par email suite à l'acceptation du département.
                  </Typography>
                </Alert>
              )}

            {engagementLivrable && (
              <Box sx={{ mb: 3 }}>
                <Alert
                  severity={
                    isEngagementRejete
                      ? "error"
                      : isEngagementValide
                        ? "success"
                        : "info"
                  }
                  sx={{ mb: 2, borderRadius: "8px" }}
                >
                  {isEngagementRejete
                    ? "Engagement rejeté. L'étudiant doit en déposer un nouveau."
                    : isEngagementValide
                      ? "Engagement validé. Passez à l'étape Directeur."
                      : "Engagement signé déposé par l'étudiant."}
                </Alert>

                <Paper
                  sx={{
                    p: 2,
                    borderRadius: "10px",
                    border: "1px solid #eef1f3",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <PictureAsPdf sx={{ color: "#ef4444", fontSize: 24 }} />
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {engagementLivrable.nom ||
                            "Engagement_Confidentialite_Signe.pdf"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Déposé le {formatDate(engagementLivrable.dateDepot)}
                        </Typography>
                        {isEngagementRejete && (
                          <Typography
                            variant="caption"
                            color="error"
                            display="block"
                          >
                            Rejeté
                          </Typography>
                        )}
                        {isEngagementValide && (
                          <Typography
                            variant="caption"
                            color="success.main"
                            display="block"
                          >
                            Validé
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <Tooltip title="Voir le document">
                      <IconButton
                        size="small"
                        onClick={() => {
                          const href = buildFileHref(engagementLivrable);
                          if (href) window.open(href, "_blank");
                          else setError("Impossible de visualiser ce document");
                        }}
                        sx={{ color: "#2d3748" }}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Paper>
              </Box>
            )}

            {!isEngagementValide && !isEngagementRejete && isEngagementRecu && (
              <Box sx={{ display: "flex", gap: 2, mt: 2, flexWrap: "wrap" }}>
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
                <Alert severity="success" sx={{ borderRadius: "8px" }}>
                  Engagement validé. Passez à l'étape "Directeur".
                </Alert>
                <ActionButton
                  variant="contained"
                  onClick={goToNextStep}
                  sx={{
                    backgroundColor: "#148aa0",
                    "&:hover": { backgroundColor: "#0b7890" },
                    mt: 2,
                  }}
                >
                  Passer à l'étape Directeur
                </ActionButton>
              </Box>
            )}

            {isEngagementRejete && (
              <Box sx={{ mt: 2 }}>
                <Alert severity="error" sx={{ borderRadius: "8px" }}>
                  Engagement rejeté. L'étudiant doit en déposer un nouveau.
                </Alert>
              </Box>
            )}

            {!isEngagementRecu &&
              !isEngagementValide &&
              !isEngagementRejete &&
              !isEngagementEnvoye && (
                <Box sx={{ mt: 2 }}>
                  <Alert severity="info" sx={{ borderRadius: "8px" }}>
                    En attente de l'envoi de l'engagement...
                  </Alert>
                </Box>
              )}
          </Box>
        );

      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {isDemandeEnvoyee
                ? "La demande de stage a été générée. Vous pouvez la visualiser, la télécharger ou l'envoyer à l'étudiant."
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
                <Alert severity="success" sx={{ borderRadius: "8px", mb: 2 }}>
                  La demande de stage a été générée avec succès.
                </Alert>

                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 2 }}>
                  <ActionButton
                    variant="outlined"
                    startIcon={<Visibility />}
                    onClick={handleViewDemandeStage}
                    disabled={generating}
                    sx={{
                      borderColor: "#2d3748",
                      color: "#2d3748",
                    }}
                  >
                    Voir
                  </ActionButton>

                  <ActionButton
                    variant="outlined"
                    startIcon={<Download />}
                    onClick={handleGenerateDemandeStage}
                    disabled={generating}
                    sx={{
                      borderColor: "#148aa0",
                      color: "#148aa0",
                    }}
                  >
                    Télécharger
                  </ActionButton>

                  <ActionButton
                    variant="contained"
                    startIcon={<Send />}
                    onClick={handleSendDemandeStageToStudent}
                    disabled={generating}
                    sx={{
                      backgroundColor: "#22c55e",
                      "&:hover": { backgroundColor: "#16a34a" },
                    }}
                  >
                    {generating ? "Envoi..." : "Envoyer à l'étudiant"}
                  </ActionButton>
                </Box>

                <Alert severity="info" sx={{ mt: 2, borderRadius: "8px" }}>
                  <Typography variant="body2">
                    <strong>Prochaine étape :</strong> Après signature et cachet
                    du Directeur, passez à la clôture.
                  </Typography>
                </Alert>

                {activeStep === 2 && (
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

      // ============================================
      // ÉTAPE 4 : CLÔTURE - VERSION PROFESSIONNELLE (SANS REDONDANCE)
      // ============================================
      case 3:
        return (
          <Box sx={{ mt: 2 }}>
            {rapportLivrable ? (
              <Box>
                {/* === ALERT UNIQUE PAR ÉTAT === */}
                {rapportLivrable.statut === "ValideRH" && (
                  <Alert
                    severity="success"
                    sx={{
                      borderRadius: "8px",
                      mb: 2,
                      "& .MuiAlert-icon": { color: "#22c55e" },
                    }}
                  >
                    Rapport validé. L'attestation peut être générée.
                  </Alert>
                )}

                {rapportLivrable.statut === "ValideEncadrant" && (
                  <Alert
                    severity="warning"
                    sx={{
                      borderRadius: "8px",
                      mb: 2,
                      "& .MuiAlert-icon": { color: "#d97706" },
                    }}
                  >
                    Validation RH requise.
                  </Alert>
                )}

                {rapportLivrable.statut !== "ValideRH" &&
                  rapportLivrable.statut !== "ValideEncadrant" && (
                    <Alert
                      severity="info"
                      sx={{
                        borderRadius: "8px",
                        mb: 2,
                        "& .MuiAlert-icon": { color: "#1d4ed8" },
                      }}
                    >
                      Rapport déposé par l'étudiant. En attente de validation.
                    </Alert>
                  )}

                {/* === FICHIER DU RAPPORT === */}
                <Paper
                  sx={{
                    p: 2,
                    borderRadius: "10px",
                    border: "1px solid #eef1f3",
                    backgroundColor: "#fafbfc",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <PictureAsPdf sx={{ color: "#ef4444", fontSize: 24 }} />
                      <Box>
                        <Typography
                          variant="body2"
                          fontWeight={500}
                          color="#1a2332"
                        >
                          {rapportLivrable.nom || "Rapport_de_stage.pdf"}
                        </Typography>
                        <Typography variant="caption" color="#94a3b8">
                          Déposé le {formatDate(rapportLivrable.dateDepot)}
                          {rapportLivrable.statut === "ValideEncadrant" &&
                            " • Validé par l'encadrant"}
                          {rapportLivrable.statut === "ValideRH" &&
                            " • Validé par le RH"}
                        </Typography>
                      </Box>
                    </Box>
                    <Tooltip title="Voir le rapport">
                      <IconButton
                        size="small"
                        onClick={() => {
                          const href = buildFileHref(rapportLivrable);
                          if (href) window.open(href, "_blank");
                          else setError("Impossible de visualiser ce document");
                        }}
                        sx={{ color: "#687480" }}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Paper>

                {/* === BOUTONS D'ACTION === */}
                <Box sx={{ mt: 2 }}>
                  {/* Validation RH */}
                  {rapportLivrable.statut === "ValideEncadrant" && (
                    <ActionButton
                      variant="contained"
                      startIcon={<CheckCircle />}
                      onClick={() =>
                        handleValidateRapportRh(rapportLivrable._id)
                      }
                      disabled={generating}
                      sx={{
                        backgroundColor: "#22c55e",
                        "&:hover": { backgroundColor: "#16a34a" },
                      }}
                    >
                      {generating
                        ? "Validation en cours..."
                        : "Valider le rapport"}
                    </ActionButton>
                  )}

                  {/* Génération attestation */}
                  {rapportLivrable.statut === "ValideRH" && (
                    <Box>
                      {!internship?.attestationGeneree ? (
                        // Attestation non générée → Bouton Générer
                        <Box>
                          <Typography variant="body2" color="#065f46" sx={{ mb: 2 }}>
                            Le rapport est validé. L'attestation peut être générée.
                          </Typography>
                          <ActionButton
                            variant="contained"
                            startIcon={<Description />}
                            onClick={handleGenerateAttestation}
                            disabled={generating}
                            sx={{
                              backgroundColor: "#2d3748",
                              "&:hover": { backgroundColor: "#1a202c" },
                            }}
                          >
                            {generating ? "Génération en cours..." : "Générer l'attestation"}
                          </ActionButton>
                        </Box>
                      ) : (
                        // Attestation générée → Voir, Télécharger, Envoyer
                        <Box>
                          <Alert severity="success" sx={{ borderRadius: '8px', mb: 2 }}>
                            Attestation générée avec succès.
                          </Alert>
                          
                          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                            {/* Voir l'attestation */}
                            <ActionButton
                              variant="outlined"
                              startIcon={<Visibility />}
                              onClick={handleViewAttestation}
                              disabled={attestationViewLoading}
                              sx={{
                                borderColor: "#4f46e5",
                                color: "#4f46e5",
                                "&:hover": {
                                  borderColor: "#4338ca",
                                  backgroundColor: "rgba(79, 70, 229, 0.04)",
                                },
                              }}
                            >
                              {attestationViewLoading ? "Chargement..." : "Voir l'attestation"}
                            </ActionButton>

                            {/* Télécharger l'attestation */}
                            <ActionButton
                              variant="outlined"
                              startIcon={<Download />}
                              onClick={() => {
                                window.open(
                                  `/uploads/attestations/attestation_${internship._id}.pdf`,
                                  "_blank",
                                );
                              }}
                              sx={{
                                borderColor: "#2d3748",
                                color: "#2d3748",
                              }}
                            >
                              Télécharger
                            </ActionButton>

                            {/* Envoyer à l'étudiant */}
                            <ActionButton
                              variant="contained"
                              startIcon={<Send />}
                              onClick={handleSendAttestationToStudent}
                              disabled={attestationSendLoading || !internship?.etudiantId?.email}
                              sx={{
                                backgroundColor: "#0f766e",
                                "&:hover": { backgroundColor: "#115e59" },
                              }}
                            >
                              {attestationSendLoading ? "Envoi..." : "Envoyer à l'étudiant"}
                            </ActionButton>
                          </Box>

                          {internship?.etudiantId?.email && (
                            <Typography variant="caption" color="#94a3b8" sx={{ display: 'block', mt: 1 }}>
                              Envoyé à : {internship.etudiantId.email}
                            </Typography>
                          )}
                        </Box>
                      )}
                    </Box>
                  )}

                  {/* Clôture du stage */}
                  {rapportLivrable.statut === "ValideRH" &&
                    internship?.attestationGeneree && (
                      <Box sx={{ mt: 2 }}>
                        <ActionButton
                          variant="contained"
                          startIcon={<CheckCircle />}
                          onClick={async () => {
                            try {
                              const stageId =
                                internship?._id || application._id;
                              await api.patch(
                                `/internships/${stageId}/status`,
                                {
                                  statut: "Cloturee",
                                },
                              );
                              setSuccess("Stage clôturé avec succès");
                              fetchApplicationDetail();
                            } catch (error) {
                              console.error("Erreur clôture:", error);
                              setError(
                                error.response?.data?.message ||
                                  "Erreur lors de la clôture",
                              );
                            }
                          }}
                          sx={{
                            backgroundColor: "#0f766e",
                            "&:hover": { backgroundColor: "#115e59" },
                          }}
                        >
                          Clôturer le stage
                        </ActionButton>
                      </Box>
                    )}
                </Box>
              </Box>
            ) : (
              <Alert severity="info" sx={{ borderRadius: "8px" }}>
                L'étudiant n'a pas encore déposé son rapport de stage.
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

      {/* ===== WORKFLOW ===== */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <WorkflowCard>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 3 }}>
              Workflow de validation
            </Typography>

            <StyledStepper activeStep={activeStep} alternativeLabel nonLinear>
              {steps.map((step, index) => (
                <Step
                  key={step.label}
                  active={activeStep === index}
                  completed={index < maxStepReached}
                  onClick={() => handleStepClick(index)}
                  sx={{
                    cursor: index <= maxStepReached ? "pointer" : "default",
                    "&:hover": {
                      "& .MuiStepLabel-root": {
                        color: index <= maxStepReached ? "#2d3748" : "inherit",
                      },
                    },
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
                Étape {activeStep + 1} :{" "}
                {steps && steps.length > 0 && activeStep < steps.length
                  ? steps[activeStep].label
                  : "Chargement..."}
              </Typography>
              {steps && steps.length > 0 && activeStep < steps.length ? (
                renderStepContent(activeStep)
              ) : (
                <Alert severity="info" sx={{ borderRadius: "8px" }}>
                  Workflow en cours de chargement...
                </Alert>
              )}
            </Box>
          </WorkflowCard>
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
            Êtes-vous sûr de vouloir rejeter l'engagement de confidentialité de{" "}
            {student.prenom || ""} {student.nom || ""} ?
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
          {dialogAction === "valider" && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <ThumbUp sx={{ color: "#22c55e" }} /> Valider les documents
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
            {dialogAction === "valider" &&
              `Êtes-vous sûr de vouloir valider les documents de ${student.prenom || ""} ${student.nom || ""} ? La candidature sera transmise au département.`}
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
                dialogAction === "valider" ? "#22c55e" : "#ef4444",
              borderRadius: "10px",
              textTransform: "none",
              "&:hover": {
                backgroundColor:
                  dialogAction === "valider" ? "#16a34a" : "#dc2626",
              },
            }}
          >
            {generating
              ? "Traitement..."
              : dialogAction === "valider"
                ? "Valider"
                : "Refuser"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ApplicationDetail;