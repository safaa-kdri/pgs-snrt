// src/components/student/ApplicationDetail.jsx
// ✅ CORRECTION : 4 STATUTS SIMPLIFIÉS POUR L'ÉTUDIANT
// ✅ AJOUT : Tab Convention en dernier (si étudiant accepté)
// ✅ ORDRE : Engagement → Demande de stage → Convention → Pièces justificatives

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
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
  Divider,
  Tabs,
  Tab,
  Card,
  CardContent,
  TextField,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  ArrowBack,
  Description,
  CheckCircle,
  Pending,
  Download,
  Timeline,
  Upload,
  PictureAsPdf,
  InsertDriveFile,
  Visibility,
  Send,
  Check,
  Cancel,
  FileCopy,
  Assignment,
  Print,
  Receipt,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import { useAuth } from "../../hooks/useAuth";
import api from "../../services/api";

// ============================================
// STYLES
// ============================================

const DetailCard = styled(Paper)({
  borderRadius: "16px",
  padding: "24px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
  marginBottom: "24px",
});

const SectionTitle = styled(Typography)({
  fontSize: "18px",
  fontWeight: 700,
  color: "#1a2332",
  marginBottom: "16px",
  display: "flex",
  alignItems: "center",
  gap: "10px",
});

const StatusChip = styled(Chip)(({ status }) => {
  const getCategory = (s) => {
    const map = {
      Brouillon: "Brouillon",
      EnCoursCreation: "Brouillon",
      Soumise: "Soumise",
      EnAnalyse: "Soumise",
      Entretien: "Soumise",
      Acceptee: "En cours",
      EngagementEnvoye: "En cours",
      EngagementRecu: "En cours",
      EngagementValide: "En cours",
      EngagementRejete: "En cours",
      DemandeEnvoyee: "Acceptée",
      ValideParDirecteur: "Acceptée",
      Cloturee: "Acceptée",
      Termine: "Acceptée",
      EnCours: "Acceptée",
      Refusee: "Refusée",
    };
    return map[s] || s;
  };

  const category = getCategory(status);

  const colors = {
    Brouillon: { bg: "#e5e7eb", text: "#6b7280" },
    Soumise: { bg: "#dbeafe", text: "#1d4ed8" },
    "En cours": { bg: "#fef3c7", text: "#d97706" },
    Acceptée: { bg: "#d1fae5", text: "#065f46" },
    Refusée: { bg: "#fee2e2", text: "#991b1b" },
  };
  const color = colors[category] || colors["Soumise"];
  return {
    backgroundColor: color.bg,
    color: color.text,
    fontWeight: 600,
    fontSize: "12px",
    height: "28px",
    padding: "0 14px",
  };
});

const StyledTabs = styled(Tabs)({
  "& .MuiTabs-indicator": {
    backgroundColor: "#148aa0",
    height: "3px",
  },
});

const StyledTab = styled(Tab)({
  textTransform: "none",
  fontWeight: 600,
  fontSize: "15px",
  fontFamily: "Inter, sans-serif",
  minHeight: "48px",
  "&.Mui-selected": {
    color: "#148aa0",
  },
});

const DocumentCard = styled(Paper)({
  padding: "16px 20px",
  borderRadius: "12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  border: "1px solid #eef1f3",
  marginBottom: "12px",
  "&:hover": {
    backgroundColor: "#fafbfc",
  },
});

const StyledUploadZone = styled(Box)({
  border: "2px dashed #d1d5db",
  borderRadius: "12px",
  padding: "32px 20px",
  textAlign: "center",
  cursor: "pointer",
  transition: "all 0.3s ease",
  backgroundColor: "#fafafa",
  "&:hover": {
    borderColor: "#148aa0",
    backgroundColor: "#f7fbfc",
  },
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const ApplicationDetailStudent = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState(null);
  const [internship, setInternship] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const [engagementFile, setEngagementFile] = useState(null);
  const [engagementDepose, setEngagementDepose] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadType, setUploadType] = useState("convention");
  const [demandeStageFile, setDemandeStageFile] = useState(null);
  const [demandeStagePath, setDemandeStagePath] = useState(null);

  // ✅ ÉTAT POUR LA CONVENTION
  const [convention, setConvention] = useState(null);
  const [conventionStatus, setConventionStatus] = useState(null);
  const [conventionLoading, setConventionLoading] = useState(false);

  // ✅ Vérifier si l'engagement doit être affiché
  const isEngagementVisible =
    internship?.statut === "EngagementEnvoye" ||
    internship?.statut === "EngagementRecu" ||
    internship?.statut === "EngagementValide" ||
    internship?.statut === "EnAttenteEngagement" ||
    internship?.statut === "DemandeEnvoyee" ||
    internship?.statut === "ValideParDirecteur" ||
    internship?.statut === "Cloturee" ||
    internship?.statut === "Termine" ||
    internship?.statut === "EnCours";

  // ✅ Vérifier si la demande de stage est disponible
  const isDemandeStageVisible =
    internship?.statut === "DemandeEnvoyee" ||
    internship?.statut === "ValideParDirecteur" ||
    internship?.statut === "Cloturee" ||
    internship?.statut === "Termine";

  // ✅ Vérifier si l'étudiant est accepté (pour afficher la convention)
  const isAccepted =
    internship?.statut === "Acceptee" ||
    internship?.statut === "EnCours" ||
    internship?.statut === "EngagementEnvoye" ||
    internship?.statut === "EngagementRecu" ||
    internship?.statut === "EngagementValide" ||
    internship?.statut === "DemandeEnvoyee" ||
    internship?.statut === "ValideParDirecteur" ||
    internship?.statut === "Cloturee" ||
    internship?.statut === "Termine";

  useEffect(() => {
    fetchApplicationDetail();
  }, [id]);

  // ✅ Récupérer le statut de la convention
  useEffect(() => {
    if (isAccepted && internship?._id) {
      fetchConventionStatus();
    }
  }, [internship, isAccepted]);

  // ============================================
  // ✅ FETCH CONVENTION STATUS
  // ============================================
  const fetchConventionStatus = async () => {
    setConventionLoading(true);
    try {
      const response = await api.get('/internships/convention/status');
      const data = response.data?.data;
      if (data) {
        setConvention(data);
        setConventionStatus(data.statut || null);
      }
    } catch (error) {
      console.error('❌ Erreur chargement convention:', error);
    } finally {
      setConventionLoading(false);
    }
  };

  // ============================================
  // ✅ FETCH APPLICATION DETAIL
  // ============================================
  const fetchApplicationDetail = async () => {
    setLoading(true);
    setError("");
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

            const engagementLivrable = stageRes.data.data.livrables?.find(
              (l) => l.nom === "Engagement Confidentialité Signé",
            );

            if (engagementLivrable) {
              setEngagementDepose(true);
              setEngagementFile({
                ...engagementLivrable,
                nomOriginal:
                  engagementLivrable.nom ||
                  "Engagement_Confidentialite_Signe.pdf",
                dateDepot: engagementLivrable.dateDepot,
              });
            }

            if (
              stageRes.data.data.statut === "DemandeEnvoyee" ||
              stageRes.data.data.statut === "ValideParDirecteur" ||
              stageRes.data.data.statut === "Cloturee" ||
              stageRes.data.data.statut === "Termine"
            ) {
              setDemandeStagePath(
                `/uploads/demandes/demande_stage_${stageRes.data.data._id}.pdf`,
              );
            }
          }
        } catch (e) {
          console.warn("⚠️ Erreur récupération stage:", e.message);
        }
      }

      if (data.documents?.length > 0 && typeof data.documents[0] === "string") {
        const docDetails = await Promise.all(
          data.documents.map(async (docId) => {
            try {
              const docRes = await api.get(`/documents/${docId}`);
              return docRes.data.data;
            } catch (e) {
              return null;
            }
          }),
        );
        data.documents = docDetails.filter((d) => d);
      }

      setApplication(data);
    } catch (error) {
      console.error("❌ Erreur chargement:", error);
      setError(error.response?.data?.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // ✅ FONCTIONS DEMANDE DE STAGE
  // ============================================
  const handleViewDemandeStage = async () => {
    try {
      const stageId = internship?._id;
      if (!stageId) {
        setError("ID du stage non trouvé");
        return;
      }

      const response = await api.get(
        `/internships/${stageId}/download-demande-stage`,
        { responseType: "blob" },
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => window.URL.revokeObjectURL(url), 10000);
    } catch (error) {
      console.error("❌ Erreur visualisation demande:", error);
      setError(
        error.response?.data?.message ||
          "Erreur lors de la visualisation de la demande",
      );
    }
  };

  const handleDownloadDemandeStage = async () => {
    try {
      const stageId = internship?._id;
      if (!stageId) {
        setError("ID du stage non trouvé");
        return;
      }

      const response = await api.get(
        `/internships/${stageId}/download-demande-stage`,
        { responseType: "blob" },
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Demande_Stage_${application?.etudiantId?.prenom || ""}_${application?.etudiantId?.nom || ""}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess("Demande de stage téléchargée avec succès");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("❌ Erreur téléchargement demande:", error);
      setError(
        error.response?.data?.message ||
          "Erreur lors du téléchargement de la demande",
      );
    }
  };

  // ============================================
  // ✅ FONCTIONS ENGAGEMENT
  // ============================================
  const handleDownloadEngagement = async () => {
    try {
      const stageId = internship?._id;
      if (!stageId) {
        setError("ID du stage non trouvé");
        return;
      }

      const response = await api.get(
        `/internships/${stageId}/generate-engagement`,
        { responseType: "blob" },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = "Engagement_Confidentialite_SNRT.pdf";
      link.click();
      window.URL.revokeObjectURL(url);

      setSuccess("Engagement de confidentialité téléchargé");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Erreur téléchargement engagement:", error);
      setError("Erreur lors du téléchargement de l'engagement");
    }
  };

  const handleUploadEngagement = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("document", selectedFile);

      const stageId = internship?._id;
      if (!stageId) {
        setError("ID du stage non trouvé");
        setUploading(false);
        return;
      }

      const response = await api.post(
        `/internships/${stageId}/upload-engagement`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      if (response.data?.success) {
        setSuccess("Engagement déposé avec succès !");
        setEngagementDepose(true);
        setEngagementFile({
          ...response.data.data,
          nomOriginal: selectedFile.name,
          dateDepot: new Date(),
        });
        setOpenDialog(false);
        setSelectedFile(null);
        await fetchApplicationDetail();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (error) {
      console.error("❌ Erreur upload engagement:", error);
      setError(
        error.response?.data?.message || "Erreur lors du dépôt de l'engagement",
      );
    } finally {
      setUploading(false);
    }
  };

  // ============================================
  // ✅ FONCTIONS CONVENTION
  // ============================================
  const handleDownloadConventionSignee = async () => {
    try {
      setConventionLoading(true);
      const response = await api.get('/internships/convention/download', {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `Convention_Signee_${user?.nom || 'stage'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSuccess('Convention signée téléchargée !');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Erreur téléchargement convention signée:', error);
      setError('Erreur lors du téléchargement de la convention signée');
    } finally {
      setConventionLoading(false);
    }
  };

  const handleFileSelectConvention = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setUploadType('convention');
      setOpenDialog(true);
    } else {
      setError('Veuillez sélectionner un fichier PDF');
    }
  };

  const handleUploadConvention = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('convention', selectedFile);

      const response = await api.post('/internships/convention/deposer', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data?.success) {
        setSuccess('✅ Convention déposée avec succès !');
        setOpenDialog(false);
        setSelectedFile(null);
        await fetchConventionStatus();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('❌ Erreur dépôt convention:', error);
      setError(error.response?.data?.message || 'Erreur lors du dépôt');
    } finally {
      setUploading(false);
    }
  };

  // ============================================
  // UTILITAIRES
  // ============================================
  const getStatusLabel = (status) => {
    const statusMap = {
      Brouillon: "Brouillon",
      EnCoursCreation: "Brouillon",
      Soumise: "Soumise",
      EnAnalyse: "Soumise",
      Entretien: "Soumise",
      Acceptee: "En cours",
      EngagementEnvoye: "En cours",
      EngagementRecu: "En cours",
      EngagementValide: "En cours",
      EngagementRejete: "En cours",
      DemandeEnvoyee: "Acceptée",
      ValideParDirecteur: "Acceptée",
      Cloturee: "Acceptée",
      Termine: "Acceptée",
      EnCours: "Acceptée",
      Refusee: "Refusée",
    };
    return statusMap[status] || status;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Non défini";
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
    if (doc.gridFsId) return `${apiRoot}/api/v1/documents/file/${doc.gridFsId}`;
    if (doc.url) return doc.url.startsWith("/") ? `${apiRoot}${doc.url}` : doc.url;
    if (doc.chemin) {
      let cleanPath = doc.chemin.replace(/^\.\//, '').replace(/^\//, '');
      return `${apiRoot}/${cleanPath}`;
    }
    return null;
  };

  const handleDownloadDocument = (doc) => {
    if (!doc) { setError("Document non trouvé"); return; }
    const href = buildFileHref(doc);
    if (href) window.open(href, "_blank");
    else setError("Impossible de télécharger ce document");
  };

  // ✅ RENDER CONVENTION
  const renderConvention = () => {
    const status = conventionStatus;

    if (conventionLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={32} sx={{ color: '#148aa0' }} />
        </Box>
      );
    }

    const isDeposable = !status || status === '';
    const canDownload = status === 'EnvoyeeEtudiant' || status === 'Cloturee';

    return (
      <Box>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, color: '#1a2332' }}>
          📄 Convention de stage
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Déposez votre convention de stage signée par votre établissement.
        </Typography>

        {status && (
          <Box sx={{ 
            mb: 3, 
            p: 2, 
            backgroundColor: '#f7f7f7', 
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}>
            <Typography variant="body2" fontWeight={500}>
              Statut :
            </Typography>
            <Chip
              label={getStatusConventionLabel(status)}
              size="small"
              sx={{
                backgroundColor: status === 'DeposeeEtudiant' ? '#fef3c7' : 
                                 status === 'SigneeRH' ? '#dbeafe' :
                                 status === 'EnvoyeeEtudiant' ? '#d1fae5' : '#d1fae5',
                color: status === 'DeposeeEtudiant' ? '#d97706' :
                       status === 'SigneeRH' ? '#1d4ed8' :
                       status === 'EnvoyeeEtudiant' ? '#065f46' : '#065f46',
                fontWeight: 500,
                fontSize: '12px',
              }}
            />
            {convention?.convention?.dateDepot && (
              <Typography variant="caption" color="text.secondary">
                Déposé le {formatDate(convention.convention.dateDepot)}
              </Typography>
            )}
          </Box>
        )}

        {isDeposable && (
          <>
            <StyledUploadZone
              onClick={() => document.getElementById('convention-upload')?.click()}
            >
              <input
                id="convention-upload"
                type="file"
                hidden
                accept=".pdf"
                onChange={handleFileSelectConvention}
              />
              <Upload sx={{ fontSize: 32, color: '#148aa0', mb: 1 }} />
              <Typography variant="body1" sx={{ color: '#1a2332', fontWeight: 500 }}>
                Déposez votre convention signée ici
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Format PDF • Taille max 5 Mo
              </Typography>
            </StyledUploadZone>

            <Alert severity="info" sx={{ mt: 2, borderRadius: '8px' }}>
              Assurez-vous que votre convention est signée par votre établissement avant de la déposer.
            </Alert>
          </>
        )}

        {status && status !== '' && (
          <Box sx={{ 
            p: 3, 
            backgroundColor: '#f0fdf4', 
            borderRadius: '12px', 
            textAlign: 'center',
            mt: 2,
          }}>
            <CheckCircle sx={{ fontSize: 40, color: '#22c55e', mb: 1 }} />
            <Typography variant="subtitle1" fontWeight={600} color="#065f46">
              {status === 'DeposeeEtudiant' && 'Convention déposée, en attente de signature RH'}
              {status === 'SigneeRH' && 'Convention signée par RH, en cours d\'envoi'}
              {status === 'EnvoyeeEtudiant' && 'Convention signée envoyée à l\'étudiant'}
              {status === 'Cloturee' && 'Convention clôturée'}
            </Typography>
            <Typography variant="body2" color="#065f46">
              {status === 'DeposeeEtudiant' && 'Le RH va signer votre convention prochainement.'}
              {status === 'SigneeRH' && 'Vous recevrez bientôt la convention signée.'}
              {status === 'EnvoyeeEtudiant' && 'Vous pouvez télécharger la convention signée ci-dessous.'}
              {status === 'Cloturee' && 'Le processus de convention est terminé.'}
            </Typography>
          </Box>
        )}

        {canDownload && (
          <Box sx={{ mt: 3, p: 3, backgroundColor: '#f0f7fa', borderRadius: '12px' }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1, color: '#1a2332' }}>
              📎 Convention signée disponible
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              La convention a été signée par le RH. Vous pouvez la télécharger.
            </Typography>
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={handleDownloadConventionSignee}
              disabled={conventionLoading}
              sx={{
                backgroundColor: '#148aa0',
                borderRadius: '8px',
                textTransform: 'none',
                '&:hover': { backgroundColor: '#0b7890' },
              }}
            >
              {conventionLoading ? <CircularProgress size={20} color="inherit" /> : 'Télécharger la convention signée'}
            </Button>
          </Box>
        )}

        <Divider sx={{ my: 3 }} />
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          <strong>📌 Format accepté :</strong> PDF uniquement • <strong>Taille max :</strong> 5 Mo
        </Typography>
      </Box>
    );
  };

  const getStatusConventionLabel = (status) => {
    const labels = {
      'DeposeeEtudiant': 'Déposée par l\'étudiant',
      'SigneeRH': 'Signée par RH',
      'EnvoyeeEtudiant': 'Envoyée à l\'étudiant',
      'Cloturee': 'Clôturée',
    };
    return labels[status] || status;
  };

  // ✅ RENDER DOCUMENTS
  const renderDocuments = () => {
    const documents = application?.documents || [];
    const hasPopulatedDocs = documents.length > 0 && documents[0]?.nomOriginal;

    if (documents.length === 0) {
      return (
        <Box sx={{ py: 4, textAlign: "center" }}>
          <Description sx={{ fontSize: 48, color: "#d1d5db" }} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Aucune pièce justificative déposée
          </Typography>
        </Box>
      );
    }

    if (!hasPopulatedDocs) {
      return (
        <Box sx={{ py: 4, textAlign: "center" }}>
          <Description sx={{ fontSize: 48, color: "#d1d5db" }} />
          <Typography variant="body2" color="text.secondary">
            {documents.length} pièce(s) justificative(s) déposée(s)
          </Typography>
        </Box>
      );
    }

    return (
      <List dense sx={{ p: 0 }}>
        {documents.map((doc, idx) => (
          <ListItem
            key={doc._id || idx}
            sx={{
              px: 0,
              py: 1.5,
              borderBottom: idx < documents.length - 1 ? "1px solid #f0f2f5" : "none",
              alignItems: "flex-start",
            }}
          >
            <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>
              {doc.isVerified ? (
                <CheckCircle sx={{ color: "#22c55e", fontSize: 20 }} />
              ) : (
                <Pending sx={{ color: "#f59e0b", fontSize: 20 }} />
              )}
            </ListItemIcon>
            <ListItemText
              primary={doc.nomOriginal || doc.nom || "Document"}
              secondary={
                <Typography variant="caption" color="text.secondary" display="block">
                  {cleanDocumentType(doc.type)} • {doc.isVerified ? "Validé" : "En attente"}
                </Typography>
              }
            />
            <Box sx={{ display: "flex", gap: 0.5 }}>
              <Tooltip title="Télécharger">
                <IconButton
                  size="small"
                  onClick={() => handleDownloadDocument(doc)}
                  sx={{ color: "#4f46e5" }}
                >
                  <Download fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </ListItem>
        ))}
      </List>
    );
  };

  // ✅ RENDER ENGAGEMENT
  const renderEngagement = () => {
    const stageStatut = internship?.statut || "EnCours";
    const isSent = isEngagementVisible;
    const hasEngagement = engagementDepose || engagementFile;

    return (
      <Box>
        {isSent && (
          <>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={handleDownloadEngagement}
              sx={{
                mb: 3,
                borderRadius: "8px",
                textTransform: "none",
                borderColor: "#148aa0",
                color: "#148aa0",
                fontWeight: 500,
                px: 3,
                py: 1,
                "&:hover": {
                  backgroundColor: "rgba(20, 138, 160, 0.04)",
                  borderColor: "#0b7890",
                },
              }}
            >
              Télécharger l'engagement de confidentialité
            </Button>

            <Divider sx={{ my: 3 }} />

            {hasEngagement ? (
              <Box>
                <Alert
                  severity="success"
                  sx={{
                    mb: 2,
                    borderRadius: "8px",
                    backgroundColor: "#d1fae5",
                    "& .MuiAlert-icon": { color: "#16a34a" },
                  }}
                >
                  <Typography variant="body2" color="#065f46">
                    Votre engagement de confidentialité a été déposé avec succès.
                  </Typography>
                </Alert>

                <DocumentCard>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <PictureAsPdf sx={{ color: "#ef4444", fontSize: 24 }} />
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {engagementFile?.nomOriginal || engagementFile?.nom || "Engagement_Confidentialite_Signe.pdf"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Déposé le {formatDate(engagementFile?.dateDepot || engagementFile?.createdAt || new Date())}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    <Tooltip title="Voir">
                      <IconButton
                        size="small"
                        onClick={() => {
                          const href = buildFileHref(engagementFile);
                          if (href) window.open(href, "_blank");
                          else setError("Impossible d'afficher ce document");
                        }}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Télécharger">
                      <IconButton
                        size="small"
                        onClick={() => {
                          const href = buildFileHref(engagementFile);
                          if (href) {
                            const link = document.createElement("a");
                            link.href = href;
                            link.download = engagementFile?.nomOriginal || engagementFile?.nom || "Engagement.pdf";
                            link.target = "_blank";
                            link.click();
                          } else setError("Impossible de télécharger");
                        }}
                        sx={{ color: "#4f46e5" }}
                      >
                        <Download fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </DocumentCard>
              </Box>
            ) : (
              <>
                <StyledUploadZone
                  onClick={() => document.getElementById("engagement-upload")?.click()}
                >
                  <input
                    id="engagement-upload"
                    type="file"
                    hidden
                    accept=".pdf"
                    onChange={(e) => handleFileSelect(e, "engagement")}
                  />
                  <Upload sx={{ fontSize: 32, color: "#9aa4ac" }} />
                  <Typography variant="body1" sx={{ mt: 1, color: "#1a2332", fontWeight: 500 }}>
                    Cliquez pour déposer le document signé
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ou glissez-déposez le fichier ici
                  </Typography>
                </StyledUploadZone>

                <Alert
                  severity="info"
                  sx={{ mt: 2, borderRadius: "8px", backgroundColor: "#f0f7fa" }}
                >
                  <Typography variant="body2" color="#1a2332">
                    Assurez-vous que le document est bien signé avant de le déposer.
                  </Typography>
                </Alert>
              </>
            )}
          </>
        )}

        {!isSent && (
          <Box sx={{ p: 3, textAlign: "center", backgroundColor: "#fafafa", borderRadius: "10px", border: "1px solid #eef1f3" }}>
            <Typography variant="body2" color="#687480">
              L'engagement de confidentialité n'a pas encore été envoyé par le service RH.
            </Typography>
          </Box>
        )}
      </Box>
    );
  };

  // ✅ RENDER DEMANDE DE STAGE
  const renderDemandeStage = () => {
    const isAvailable = isDemandeStageVisible;

    if (!isAvailable) {
      return (
        <Box sx={{ p: 3, textAlign: "center", backgroundColor: "#fafafa", borderRadius: "10px", border: "1px solid #eef1f3" }}>
          <Typography variant="body2" color="#687480">
            La demande de stage n'a pas encore été générée par le service RH.
          </Typography>
        </Box>
      );
    }

    return (
      <Box>
        <Card sx={{ p: 3, borderRadius: "12px", border: "1px solid #eef1f3", backgroundColor: "#fafbfc" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 3, flexWrap: "wrap" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
              <PictureAsPdf sx={{ color: "#ef4444", fontSize: 40 }} />
              <Box>
                <Typography variant="body1" fontWeight={600} color="#1a2332">
                  Demande de stage
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Document PDF généré par le service RH
                </Typography>
                {internship?.updatedAt && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    Généré le {formatDate(internship.updatedAt)}
                  </Typography>
                )}
              </Box>
            </Box>

            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<Visibility />}
                onClick={handleViewDemandeStage}
                sx={{ borderRadius: "8px", textTransform: "none", borderColor: "#2d3748", color: "#2d3748" }}
              >
                Voir
              </Button>
              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={handleDownloadDemandeStage}
                sx={{ borderRadius: "8px", textTransform: "none", backgroundColor: "#148aa0" }}
              >
                Télécharger
              </Button>
            </Box>
          </Box>
        </Card>
      </Box>
    );
  };

  // ============================================
  // DIALOG CONFIRMATION UPLOAD
  // ============================================
  const renderUploadDialog = () => (
    <Dialog
      open={openDialog}
      onClose={() => setOpenDialog(false)}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: "16px", padding: "8px" } }}
    >
      <DialogTitle>Confirmer le dépôt du document</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, py: 2 }}>
          <PictureAsPdf sx={{ color: "#ef4444", fontSize: 40 }} />
          <Box>
            <Typography variant="body1" fontWeight={600}>
              {selectedFile?.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {selectedFile && `${Math.round(selectedFile.size / 1024)} KB`}
            </Typography>
          </Box>
        </Box>
        {uploading && <LinearProgress sx={{ mt: 2, borderRadius: 4 }} />}
        <Alert severity="info" sx={{ mt: 2, borderRadius: "10px" }}>
          Vérifiez que le fichier est bien le document à déposer.
        </Alert>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button
          onClick={() => setOpenDialog(false)}
          sx={{ borderRadius: "10px", textTransform: "none" }}
          disabled={uploading}
        >
          Annuler
        </Button>
        <Button
          variant="contained"
          onClick={uploadType === "convention" ? handleUploadConvention : handleUploadEngagement}
          disabled={uploading}
          sx={{
            backgroundColor: "#148aa0",
            borderRadius: "10px",
            textTransform: "none",
            "&:hover": { backgroundColor: "#0b7890" },
          }}
        >
          {uploading ? "Dépôt en cours..." : "Déposer"}
        </Button>
      </DialogActions>
    </Dialog>
  );

  // ============================================
  // RENDER PRINCIPAL
  // ============================================

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <CircularProgress size={44} sx={{ color: "#148aa0" }} />
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
          onClick={() => navigate("/dashboard/applications")}
          sx={{ mt: 2, textTransform: "none" }}
        >
          Retour à la liste
        </Button>
      </Container>
    );
  }

  const displayStatus = internship?.statut || application?.statut || "Brouillon";
  const statusLabel = getStatusLabel(displayStatus);
  const documents = application.documents || [];

  // ✅ Définir les onglets disponibles dans l'ordre demandé
  const tabs = [];

  // 1️⃣ ONGLET ENGAGEMENT (si visible)
  if (isEngagementVisible) {
    tabs.push({
      label: "Engagement",
      icon: <Assignment sx={{ fontSize: 20 }} />,
    });
  }

  // 2️⃣ ONGLET DEMANDE DE STAGE (si visible)
  if (isDemandeStageVisible) {
    tabs.push({
      label: "Demande de stage",
      icon: <Print sx={{ fontSize: 20 }} />,
    });
  }

  // 3️⃣ ONGLET CONVENTION (si étudiant accepté) - AVANT PIÈCES JUSTIFICATIVES
  if (isAccepted) {
    tabs.push({
      label: "Convention",
      icon: <DescriptionIcon sx={{ fontSize: 20 }} />,
    });
  }

  // 4️⃣ ONGLET PIÈCES JUSTIFICATIVES (toujours en dernier)
  tabs.push({
    label: `Pièces justificatives (${documents.length})`,
    icon: <Description sx={{ fontSize: 20 }} />,
  });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/dashboard/applications")}
          sx={{ mb: 3, textTransform: "none", color: "#666" }}
        >
          Retour à la liste
        </Button>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#1a2332" }}>
            Suivi de candidature
          </Typography>
          <StatusChip label={statusLabel} status={displayStatus} />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {application.offreId?.titre || application.offre || "Offre sans titre"}
          {internship && internship.sujetTitre && (
            <Typography variant="caption" color="text.secondary" display="block">
              Stage: {internship.sujetTitre}
            </Typography>
          )}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: "10px" }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: "10px" }} onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      <Paper sx={{ borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", overflow: "hidden" }}>
        <StyledTabs
          value={tabValue}
          onChange={(e, v) => setTabValue(v)}
          sx={{ borderBottom: "1px solid #e5e7eb", px: 2 }}
        >
          {tabs.map((tab, index) => (
            <StyledTab key={index} icon={tab.icon} iconPosition="start" label={tab.label} />
          ))}
        </StyledTabs>

        <Box sx={{ p: 3 }}>
          {/* Engagement */}
          {tabs[tabValue]?.label === "Engagement" && renderEngagement()}

          {/* Demande de stage */}
          {tabs[tabValue]?.label === "Demande de stage" && renderDemandeStage()}

          {/* Convention */}
          {tabs[tabValue]?.label === "Convention" && renderConvention()}

          {/* Pièces justificatives */}
          {tabs[tabValue]?.label?.includes("Pièces justificatives") && renderDocuments()}
        </Box>
      </Paper>

      {renderUploadDialog()}
    </Container>
  );
};

export default ApplicationDetailStudent;